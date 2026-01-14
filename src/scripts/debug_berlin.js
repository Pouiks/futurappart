
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log("Checking Berlin Units...");
    const units = await prisma.canonUnit.findMany({
        where: { residence: { cityNormalized: { contains: 'berlin' } } },
        include: { residence: true },
        take: 5
    });

    console.log(`Found ${units.length} units matching 'berlin' in cityNormalized.`);

    if (units.length > 0) {
        units.forEach(u => {
            console.log(`Unit: ${u.id}`);
            console.log(`- Type: ${u.unitType}`);
            console.log(`- Price: ${u.price}`);
            console.log(`- Surface: ${u.surface}`);
            console.log(`- CityNormalized: ${u.cityNormalized}`);
        });
    } else {
        console.log("No units found. Checking CanonResidence...");
        const residences = await prisma.canonResidence.findMany({
            where: { cityNormalized: { contains: 'berlin' } }
        });
        console.log(`Found ${residences.length} residences matching 'berlin'.`);
        if (residences.length > 0) {
            console.log("First filtered residence:", residences[0]);
            // Check if units are attached to these residences
            const resUnits = await prisma.canonUnit.findMany({
                where: { residenceId: residences[0].id }
            });
            console.log(`Units for this residence: ${resUnits.length}`);
            if (resUnits.length > 0) console.log(resUnits[0]);
        }
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
