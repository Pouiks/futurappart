
import { DossierEngine } from './engine';
import { PersonRole, PersonStatus, NationalityGroup, GuarantorType } from '@prisma/client';

const engine = new DossierEngine();

function runTest(name: string, person: any, expectedRequired: string[]) {
    console.log(`\n--- TEST: ${name} ---`);
    console.log("Input:", JSON.stringify(person));

    const result = engine.getRequirements(person);
    console.log("Result Required:", result.required);
    console.log("Result OR Groups:", JSON.stringify(result.orGroups));

    // Simple assertion
    const missing = expectedRequired.filter(r => !result.required.includes(r as any));
    if (missing.length > 0) {
        console.error("❌ FAILED. Missing required docs:", missing);
    } else {
        console.log("✅ PASSED Core Requirements");
    }
}

// Case 1: Minor Applicant (Should be empty)
runTest("Minor Applicant", {
    role: PersonRole.APPLICANT,
    isMinor: true,
    status: PersonStatus.STUDENT,
    nationality: NationalityGroup.FR
}, []);

// Case 2: Standard Student Applicant (Identity + Enrollment)
runTest("Student Applicant FR", {
    role: PersonRole.APPLICANT,
    isMinor: false,
    status: PersonStatus.STUDENT,
    nationality: NationalityGroup.FR
}, ["IDENTITY", "STUDENT_ENROLLMENT"]);

// Case 3: Employee Applicant (Identity + Pro Proof + (Income OR Tax))
runTest("Employee Applicant", {
    role: PersonRole.APPLICANT,
    isMinor: false,
    status: PersonStatus.EMPLOYEE,
    nationality: NationalityGroup.FR
}, ["IDENTITY", "PROFESSIONAL_STATUS_PROOF"]); // Income/Tax is in OR Group

// Case 4: NON_EU Student (Identity + Enrollment + Residency)
runTest("Non-EU Student", {
    role: PersonRole.APPLICANT,
    isMinor: false,
    status: PersonStatus.STUDENT,
    nationality: NationalityGroup.NON_EU
}, ["IDENTITY", "STUDENT_ENROLLMENT", "RESIDENCY_RIGHT"]);

// Case 5: Guarantor Organism (Ex: Visale) -> Only Certificate
runTest("Guarantor Organism", {
    role: PersonRole.GUARANTOR,
    guarantorType: GuarantorType.ORGANISM,
    status: PersonStatus.OTHER, // Irrelevant
    nationality: NationalityGroup.FR,
    isMinor: false
}, ["GUARANTEE_CERTIFICATE"]);
