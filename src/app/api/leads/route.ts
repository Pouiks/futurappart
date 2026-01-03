import { NextResponse } from 'next/server';
// import { Resend } from 'resend'; 
// const resend = new Resend(process.env.RESEND_API_KEY);
import { trackEvent } from '@/lib/tracking';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/db';
import { ResidenceStatus } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { unitId, firstName, lastName, email, phone, hasGuarantor } = body;

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
            // Todo: Implement actual email sending via Resend/Nodemailer
            console.log(`[EMAIL_SENT] To: ${destination} For: ${residence.name}`);

            // Increment Counters (Atomic)
            await prisma.canonResidence.update({
                where: { id: residence.id },
                data: {
                    leadsSentToday: { increment: 1 },
                    leadsSentThisWeek: { increment: 1 }
                }
            });
        }

        // [TRACKING]
        trackEvent({
            eventType: 'request_routed',
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
