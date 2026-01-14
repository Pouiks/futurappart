import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { trackEvent } from '@/lib/tracking';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from '@/lib/email';

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                },
            },
        }
    );

    // 1. Check Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { unitId } = body;

        if (!unitId) return NextResponse.json({ error: 'Missing unitId' }, { status: 400 });

        // 2. Check Profile Completeness
        const profile = await prisma.profile.findUnique({
            where: { id: user.id },
            include: { dossierPersons: true }
        });

        if (!profile) {
            // Should theoretically exist if signup flow worked, but handle edge case
            return NextResponse.json({ code: 'PROFILE_MISSING', message: 'Profile not found' }, { status: 400 });
        }

        // AUTO-HEAL: If Profile status is missing but Dossier Applicant has it, sync it.
        // This prevents users from being blocked if they filled the Dossier but Profile didn't sync.
        if (!profile.status) {
            const applicant = profile.dossierPersons.find(p => p.role === 'APPLICANT');
            if (applicant?.status) {
                await prisma.profile.update({
                    where: { id: user.id },
                    data: { status: applicant.status }
                });
                (profile as any).status = applicant.status; // Update local for check
            }
        }

        // Check required fields for subscription
        // Rule: Desired City, Budget, Housing Type (implicit if unit selected?), etc.
        // For MVP, checks: First Name, Last Name, Phone, Status.
        const required = ['firstName', 'lastName', 'phone', 'status'];
        const missing = required.filter(field => !profile[field as keyof typeof profile]);

        if (missing.length > 0) {
            return NextResponse.json({
                code: 'PROFILE_INCOMPLETE',
                missing,
                redirect: '/account/edit'
            }, { status: 400 });
        }

        // 3. Create Subscription Request
        // First fetch unit details to snapshot residence name
        const unit = await prisma.canonUnit.findUnique({
            where: { id: unitId },
            include: { residence: true }
        });

        if (!unit) return NextResponse.json({ error: 'Unit not found' }, { status: 404 });

        // 2b. DOSSIER SNAPSHOT
        // Fetch full dossier
        const dossierPersons = await prisma.dossierPerson.findMany({
            where: { profileId: user.id },
            include: { documents: true }
        });

        // Create Snapshot Record
        // We only snapshot if there are documents, but defining the logic to always snapshot is safer
        const snapshotContent = {
            capturedAt: new Date().toISOString(),
            persons: dossierPersons.map(p => ({
                id: p.id,
                role: p.role,
                firstName: p.firstName,
                lastName: p.lastName,
                documents: p.documents.map(d => ({
                    type: d.type,
                    filename: d.filename,
                    storagePath: d.storagePath,
                    mimeType: d.mimeType,
                    size: d.size
                }))
            }))
        };

        const snapshot = await prisma.leadDocumentSnapshot.create({
            data: {
                content: snapshotContent ?? {}
            }
        });

        const sub = await prisma.subscriptionRequest.create({
            data: {
                userId: user.id,
                unitId: unitId,
                residenceName: unit.residence.name,
                status: 'PENDING',
                payload: {},
                documentSnapshotId: snapshot.id
            }
        });


        // 4. Trigger Email
        const recipientEmail = unit.residence.notificationEmail;
        console.log('[Subscription] Found recipient email:', recipientEmail, 'for residence:', unit.residence.name);

        if (recipientEmail) {
            // Use Service Role for Storage to bypass RLS (ensure system can always sign links)
            const storageClient = process.env.SUPABASE_SERVICE_ROLE_KEY
                ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
                    auth: { persistSession: false }
                })
                : supabase;

            // Helper to sign docs
            const signDocuments = async (docs: any[]) => {
                return Promise.all(docs.map(async d => {
                    const { data: signed, error: signedError } = await storageClient.storage
                        .from('secure-documents')
                        .createSignedUrl(d.storagePath, 60 * 60 * 24 * 7);

                    if (signedError || !signed?.signedUrl) {
                        console.error('[Subscription] Failed to generate signed URL for', d.filename, d.storagePath, signedError);
                    }

                    return {
                        type: d.type,
                        filename: d.filename,
                        url: signed?.signedUrl || ''
                    };
                }));
            };

            const applicant = dossierPersons.find(p => p.role === 'APPLICANT');
            const guarantors = dossierPersons.filter(p => p.role === 'GUARANTOR');

            const applicantDocs = applicant ? await signDocuments(applicant.documents) : [];

            const guarantorsWithDocs = await Promise.all(guarantors.map(async g => ({
                firstName: g.firstName,
                lastName: g.lastName,
                type: g.guarantorType || 'PERSON',
                email: g.email || '',
                phone: g.phone || '',
                relation: '', // Not in DB yet
                income: 0, // Not in DB or not synced, handled in email if missing
                documents: await signDocuments(g.documents)
            })));

            const emailSent = await emailService.sendDossierEmail({
                to: recipientEmail,
                residenceName: unit.residence.name,
                unitType: unit.type,
                applicant: {
                    firstName: applicant?.firstName || 'Candidat',
                    lastName: applicant?.lastName || '',
                    email: applicant?.email || user.email || '',
                    phone: applicant?.phone || '',
                    situation: applicant?.status,
                    income: profile.income || 0,
                    documents: applicantDocs
                },
                guarantors: guarantorsWithDocs
            });

            console.log('[Subscription] Email sending result:', emailSent);

            if (!emailSent) {
                console.error('[Subscription] STRICT MODE: Email failed to send. Rolling back request.');

                // Rollback: Delete the request so the user can try again (and doesn't get a false "Sent" state)
                await prisma.subscriptionRequest.delete({
                    where: { id: sub.id }
                });

                throw new Error('L\'envoi de l\'email a échoué. Vérifiez la configuration (Clé API).');
            }

            // [ANALYTICS] Increment Lead Counters
            await prisma.canonResidence.update({
                where: { id: unit.residence.id },
                data: {
                    leadsSentToday: { increment: 1 },
                    leadsSentThisWeek: { increment: 1 }
                }
            });
        } else {
            console.warn('No notification email for residence', unit.residence.id);
        }

        // [TRACKING] Request Sent
        const sessionId = request.headers.get('x-session-id') || uuidv4();
        trackEvent({
            eventType: 'request_sent',
            sessionId,
            userId: user.id,
            residenceId: unit.residence.id,
            city: unit.residence.cityNormalized,
            metadata: {
                channel: 'email', // Default for now
                partner_status: 'unknown',
                request_id: sub.id
            }
        });

        return NextResponse.json({ success: true, id: sub.id });

    } catch (error) {
        console.error('Subscription Creation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
