
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCities() {
    console.log("--- Checking CanonResidences for Aix ---");
    const aixResidences = await prisma.canonResidence.findMany({
        where: {
            cityNormalized: { contains: 'aix' }
        },
        select: { id: true, name: true, cityNormalized: true, address: true }
    });
    console.log(`Found ${aixResidences.length} residences in Aix:`);
    aixResidences.forEach(r => console.log(`- [${r.cityNormalized}] ${r.name}`));

    console.log("\n--- Checking CityContent for Aix ---");
    const aixContent = await prisma.cityContent.findUnique({
        where: { slug: 'aix-en-provence' }
    });
    console.log("CityContent for 'aix-en-provence':", aixContent ? "EXISTS" : "MISSING");

    if (!aixContent) {
        console.log("Attempting to search for similar slugs...");
        const allCities = await prisma.cityContent.findMany({ select: { slug: true } });
        console.log("Available CityContent slugs:", allCities.map(c => c.slug).join(", "));
    }
}

checkCities()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
