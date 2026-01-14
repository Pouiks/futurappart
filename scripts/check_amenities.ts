
import { prisma } from '../src/lib/db';

async function main() {
    const units = await prisma.canonUnit.findMany({
        take: 50,
        select: { amenities: true }
    });

    const allAmenities = new Set<string>();
    units.forEach(u => {
        if (Array.isArray(u.amenities)) {
            u.amenities.forEach((a: any) => allAmenities.add(String(a)));
        }
    });

    console.log("Found Amenities:", Array.from(allAmenities));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
