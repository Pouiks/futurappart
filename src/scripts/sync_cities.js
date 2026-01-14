
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncCities() {
    console.log("Fetching distinct cities from CanonResidences...");
    const residences = await prisma.canonResidence.findMany({
        select: { cityNormalized: true },
        distinct: ['cityNormalized']
    });

    const citySlugs = residences.map(r => r.cityNormalized).filter(c => c && c !== 'unknown');
    console.log(`Found ${citySlugs.length} distinct cities.`);

    let createdCount = 0;
    for (const slug of citySlugs) {
        const existing = await prisma.cityContent.findUnique({ where: { slug } });
        if (!existing) {
            console.log(`Creating missing CityContent for: ${slug}`);
            // Capitalize for Title
            const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            await prisma.cityContent.create({
                data: {
                    slug,
                    title,
                    subtitle: `Tout savoir sur le logement étudiant à ${title}`,
                    intro: `Découvrez nos offres de logement étudiant à ${title}.`
                }
            });
            createdCount++;
        }
    }

    console.log(`Sync Complete. Created ${createdCount} new city pages.`);
}

syncCities()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
