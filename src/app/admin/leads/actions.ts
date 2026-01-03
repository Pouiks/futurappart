'use server';

import { prisma } from '@/lib/db';
import { startOfDay, subDays, endOfDay, parseISO } from 'date-fns';

/**
 * FETCH: Lead Stats by Partner (Brand) & Residence
 * Grouping: Leads (SubscriptionRequest) -> Unit (CanonUnit) -> Residence (CanonResidence)
 */
export async function getLeadsReport(filter: {
    startDate?: string,
    endDate?: string,
    partnerId?: string, // sourceId
    search?: string
}) {
    // 1. Date Logic
    let dateFilter: any = {};
    if (filter.startDate && filter.endDate) {
        dateFilter = {
            createdAt: {
                gte: startOfDay(parseISO(filter.startDate)),
                lte: endOfDay(parseISO(filter.endDate))
            }
        };
    } else {
        // Default: Last 30 days
        dateFilter = {
            createdAt: { gte: subDays(new Date(), 30) }
        };
    }

    // 2. Search Logic (Pre-filter Units)
    let unitIdsFilter: string[] | undefined = undefined;

    if (filter.search) {
        // Find units belonging to residences matching the search OR source matching search
        const searchLower = filter.search.toLowerCase();

        const matchingUnits = await prisma.canonUnit.findMany({
            where: {
                residence: {
                    OR: [
                        { name: { contains: filter.search, mode: 'insensitive' } },
                        { sourceId: { contains: filter.search, mode: 'insensitive' } }
                    ]
                }
            },
            select: { id: true }
        });

        unitIdsFilter = matchingUnits.map(u => u.id);
    }

    // 3. Fetch Requests with Relations
    const whereClause: any = {
        ...dateFilter
    };

    if (unitIdsFilter) {
        // If we have a search, restrict to these units
        // Note: This misses rows where unitId is invalid but 'residenceName' matches.
        // For robustness, we could also check residenceName contains search.
        whereClause.OR = [
            { unitId: { in: unitIdsFilter } },
            { residenceName: { contains: filter.search, mode: 'insensitive' } }
        ];
    }

    const requests = await prisma.subscriptionRequest.findMany({
        where: whereClause,
        include: {
            profile: {
                select: { email: true, firstName: true, lastName: true, phone: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // 4. Fetch Unit Details (for ALL fetched requests)
    // 3. Manual Aggregation (Prisma GroupBy is limited with relations)
    // We need to fetch Unit -> Residence details for each request to group them
    // Ideally we would include unit -> residence in the query above, BUT
    // 'unitId' in SubscriptionRequest is a string link to Staging/Canon.
    // Let's check schema: unitId maps to nothing in relation?
    // subscriptionRequest has: unitId String, residenceName String?
    // It does NOT have a relation to CanonUnit in the schema I saw?
    // Let's double check.
    // Schema says: unitId String @map("unit_id"), NO RELATION defined in the model SubscriptionRequest to Unit.
    // WAIT. This is a problem. We need to join manually or fetch unit details.

    // Efficient Strategy: Collect all unique unitIds, fetch their residence info, then map back.
    const unitIds = [...new Set(requests.map(r => r.unitId))];

    const units = await prisma.canonUnit.findMany({
        where: { id: { in: unitIds } },
        include: {
            residence: true
        }
    });

    // Map: unitId -> Residence
    const unitMap = new Map();
    units.forEach(u => unitMap.set(u.id, u.residence));

    // 5. Build Hierarchy: Partner (Source) -> Residence -> Leads
    const report: any = {};
    // Structure: { [sourceId]: { count: 0, residences: { [resName]: { count: 0, leads: [] } } } }

    for (const req of requests) {
        const residence = unitMap.get(req.unitId);

        // If no residence found (orphaned lead?), fallback
        const sourceId = residence?.sourceId || 'Unknown';
        const resName = residence?.name || req.residenceName || 'Résidence Inconnue';

        // Filter by Partner if requested
        if (filter.partnerId && sourceId !== filter.partnerId) continue;

        if (!report[sourceId]) {
            report[sourceId] = { id: sourceId, count: 0, residences: {} };
        }

        if (!report[sourceId].residences[resName]) {
            report[sourceId].residences[resName] = { name: resName, count: 0, leads: [] };
        }

        report[sourceId].count++;
        report[sourceId].residences[resName].count++;
        report[sourceId].residences[resName].leads.push({
            id: req.id,
            date: req.createdAt,
            user: req.profile,
            status: req.status
        });
    }

    // Convert to Array for easy frontend display
    const reportArray = Object.values(report).map((partner: any) => ({
        ...partner,
        residences: Object.values(partner.residences)
            .sort((a: any, b: any) => b.count - a.count)
    })).sort((a: any, b: any) => b.count - a.count);

    return reportArray;
}

export async function getPartners() {
    // Get unique sourceIds from CanonResidences
    // This assumes sourceId = Partner/Brand
    const partners = await prisma.canonResidence.findMany({
        select: { sourceId: true },
        distinct: ['sourceId']
    });
    return partners.map(p => p.sourceId);
}
