
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log("Checking Aix Units...");
    const units = await prisma.canonUnit.findMany({
        where: { residence: { cityNormalized: { contains: 'aix' } } },
        include: { residence: true },
        take: 5
    });

    console.log(`Found ${units.length} units matching 'aix'.`);
    units.forEach(u => {
        console.log(`Unit: ${u.id}`);
        console.log(`- Type: ${u.type}`);
        console.log(`- Price: ${u.price}`);
        console.log(`- Surface: ${u.surface}`);
    });
}
check().catch(console.error).finally(() => prisma.$disconnect());
