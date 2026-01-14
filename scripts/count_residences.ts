
import { prisma } from '../src/lib/db';

async function main() {
    const count = await prisma.canonResidence.count();
    console.log(`Total Residences: ${count}`);

    // Check duplicates on name
    const grouped = await prisma.canonResidence.groupBy({
        by: ['name'],
        _count: {
            id: true
        },
        having: {
            id: {
                _count: {
                    gt: 1
                }
            }
        }
    });
    console.log(`Residences with duplicate names: ${grouped.length}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
