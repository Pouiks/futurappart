const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    const brands = await prisma.brand.findMany({
        include: {
            _count: {
                select: { residences: true }
            }
        }
    });

    console.log(`Brands Created: ${brands.length}`);
    brands.forEach(b => {
        console.log(`- ${b.name}: ${b._count.residences} residences`);
    });

    const unassigned = await prisma.canonResidence.count({
        where: { brandId: null }
    });
    console.log(`Unassigned Residences: ${unassigned}`);

    const sample = await prisma.canonResidence.findMany({
        take: 10,
        select: { name: true, brand: { select: { name: true } } }
    });

    console.log("Sample Residences:");
    sample.forEach(r => {
        console.log(`[${r.brand?.name || 'Unassigned'}] ${r.name}`);
    });

    await prisma.$disconnect();
}

verify().catch(console.error);
