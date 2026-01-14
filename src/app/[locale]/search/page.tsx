
import { prisma } from '@/lib/db';
import SearchClient from './SearchClient';

async function getAvailableCities() {
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
}

export default async function SearchPage() {
    const cities = await getAvailableCities();
    return <SearchClient cities={cities} />;
}
