
import { prisma } from '../lib/db';

async function main() {
    const userId = 'f5aec754-ae3b-4ce5-ab8f-ddfb4b17e436'; // ID from user logs

    console.log("Checking DB for user:", userId);

    const profile = await prisma.profile.findUnique({
        where: { id: userId },
        select: { id: true, birthdate: true, email: true }
    });
    console.log("---------------------------------------------------");
    console.log("PROFILE (Table: profiles)");
    console.log("ID:", profile?.id);
    console.log("Birthdate:", profile?.birthdate);
    console.log("Email:", profile?.email);

    const persons = await prisma.dossierPerson.findMany({
        where: { profileId: userId },
        select: { id: true, role: true, birthDate: true, firstName: true }
    });

    console.log("---------------------------------------------------");
    console.log("DOSSIER PERSONS (Table: dossier_persons)");
    persons.forEach(p => {
        console.log(`[${p.role}] ${p.firstName}`);
        console.log(`   ID: ${p.id}`);
        console.log(`   BirthDate: ${p.birthDate}`);
    });

    // FORCE UPDATE RAW
    console.log("---------------------------------------------------");
    console.log("ATTEMPTING RAW SQL UPDATE...");
    try {
        const result = await prisma.$executeRaw`
            UPDATE dossier_persons 
            SET birth_date = '1990-01-01'::date 
            WHERE id = ${'a156ef16-bfc2-4393-befa-7d032df53b64'}
        `;
        console.log("Raw Update Result:", result);
    } catch (e) {
        console.error("RAW UPDATE FAILED:", e);
    }

    // Verify after update
    const pAfter = await prisma.dossierPerson.findUnique({
        where: { id: 'a156ef16-bfc2-4393-befa-7d032df53b64' }
    });
    console.log("BirthDate After Raw Update:", pAfter?.birthDate);

    console.log("---------------------------------------------------");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
