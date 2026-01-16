
import { prisma } from '../lib/db';

async function testLifecycle() {
    const userId = 'f5aec754-ae3b-4ce5-ab8f-ddfb4b17e436'; // Virginie's user ID
    const personId = 'a156ef16-bfc2-4393-befa-7d032df53b64'; // APPLICANT ID

    console.log("🚀 STARTING BIRTHDATE PERSISTENCE TEST");
    console.log("User:", userId);
    console.log("Person:", personId);

    // 1. INPUT SIMULATION
    // This matches exactly what the client sends (ISO String)
    const inputDate = "1995-12-25T00:00:00.000Z";
    const inputPayload = {
        id: personId,
        role: 'APPLICANT',
        firstName: 'Test',
        lastName: 'Script',
        email: 'test@script.com',
        phone: '0600000000',
        status: 'STUDENT',
        birthDate: inputDate, // <--- The problematic field
        profileId: userId
    };

    console.log("\n1. SIMULATING CLIENT PAYLOAD:", inputPayload);

    // 2. SERVER ACTION LOGIC SIMULATION
    // copying the logic from dossier.ts exactly

    // Sanitize birthDate: Ensure it's a Date object for Prisma
    let finalBirthDate: Date | null = null;
    if (inputPayload.birthDate) {
        const d = new Date(inputPayload.birthDate);
        if (!isNaN(d.getTime())) {
            finalBirthDate = d;
        }
    }
    console.log("   -> Parsed Date:", finalBirthDate);

    // 3. PERFORM UPDATE (Profile)
    console.log("\n2. UPDATING PROFILE...");
    await prisma.profile.update({
        where: { id: userId },
        data: {
            birthdate: finalBirthDate // Note lowercase 'd'
        }
    });
    console.log("   -> Profile Updated");

    // 4. PERFORM UPDATE (DossierPerson)
    console.log("\n3. UPDATING DOSSIER PERSON...");
    const updatePayload = {
        birthDate: finalBirthDate, // Note camelCase 'D'
        updatedAt: new Date()
    };

    await prisma.dossierPerson.update({
        where: { id: personId },
        data: updatePayload
    });
    console.log("   -> DossierPerson Updated");

    // 5. VERIFICATION (Read back)
    console.log("\n4. VERIFYING DATA (Reading back from DB)...");

    const profile = await prisma.profile.findUnique({ where: { id: userId } });
    const person = await prisma.dossierPerson.findUnique({ where: { id: personId } });

    console.log("   [DB] Profile.birthdate:", profile?.birthdate);
    console.log("   [DB] Person.birthDate: ", person?.birthDate);

    const success =
        profile?.birthdate?.toISOString().split('T')[0] === '1995-12-25' &&
        person?.birthDate?.toISOString().split('T')[0] === '1995-12-25';

    if (success) {
        console.log("\n✅ SUCCESS: Date persisted correctly in both tables.");
    } else {
        console.error("\n❌ FAILURE: Date mismatch or missing.");
    }
}

testLifecycle()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
