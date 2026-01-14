import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ScoringService, UserCriteria } from '@/core/scoring';
import { AvailabilityEnum, UnitTypeEnum } from '@prisma/client';
import { demoUnits } from '@/lib/demoData';
import { trackEvent } from '@/lib/tracking';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Helper to safely convert Decimal or number to plain number
const toNumber = (val: any): number => {
    if (val && typeof val === 'object' && typeof val.toNumber === 'function') {
        return val.toNumber();
    }
    return Number(val);
};

const SearchSchema = z.object({
    city: z.string(),
    budgetMax: z.number(),
    minSurface: z.number().optional().default(0),
    types: z.array(z.nativeEnum(UnitTypeEnum)),
    availability: z.nativeEnum(AvailabilityEnum).optional(),
    priority: z.enum(['PRICE', 'SURFACE', 'BALANCE']).optional().default('BALANCE'),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const criteria = SearchSchema.parse(body);


        // 1. Normalize City
        const cityNormalized = criteria.city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");

        // [TRACKING] Search Submitted
        const sessionId = request.headers.get('x-session-id') || uuidv4(); // Best effort session ID
        // Note: In a real app we'd want a consistent session ID from middleware/cookies. 
        // For this API call, we'll accept a header or gen one to link events in this request context.

        // Non-blocking tracking
        trackEvent({
            eventType: 'search_submitted',
            sessionId,
            city: cityNormalized,
            metadata: {
                budget: criteria.budgetMax,
                types: criteria.types,
                priority: criteria.priority
            }
        });


        // 2. Fetch Candidates (Demo Mode Support)
        // If NEXT_PUBLIC_DEMO_MODE is true, use static mock data instead of DB query.
        const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
        let candidates;
        if (isDemo) {
            // Simple filter on mock units matching criteria
            candidates = demoUnits.filter(u => {
                const matchesCity = u.residence.cityNormalized === cityNormalized;
                const matchesPrice = u.price <= criteria.budgetMax;
                const matchesSurface = (u.surface ?? 0) >= criteria.minSurface;
                const matchesType = criteria.types.includes(u.type as any);
                return matchesCity && matchesPrice && matchesSurface && matchesType;
            });
        } else {
            console.log(`[SEARCH] Normalized City: '${cityNormalized}'`);
            console.log(`[SEARCH] Criteria:`, JSON.stringify(criteria));
            candidates = await prisma.canonUnit.findMany({
                where: {
                    residence: { cityNormalized: cityNormalized },
                    price: { lte: criteria.budgetMax },
                    surface: { gte: criteria.minSurface }, // Filter by min surface
                    type: { in: criteria.types },
                },
                include: {
                    residence: true
                }
            });
        }

        console.log(`[SEARCH] Candidates found: ${candidates.length}`);

        if (candidates.length === 0) {
            // Todo: Suggestions logic
            return NextResponse.json({ recommendations: [], others: [], meta: { count: 0, message: "No results" } });
        }

        // 3. Fetch Stats for Scoring
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const statsList = await prisma.cityStatsDaily.findMany({
            where: {
                cityNormalized: cityNormalized,
            },
            orderBy: { date: 'desc' }
        });

        const statsMap = new Map();
        for (const s of statsList) {
            if (!statsMap.has(s.unitType)) statsMap.set(s.unitType, s);
        }

        // Fallback: Compute stats dynamically if missing in DB
        // This is critical for cities/types that haven't been pre-processed
        if (statsMap.size === 0 || criteria.types.some(t => !statsMap.has(t))) {
            console.log(`[SEARCH] Stats missing for some types, computing ad-hoc stats...`);

            criteria.types.forEach(type => {
                if (statsMap.has(type)) return;

                const typeCandidates = candidates.filter(c => c.type === type);
                if (typeCandidates.length === 0) return;

                const prices = typeCandidates.map(c => c.price).sort((a, b) => a - b);
                const medianPrice = prices[Math.floor(prices.length / 2)];

                // Simple median logic for surface/priceM2
                const surfacable = typeCandidates.filter(c => toNumber(c.surface) > 0);
                let medianSurface = 0;
                let medianPriceM2 = 0;

                if (surfacable.length > 0) {
                    const surfaces = surfacable.map(u => toNumber(u.surface)).sort((a, b) => a - b);
                    medianSurface = surfaces[Math.floor(surfaces.length / 2)];
                    const m2Prices = surfacable.map(u => u.price / toNumber(u.surface)).sort((a, b) => a - b);
                    medianPriceM2 = m2Prices[Math.floor(m2Prices.length / 2)];
                }

                statsMap.set(type, {
                    medianPrice,
                    medianSurface,
                    medianPriceM2
                });
            });
        }

        // 4. Score Logic
        const scoredOptions = candidates.map(unit => {
            const typeStats = statsMap.get(unit.type) || { medianPrice: null, medianPriceM2: null, medianSurface: null };

            const unitData = {
                id: unit.id,
                price: unit.price,
                surface: toNumber(unit.surface),
                priceM2: (toNumber(unit.surface) > 0) ? unit.price / toNumber(unit.surface) : null,
                availability: unit.availability ?? null,
                trustScore: unit.residence.trustScore || 50,
                residenceStatus: unit.residence.status as any, // Cast to any for compatibility
                cityStats: {
                    medianPrice: typeStats.medianPrice,
                    medianPriceM2: typeStats.medianPriceM2,
                    medianSurface: typeStats.medianSurface
                }
            };

            const result = ScoringService.score(unitData, { priority: criteria.priority as any });

            return {
                ...unit,
                scoreResult: result
            };
        });

        // 5. Sort
        scoredOptions.sort((a, b) => b.scoreResult.totalScore - a.scoreResult.totalScore);

        // Helper to safe convert Decimal to number
        const safeNum = (val: any) => (val && typeof val.toNumber === 'function') ? val.toNumber() : val;

        const recommendations = scoredOptions.slice(0, 12).map(u => ({
            id: u.id,
            residenceName: u.residence.name,
            price: u.price,
            surface: safeNum(u.surface),
            type: u.type,
            score: u.scoreResult.totalScore,
            scoreDetails: u.scoreResult.details, // Pass details for tooltip
            reasons: u.scoreResult.reasons,
            url: u.residence.url,
            photo: (u.images && u.images.length > 0) ? u.images[0] : (u.residence.heroImageUrl || "https://placehold.co/600x400?text=Logement"),
            residenceId: u.residence.id
        }));

        const others = scoredOptions.slice(12, 40).map(u => ({
            id: u.id,
            residenceName: u.residence.name,
            price: u.price,
            surface: safeNum(u.surface), // safeNum might be needed here too if used later
            type: u.type,
            score: u.scoreResult.totalScore,
            scoreDetails: u.scoreResult.details // Pass details for tooltip
        }));

        // [TRACKING] Recommendation Shown (Top 3)
        // We track this asynchronously/non-blocking
        recommendations.slice(0, 3).forEach((rec, index) => {
            // Determine bucket for score
            const score = rec.score;
            let bucket = 'low';
            if (score >= 80) bucket = 'high';
            else if (score >= 50) bucket = 'medium';

            trackEvent({
                eventType: 'recommendation_shown',
                sessionId,
                residenceId: rec.residenceId,
                city: cityNormalized,
                metadata: {
                    rank: index + 1,
                    score_bucket: bucket,
                    unit_id: rec.id
                }
            });
        });

        // ... (previous code)

        // 6. Availability Stats for UX (Dynamic Bounds)
        // We aggregate stats for the WHOLE city to inform users about availability ranges
        const availabilityStats = await prisma.canonUnit.aggregate({
            where: {
                residence: { cityNormalized: cityNormalized }
            },
            _min: { price: true, surface: true },
            _max: { price: true, surface: true }
        });

        const safeMinSurface = availabilityStats._min.surface ? availabilityStats._min.surface.toNumber() : 0;
        const safeMaxSurface = availabilityStats._max.surface ? availabilityStats._max.surface.toNumber() : 60;

        return NextResponse.json({
            recommendations: recommendations,
            others: others,
            meta: {
                total: candidates.length,
                city: cityNormalized,
                cityStats: {
                    minPrice: availabilityStats._min.price || 300,
                    maxPrice: availabilityStats._max.price || 2000,
                    minSurface: safeMinSurface,
                    maxSurface: safeMaxSurface
                }
            }
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
