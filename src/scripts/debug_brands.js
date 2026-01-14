const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUnassigned() {
    const residences = await prisma.canonResidence.findMany({
        where: { brandId: null },
        take: 5,
        select: { id: true, name: true, sourceId: true }
    });
    console.log("Unassigned Residences Sample:", JSON.stringify(residences, null, 2));

    const brands = await prisma.brand.findMany({ select: { name: true } });
    console.log("Available Brands:", JSON.stringify(brands.map(b => b.name), null, 2));
}

checkUnassigned()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
