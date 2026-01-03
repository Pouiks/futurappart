import 'dotenv/config';
import { processStagingToCanon } from '../core/ingestion';
import { prisma } from '../lib/db';

async function main() {
    console.log("Starting Staging -> Canon Promotion...");

    // 1. Get distinct batch IDs from staging
    const batches = await prisma.stagingUnit.groupBy({
        by: ['importBatchId'],
        _count: { _all: true }
    });

    console.log(`Found ${batches.length} batches.`);

    for (const b of batches) {
        await processStagingToCanon(b.importBatchId);
    }

    console.log("Promotion process complete.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
