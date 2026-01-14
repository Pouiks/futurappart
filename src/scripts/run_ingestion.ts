import { processStagingToCanon } from '../core/ingestion';
import { prisma } from '../lib/db';

async function main() {
    // 1. Get the latest batch ID from staging
    const lastBatch = await prisma.stagingUnit.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { importBatchId: true }
    });

    if (!lastBatch) {
        console.error("No staging data found.");
        return;
    }

    console.log(`Found latest batch: ${lastBatch.importBatchId}`);

    // 2. Process
    await processStagingToCanon(lastBatch.importBatchId);

    console.log("Ingestion complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
