'use server';

import { prisma } from '@/lib/db';

export type DashboardStats = {
    totalSearches: number;
    totalLeads: number;
    totalClicks: number;
    totalViews: number;
    topCities: Array<{ city: string; count: number }>;
    leadEvolution: Array<{ date: string; count: number }>;
};

export async function getDashboardStats(): Promise<DashboardStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. KPI Counts (Parallel)
    const [searches, leads, clicks, views] = await Promise.all([
        prisma.event.count({
            where: {
                eventType: 'search_submitted',
                createdAt: { gte: thirtyDaysAgo }
            }
        }),
        prisma.event.count({
            where: {
                eventType: 'request_sent',
                createdAt: { gte: thirtyDaysAgo }
            }
        }),
        prisma.event.count({
            where: {
                eventType: 'cta_clicked',
                createdAt: { gte: thirtyDaysAgo }
            }
        }),
        prisma.event.count({
            where: {
                eventType: 'view_residence',
                createdAt: { gte: thirtyDaysAgo }
            }
        })
    ]);

    // 2. Leads Evolution (Group by Day)
    // Prisma grouping by date requires raw query or client-side processing for MVP
    // Let's use raw query for performance/simplicity
    const evolutionRaw = await prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM events
        WHERE event_type = 'request_sent'
          AND created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
    `;

    // Normalize evolution data
    const leadEvolution = (evolutionRaw as any[]).map((r: any) => ({
        date: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        count: typeof r.count === 'bigint' ? Number(r.count) : r.count
    }));

    // 3. Top Cities
    const topCitiesRaw = await prisma.event.groupBy({
        by: ['city'],
        where: {
            eventType: 'search_submitted',
            createdAt: { gte: thirtyDaysAgo },
            city: { not: null }
        },
        _count: {
            city: true
        },
        orderBy: {
            _count: {
                city: 'desc'
            }
        },
        take: 5
    });

    const topCities = topCitiesRaw.map(c => ({
        city: c.city || 'Inconnu',
        count: c._count.city
    }));

    return {
        totalSearches: searches,
        totalLeads: leads,
        totalClicks: clicks, // Conversion tracking
        totalViews: views,
        topCities,
        leadEvolution
    };
}
