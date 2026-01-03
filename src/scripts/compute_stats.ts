import 'dotenv/config';
import { prisma } from '../lib/db';
import { UnitTypeEnum } from '@prisma/client';

async function main() {
    console.log("Computing City Stats...");

    // 1. Get all unique cities
    const cities = await prisma.canonResidence.findMany({
        select: { cityNormalized: true },
        distinct: ['cityNormalized']
    });

    const cityNames = cities.map(c => c.cityNormalized);
    console.log(`Found ${cityNames.length} cities.`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const city of cityNames) {
        // For each type
        for (const type of Object.values(UnitTypeEnum)) {

            // Fetch units
            const units = await prisma.canonUnit.findMany({
                where: {
                    residence: { cityNormalized: city },
                    type: type,
                    price: { gt: 0 } // Exclude zero price
                },
                select: { price: true, surface: true }
            });

            if (units.length === 0) continue;

            // Calculate Medians
            const prices = units.map(u => u.price).sort((a, b) => a - b);
            const medianPrice = prices[Math.floor(prices.length / 2)];

            const surfacableUnits = units.filter(u => u.surface && u.surface.toNumber() > 0);
            let medianSurface = 0;
            let medianPriceM2 = 0;

            if (surfacableUnits.length > 0) {
                const surfaces = surfacableUnits.map(u => u.surface!.toNumber()).sort((a, b) => a - b);
                medianSurface = surfaces[Math.floor(surfaces.length / 2)];

                const m2Prices = surfacableUnits.map(u => u.price / u.surface!.toNumber()).sort((a, b) => a - b);
                medianPriceM2 = Math.floor(m2Prices[Math.floor(m2Prices.length / 2)]);
            }

            // Upsert Logic Replacement: Delete then Create
            // This avoids unique constraint matching issues with Dates in Prisma

            // 1. Delete existing for today
            await prisma.cityStatsDaily.deleteMany({
                where: {
                    cityNormalized: city,
                    unitType: type,
                    date: today
                }
            });

            // 2. Create new
            await prisma.cityStatsDaily.create({
                data: {
                    cityNormalized: city,
                    unitType: type,
                    date: today,
                    medianPrice,
                    medianSurface,
                    medianPriceM2,
                    countUnits: units.length
                }
            });
        }
    }

    console.log("Stats computation complete.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
