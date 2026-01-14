
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    console.log("Fetching units with UNKNOWN type...");
    const units = await prisma.canonUnit.findMany({
        where: { type: 'UNKNOWN' },
        include: { residence: true }
    });

    console.log(`Found ${units.length} units to check.`);

    let updated = 0;

    for (const u of units) {
        let newType = null;
        const resName = u.residence.name.toLowerCase();

        // 1. Colonies -> COLIVING
        if (resName.includes('colonies')) {
            newType = 'COLIVING';
        }
        // 2. Surface < 18 -> STUDIO
        else if (u.surface && u.surface < 18) {
            newType = 'STUDIO';
        }
        else if (resName.includes('coloc') || resName.includes('coliving')) {
            if (resName.includes('coloc')) newType = 'COLOCATION';
            if (resName.includes('coliving')) newType = 'COLIVING';
        }

        if (newType) {
            await prisma.canonUnit.update({
                where: { id: u.id },
                data: { type: newType }
            });
            updated++;
            process.stdout.write(`.`); // Progress dot
        }
    }

    console.log(`\nUpdated ${updated} units.`);
}

fix().catch(console.error).finally(() => prisma.$disconnect());
