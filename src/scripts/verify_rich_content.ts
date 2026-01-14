import { prisma } from '../lib/db';

async function main() {
    const units = await prisma.canonUnit.findMany({
        take: 5,
        where: {
            images: {
                isEmpty: false
            }
        },
        include: {
            residence: true
        }
    });

    console.log(`Found ${units.length} units with images.`);

    for (const u of units) {
        console.log(`--- Unit: ${u.type} @ ${u.residence.name} ---`);
        console.log(`Description: ${u.description?.substring(0, 50)}...`);
        console.log(`Amenities: ${JSON.stringify(u.amenities)}`);
        console.log(`Images: ${u.images.length} found. First: ${u.images[0]}`);
        console.log(`-----------------------------------------------`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
