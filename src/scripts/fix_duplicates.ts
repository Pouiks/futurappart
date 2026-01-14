
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicates() {
    console.log('Checking for duplicate APPLICANTS...');

    // Find all profiles with multiple APPLICANTS
    // This is hard to do in one query with Prisma, so we'll fetch profiles and iterate (assuming reasonable volume for this cleanup)
    // Or we can use raw query.
    // Let's iterate for safety and simplicity in this context.

    const profiles = await prisma.profile.findMany({
        include: {
            dossierPersons: {
                where: { role: 'APPLICANT' },
                orderBy: { createdAt: 'asc' },
                include: { documents: true }
            }
        }
    });

    for (const profile of profiles) {
        if (profile.dossierPersons.length > 1) {
            console.log(`Profile ${profile.id} has ${profile.dossierPersons.length} applicants.`);

            // Keep the one with the most documents, or the oldest if tie
            const sortedByDocs = [...profile.dossierPersons].sort((a, b) => b.documents.length - a.documents.length);
            const winner = sortedByDocs[0];
            const losers = sortedByDocs.slice(1);

            console.log(`Winning Applicant: ${winner.id} (${winner.documents.length} docs)`);

            for (const loser of losers) {
                console.log(`Deleting duplicate applicant: ${loser.id}`);
                await prisma.userDocument.deleteMany({ where: { personId: loser.id } }); // Delete docs first if cascade not set
                await prisma.dossierPerson.delete({ where: { id: loser.id } });
            }
        }
    }

    console.log('Duplicate cleanup finished.');
}

fixDuplicates()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
