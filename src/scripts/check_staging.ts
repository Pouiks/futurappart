import { prisma } from '../lib/db';

async function main() {
    console.log("Checking last 5 staging units...");
    const units = await prisma.stagingUnit.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    for (const u of units) {
        console.log(`--- Unit ${u.id} ---`);
        console.log(`Name: ${u.name}`);
        console.log(`City: ${u.cityRaw} (Norm: ${u.cityNormalized})`);
        console.log(`Type: ${u.unitType}`);
        console.log(`Availability: ${u.availability}`);
        console.log(`Price: ${u.priceMin}`);
        console.log(`Surface: ${u.surfaceMin}`);
        console.log(`Source ID: ${u.sourceId}`);
        console.log("--------------------");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
