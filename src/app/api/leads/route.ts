import { NextResponse } from 'next/server';
import { trackEvent } from '@/lib/tracking';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/db';
import { ResidenceStatus } from '@prisma/client';
import { emailService } from '@/lib/email';
import { getSignedDownloadUrl } from '@/lib/storage';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { unitId, firstName, lastName, email, phone, hasGuarantor, userId } = body; // Expect userId now if possible, or we resolve it via Profile email? 
        // Note: The lead form might need to push the userId if available. 
        // If not available (logged out?), we can't send the dossier easily.
        // Assuming the user is logged in to "Postuler", they must have a profile.

        // --- R1: ELIGIBILITY CHECK ---
        // Basic validation: user profile must be complete
        if (!unitId || !firstName || !lastName || !email || !phone) {
            return NextResponse.json(
                { error: 'PROFILE_INCOMPLETE', message: "Veuillez compléter votre dossier avant de postuler." },
                { status: 403 }
            );
        }

        // Fetch Unit, Residence & Partner Config (for fallback)
        const unit = await prisma.canonUnit.findUnique({
            where: { id: unitId },
            include: { residence: true }
        });

        if (!unit) {
            return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
        }

        const residence = unit.residence;
        const sessionId = request.headers.get('x-session-id') || uuidv4();

        // Fetch PartnerConfig for inheritance if needed
        let partnerConfig = null;
        if (!residence.notificationEmail && residence.status !== 'NON_PARTNER') {
            partnerConfig = await prisma.partnerConfig.findUnique({
                where: { sourceId: residence.sourceId }
            });
        }

        const effectiveEmail = residence.notificationEmail || partnerConfig?.defaultNotificationEmail;

        // --- R2: CAP VERIFICATION ---
        const capReached =
            (residence.leadCapDaily && residence.leadsSentToday >= residence.leadCapDaily) ||
            (residence.leadCapWeekly && residence.leadsSentThisWeek >= residence.leadCapWeekly);

        // --- R3: ROUTING DECISION MATRIX ---
        let action: 'REDIRECT' | 'EMAIL' = 'REDIRECT';
        let destination = residence.url;

        // Decision Logic
        if (residence.status === ResidenceStatus.NON_PARTNER || capReached) {
            action = 'REDIRECT';
            destination = residence.url;
        } else if ((residence.status === ResidenceStatus.PARTNER_EMAIL || residence.status === ResidenceStatus.PARTNER_SLA) && !capReached) {
            // Check if we actually have an email to send to
            if (effectiveEmail) {
                action = 'EMAIL';
                destination = effectiveEmail;
            } else {
                // Fallback to redirect if misconfigured
                console.warn(`[ROUTING] Residence ${residence.id} is PARTNER but has no effective email. Fallback to REDIRECT.`);
                action = 'REDIRECT';
                destination = residence.url;
            }
        }

        // --- EXECUTION ---

        if (action === 'EMAIL') {

            // 1. Fetch Full Dossier Data
            // We need to find the Profile ID. Ideally passed in body, or we search by email
            const profile = await prisma.profile.findFirst({
                where: { email: email }, // Assuming unique email provided matches profile
                include: {
                    dossierPersons: {
                        include: {
                            documents: true
                        }
                    }
                }
            }) as any;

            if (profile) {
                const applicant = profile.dossierPersons.find((p: any) => p.role === 'APPLICANT');
                const guarantors = profile.dossierPersons.filter((p: any) => p.role === 'GUARANTOR');

                if (applicant) {
                    // 2. Prepare Documents (Generate Signed URLs)
                    const documentLinks: any[] = [];

                    // Helper to process docs
                    const processDocs = async (personName: string, docs: any[]) => {
                        for (const doc of docs) {
                            if (doc.status === 'VALID' || true) { // Send all uploaded docs? Or only Valid? Let's send all for now.
                                const signedUrl = await getSignedDownloadUrl(doc.storagePath);
                                if (signedUrl) {
                                    documentLinks.push({
                                        type: `${doc.type} (${personName})`,
                                        filename: doc.filename,
                                        url: signedUrl
                                    });
                                }
                            }
                        }
                    };

                    await processDocs('Candidat', applicant.documents);
                    for (const g of guarantors) {
                        await processDocs(`Garant (${g.lastName})`, g.documents);
                    }

                    // 3. Send Email
                    const emailSent = await emailService.sendDossierEmail({
                        to: destination,
                        applicant: {
                            firstName: applicant.firstName,
                            lastName: applicant.lastName,
                            email: profile.email || email,
                            phone: applicant.phone || phone,
                            situation: applicant.status,
                            income: 0 // TODO: Add income to DossierPerson schema or Profile?
                        },
                        guarantors: guarantors.map((g: any) => ({
                            firstName: g.firstName,
                            lastName: g.lastName,
                            type: g.guarantorType || 'PHYSIQUE',
                            income: 0
                        })),
                        documents: documentLinks,
                        residenceName: residence.name,
                        unitType: unit.type
                    });

                    if (emailSent) {
                        console.log(`[EMAIL_SENT] To: ${destination} For: ${residence.name}`);
                        // Increment Counters (Atomic)
                        await prisma.canonResidence.update({
                            where: { id: residence.id },
                            data: {
                                leadsSentToday: { increment: 1 },
                                leadsSentThisWeek: { increment: 1 }
                            }
                        });
                    } else {
                        console.error('Failed to send email to partner');
                        // Fallback? Retain "EMAIL" action but notify error?
                    }

                } else {
                    console.warn('Applicant not found in profile, sending simple lead notification not supported yet');
                }
            } else {
                console.warn('Profile not found for email, cannot send dossier');
            }
        }

        // [TRACKING]
        trackEvent({
            eventType: 'request_routed' as any,
            sessionId,
            residenceId: residence.id,
            city: residence.cityNormalized,
            metadata: {
                action,
                status: residence.status,
                cap_reached: capReached,
                lead_type: 'qualified'
            }
        });

        // Return decision to Frontend for UI Feedback (Rule M)
        return NextResponse.json({
            success: true,
            action,
            destination: action === 'REDIRECT' ? destination : null, // Only send URL if redirecting
            residenceStatus: residence.status,
            slaDays: residence.slaDays,
            capReached
        });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
