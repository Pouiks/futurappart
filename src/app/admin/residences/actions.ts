'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function searchResidences(query?: string) {
    const where: any = {};

    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { cityNormalized: { contains: query, mode: 'insensitive' } },
            { sourceId: { contains: query, mode: 'insensitive' } }
        ];
    }

    // 1. Fetch Residences
    const residences = await prisma.canonResidence.findMany({
        where,
        select: {
            id: true,
            name: true,
            address: true,
            cityNormalized: true,
            sourceId: true,
            notificationEmail: true,
            leadPrice: true,
            _count: {
                select: { units: true }
            }
        },
        orderBy: { name: 'asc' },
        take: 1000
    });

    // 2. Fetch Partner Configs (for found sources)
    const distinctSources = [...new Set(residences.map(r => r.sourceId))];
    const partnerConfigs = await prisma.partnerConfig.findMany({
        where: { sourceId: { in: distinctSources } }
    });

    const configMap = new Map();
    partnerConfigs.forEach(p => {
        configMap.set(p.sourceId, {
            price: p.defaultLeadPrice,
            email: p.defaultNotificationEmail
        });
    });

    // 3. Merge Data: Calculate Effective Price & Email
    const enrichedResidences = residences.map(r => {
        const config = configMap.get(r.sourceId) || { price: 0, email: null };
        const defaultPrice = config.price;
        const defaultEmail = config.email;

        const effectivePrice = r.leadPrice !== null ? r.leadPrice : defaultPrice;
        const effectiveEmail = r.notificationEmail || defaultEmail; // Residence email > Brand email

        return {
            ...r,
            defaultPrice,
            defaultEmail,
            isInherited: r.leadPrice === null,
            isEmailInherited: !r.notificationEmail && !!defaultEmail,
            effectivePrice,
            effectiveEmail
        };
    });

    return enrichedResidences;
}

export async function getPartnerConfigsSource() {
    // Get all unique sourceIds from Residences
    const sources = await prisma.canonResidence.findMany({
        select: { sourceId: true },
        distinct: ['sourceId']
    });

    const configs = await prisma.partnerConfig.findMany();
    const configMap = new Map();
    configs.forEach(c => configMap.set(c.sourceId, {
        price: c.defaultLeadPrice,
        email: c.defaultNotificationEmail
    }));

    return sources.map(s => {
        const conf = configMap.get(s.sourceId) || { price: 0, email: null };
        return {
            sourceId: s.sourceId,
            defaultPrice: conf.price,
            defaultEmail: conf.email
        };
    }).sort((a, b) => a.sourceId.localeCompare(b.sourceId));
}

export async function updatePartnerConfig(sourceId: string, price: number, email?: string) {
    await prisma.partnerConfig.upsert({
        where: { sourceId },
        update: {
            defaultLeadPrice: price,
            defaultNotificationEmail: email || null
        },
        create: {
            sourceId,
            defaultLeadPrice: price,
            defaultNotificationEmail: email || null
        }
    });
    revalidatePath('/admin/residences');
}

export async function updateResidenceConfig(id: string, data: { name?: string, address?: string, cityNormalized?: string, notificationEmail?: string, leadPrice?: number | null }) {
    await prisma.canonResidence.update({
        where: { id },
        data: {
            name: data.name,
            address: data.address,
            cityNormalized: data.cityNormalized,
            notificationEmail: data.notificationEmail || null,
            leadPrice: data.leadPrice // Can be null now
        }
    });

    revalidatePath('/admin/residences');
}

export async function deleteResidence(id: string) {
    await prisma.canonResidence.delete({
        where: { id }
    });
    revalidatePath('/admin/residences');
}
