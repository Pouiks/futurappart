require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUnassigned() {
    const brands = await prisma.brand.findMany();
    console.log(`Brands Count: ${brands.length}`);
    console.log("Brands:", brands.map(b => b.name).join(", "));

    const residences = await prisma.canonResidence.findMany({
        where: { brandId: null },
        select: { id: true, name: true, sourceId: true }
    });

    console.log(`Unassigned Residences: ${residences.length}`);

    // Group by sourceId
    const bySource = {};
    for (const r of residences) {
        if (!bySource[r.sourceId]) bySource[r.sourceId] = { count: 0, examples: [] };
        bySource[r.sourceId].count++;
        if (bySource[r.sourceId].examples.length < 3) bySource[r.sourceId].examples.push(r.name);
    }

    console.log("Distribution by SourceId:");
    console.log(JSON.stringify(bySource, null, 2));
}

checkUnassigned()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
