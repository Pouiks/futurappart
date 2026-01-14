
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSearchData() {
    console.log("--- Checking Search Data for 'Bordeaux' ---");

    // Simulate what the search API does
    const residences = await prisma.canonResidence.findMany({
        where: {
            OR: [
                { cityNormalized: { contains: 'bordeaux', mode: 'insensitive' } },
                { name: { contains: 'bordeaux', mode: 'insensitive' } }
            ]
        },
        select: {
            name: true,
            cityNormalized: true,
            units: {
                select: { id: true, type: true, price: true }
            }
        },
        take: 5
    });

    console.log(`Found ${residences.length} residences matching 'Bordeaux':`);
    residences.forEach(r => {
        console.log(`- Residence: "${r.name}" | City: "${r.cityNormalized}" | Units: ${r.units.length}`);
    });
}

checkSearchData()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
