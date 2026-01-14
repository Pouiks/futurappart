
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log("Checking 'Bruxelles'...");
    const r = await prisma.canonResidence.findFirst({
        where: { cityNormalized: { contains: 'bruxelle' } }
    });
    console.log(`- CanonResidence with 'bruxelle': ${r ? 'YES' : 'NO'} (${r?.cityNormalized})`);

    const c = await prisma.cityContent.findUnique({
        where: { slug: 'bruxelles' }
    });
    console.log(`- CityContent 'bruxelles': ${c ? 'YES' : 'NO'}`);
}
check().catch(console.error).finally(() => prisma.$disconnect());
