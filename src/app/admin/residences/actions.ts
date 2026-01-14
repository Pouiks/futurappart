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
            brand: {
                select: { name: true }
            },
            _count: {
                select: { units: true }
            }
        },

        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        take: 5000
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
        // ... (existing logic)
        const config = configMap.get(r.sourceId) || { price: 0, email: null };
        const defaultPrice = config.price;
        const defaultEmail = config.email;

        const effectivePrice = r.leadPrice !== null ? r.leadPrice : defaultPrice;
        const effectiveEmail = r.notificationEmail || defaultEmail;

        return {
            ...r,
            brandName: r.brand?.name || null,
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

export async function getBrandsList() {
    return prisma.brand.findMany({
        orderBy: { name: 'asc' }
    });
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

export async function updateResidenceConfig(id: string, data: { name?: string, address?: string, cityNormalized?: string, notificationEmail?: string, leadPrice?: number | null, brandId?: string | null }) {
    await prisma.canonResidence.update({
        where: { id },
        data: {
            name: data.name,
            address: data.address,
            cityNormalized: data.cityNormalized,
            notificationEmail: data.notificationEmail || null,
            leadPrice: data.leadPrice,
            brandId: data.brandId || null
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

export async function autoAssignBrands() {
    // 1. Seed or Get Brands
    const defaultBrands = [
        'Colonies', 'Twenty Campus', 'Estudines', 'Artémisia', 'Nexity Studéa',
        'Hife', 'Bikube', 'Kley', 'Sharies', 'Cohabs', 'Lacasa', 'Omestay', 'MyHomies'
    ];
    let brands = await prisma.brand.findMany();

    if (brands.length === 0) {
        console.log("Seeding default brands...");
        for (const name of defaultBrands) {
            await prisma.brand.create({
                data: {
                    name,
                    slug: name.toLowerCase().replace(/ /g, '-').replace(/é/g, 'e').replace(/ü/g, 'u'),
                    contactEmail: 'contact@placeholder.com'
                }
            });
        }
        brands = await prisma.brand.findMany(); // Refresh list
    }

    // Ensure we have all default brands if some were missing (partial seed)
    // This is optional complexity, for now assumes if list > 0 it's fine.
    // Ideally we should upsert them but create is easier for start.

    const residences = await prisma.canonResidence.findMany({
        where: { brandId: null },
        select: { id: true, name: true, sourceId: true, url: true }
    });

    let count = 0;

    for (const res of residences) {
        const match = brands.find(b => {
            const brandName = b.name.toLowerCase();
            const brandSlug = b.slug.toLowerCase().replace(/-/g, ''); // e.g. twenty-campus -> twentycampus
            const brandParts = b.slug.split('-'); // ['twenty', 'campus']

            const resName = res.name.toLowerCase();
            const resSource = res.sourceId.toLowerCase();
            const resUrl = res.url.toLowerCase();

            // Check basics
            if (resName.includes(brandName)) return true;
            if (resSource.includes(brandName)) return true;

            // Check URL with slug or parts
            if (resUrl.includes(b.slug)) return true;
            if (resUrl.includes(brandSlug)) return true;

            return false;
        });

        if (match) {
            await prisma.canonResidence.update({
                where: { id: res.id },
                data: { brandId: match.id }
            });
            count++;
        }
    }

    revalidatePath('/admin/residences');
    return { count };
}
