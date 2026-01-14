'use server';

import { prisma } from '@/lib/db';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export async function getBrandStats(period?: { month: number, year: number }) {
    // Default to current month if not specified
    const now = new Date();
    const targetDate = period
        ? new Date(period.year, period.month - 1, 1)
        : startOfMonth(now);

    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    // 1. Fetch All Brands with Residence Count
    const brands = await prisma.brand.findMany({
        include: {
            _count: {
                select: { residences: true }
            },
            residences: {
                select: { id: true }
            }
        },
        orderBy: { name: 'asc' }
    });

    // 2. Aggregate Views (Events) by Brand
    // Strategy: Fetch event counts grouped by residenceId, then sum up by Brand in JS
    // (Prisma doesn't support deep relation groupBy easily)

    // Get all relevant events for the period
    const viewCounts = await prisma.event.groupBy({
        by: ['residenceId'],
        where: {
            eventType: { in: ['view_residence', 'access_residence'] },
            createdAt: {
                gte: start,
                lte: end
            },
            residenceId: { not: null }
        },
        _count: {
            _all: true
        }
    });

    // Map residenceId -> View Count
    const viewsMap = new Map<string, number>();
    viewCounts.forEach(v => {
        if (v.residenceId) viewsMap.set(v.residenceId, v._count._all);
    });

    // 3. Aggregate Leads (Requests) by Brand
    // Complex join: Request -> Unit -> Residence -> Brand
    // We fetch requests for the period, select unitId
    const leads = await prisma.subscriptionRequest.findMany({
        where: {
            createdAt: {
                gte: start,
                lte: end
            }
        },
        select: {
            unitId: true,
            residenceName: true
        }
    });

    // We need to map unitId to ResidenceId
    // Optimization: We could cache Unit -> Residence mapping, but for now fetch needed units
    const unitIds = [...new Set(leads.map(l => l.unitId).filter(Boolean))];
    const units = await prisma.canonUnit.findMany({
        where: { id: { in: unitIds } },
        select: { id: true, residenceId: true }
    });

    const unitToResMap = new Map<string, string>();
    units.forEach(u => unitToResMap.set(u.id, u.residenceId));

    // Map residenceId -> Lead Count
    const leadsMap = new Map<string, number>();

    leads.forEach(l => {
        let resId = unitToResMap.get(l.unitId);
        // Fallback: if we can't link via Unit (e.g. deleted unit), we miss it unless we match name
        // MVP: Stick to ID linking
        if (resId) {
            leadsMap.set(resId, (leadsMap.get(resId) || 0) + 1);
        }
    });

    // 4. Consolidate Data per Brand
    const stats = brands.map(brand => {
        let totalViews = 0;
        let totalLeads = 0;

        // Sum up stats for all residences of this brand
        brand.residences.forEach(res => {
            totalViews += (viewsMap.get(res.id) || 0);
            totalLeads += (leadsMap.get(res.id) || 0);
        });

        return {
            id: brand.id,
            name: brand.name,
            residenceCount: brand._count.residences,
            views: totalViews,
            leads: totalLeads
        };
    });

    // Sort by Views descending
    return stats.sort((a, b) => b.views - a.views);
}
