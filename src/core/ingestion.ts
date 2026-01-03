import { prisma } from '../lib/db';
import { AvailabilityEnum, UnitTypeEnum } from '@prisma/client';

/**
 * Promotes data from Staging to Canonical tables.
 * Handles deduplication and snapshots.
 */
export async function processStagingToCanon(batchId: string) {
    console.log(`Processing batch ${batchId}...`);

    const records = await prisma.stagingUnit.findMany({
        where: { importBatchId: batchId }
    });

    for (const row of records) {
        if (!row.name || !row.cityNormalized) continue;

        const slug = `${row.cityNormalized}-${slugify(row.name)}-${shortHash(row.url)}`;

        // 1. Upsert Residence
        // Prisma upsert requires a unique constraint in 'where'
        // We have @@unique([sourceId, url]) in CanonResidence

        const residence = await prisma.canonResidence.upsert({
            where: {
                sourceId_url: {
                    sourceId: row.sourceId,
                    url: row.url
                }
            },
            update: {
                updatedAt: new Date(),
                // In a real app we might update price range here
            },
            create: {
                slug: slug, // Verify slug uniqueness policy separately or rely on DB constraint throw
                name: row.name,
                address: row.address,
                cityNormalized: row.cityNormalized,
                sourceId: row.sourceId,
                url: row.url,
                trustScore: 50
            }
        });

        // 2. Upsert Unit
        // We don't have a unique composite key for Unit in schema yet (UnitType + Residence)
        // For MVP, let's assume one unit per type per residence.
        // We need to fetch existing to emulate upsert if no unique key

        const type = row.unitType || UnitTypeEnum.UNKNOWN;

        // Check existence
        const existingUnit = await prisma.canonUnit.findFirst({
            where: {
                residenceId: residence.id,
                type: type
            }
        });

        if (existingUnit) {
            await prisma.canonUnit.update({
                where: { id: existingUnit.id },
                data: {
                    price: row.priceMin,
                    surface: row.surfaceMin,
                    availability: row.availability || AvailabilityEnum.UNKNOWN,
                    updatedAt: new Date()
                }
            });
        } else {
            await prisma.canonUnit.create({
                data: {
                    residenceId: residence.id,
                    type: type,
                    price: row.priceMin,
                    surface: row.surfaceMin,
                    availability: row.availability || AvailabilityEnum.UNKNOWN
                }
            });
        }
    }
}

function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function shortHash(text: string) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = (hash << 5) - hash + text.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(16);
}
