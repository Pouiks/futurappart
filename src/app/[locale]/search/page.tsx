
import { prisma } from '@/lib/db';
import SearchClient from './SearchClient';

async function getAvailableCities() {
    const isDemo = process.env.DEMO_MODE === 'true';

    // Fallback mocks
    const fallbackCities = [
        { slug: 'paris', title: 'Paris' },
        { slug: 'lyon', title: 'Lyon' },
        { slug: 'toulouse', title: 'Toulouse' },
        { slug: 'bordeaux', title: 'Bordeaux' },
        { slug: 'lille', title: 'Lille' },
        { slug: 'nantes', title: 'Nantes' }
    ];

    if (isDemo) {
        return fallbackCities;
    }

    try {
        const cities = await prisma.canonResidence.findMany({
            select: {
                cityNormalized: true
            },
            distinct: ['cityNormalized'],
            orderBy: {
                cityNormalized: 'asc'
            }
        });

        return cities
            .map(c => c.cityNormalized)
            .filter(Boolean)
            .map(city => ({
                slug: city,
                title: city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()
            }));
    } catch (error) {
        console.error("[SEARCH] Database unavailable, using fallback:", error);
        return fallbackCities;
    }
}

export default async function SearchPage() {
    const cities = await getAvailableCities();
    return <SearchClient cities={cities} />;
}
