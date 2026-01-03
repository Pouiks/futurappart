'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { CitySEO } from '@/data/cityContent';
import { Prisma } from '@prisma/client';

export type CityStatus = {
    slug: string;
    name: string;
    hasContent: boolean;
    residenceCount: number;
    lastUpdated: Date | null;
};

// 1. LIST: Auto-Discovery
export async function getAllCitiesStatus(): Promise<CityStatus[]> {
    // A. Get unique cities from CanonResidences
    const groupedResidences = await prisma.canonResidence.groupBy({
        by: ['cityNormalized'],
        _count: {
            id: true
        }
    });

    // B. Get configured contents
    const configuredContents = await prisma.cityContent.findMany({
        select: { slug: true, updatedAt: true, title: true }
    });

    // Map for quick lookup
    const contentMap = new Map(configuredContents.map(c => [c.slug, c]));

    // C. Merge
    const allCities: CityStatus[] = groupedResidences.map(g => {
        const slug = g.cityNormalized;
        const config = contentMap.get(slug);

        // Formatter name (simple capitalization)
        const name = slug
            .split('-')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

        return {
            slug,
            name,
            hasContent: !!config && !!config.title, // Basic check
            residenceCount: g._count.id,
            lastUpdated: config?.updatedAt || null
        };
    });

    return allCities.sort((a, b) => b.residenceCount - a.residenceCount);
}

// 2. READ: Get Content for Edit
export async function getCityContent(slug: string) {
    const data = await prisma.cityContent.findUnique({
        where: { slug }
    });
    return data;
}

// 3. WRITE: Save
export async function saveCityContent(slug: string, formData: Partial<CitySEO> & { heroImageUrl: string }) {

    // Transform flat structure to Prisma JSON
    // Note: In a real form we might pass the precise structure, here we map loosely for MVP

    const data: Prisma.CityContentCreateInput = {
        slug, // ID
        title: formData.title || `Étudier à ${slug}`,
        subtitle: formData.subtitle || '',
        intro: formData.intro || '',
        heroImageUrl: formData.heroImageUrl || null,
        price: formData.price || 0,

        transportJson: formData.transport as any,
        livingCostJson: formData.livingCost as any,
        neighborhoodsJson: formData.neighborhood_details as any,
        faqJson: formData.faq as any,
    };

    await prisma.cityContent.upsert({
        where: { slug },
        create: data,
        update: {
            ...data,
            slug: undefined // Cannot update ID
        }
    });

    revalidatePath(`/admin/villes`);
    revalidatePath(`/ville/${slug}`);
    return { success: true };
}
