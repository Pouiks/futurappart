'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { revalidatePath, revalidateTag } from 'next/cache';
import { DossierPerson, PersonRole, PersonStatus, NationalityGroup, GuarantorType } from '@prisma/client';

export type UpsertPersonData = {
    id?: string;
    role: PersonRole;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    status: PersonStatus;
    nationality: NationalityGroup;
    isMinor: boolean;
    birthDate?: string | Date | null;
    guarantorType?: GuarantorType | null;
    // Profile Sync Fields (Applicant Only)
    income?: number | null;
    cafNumber?: string | null;
    arrivalDate?: string | Date | null;
};

export async function upsertPerson(data: UpsertPersonData) {
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // Update Last Seen
    updateLastSeen(user.id);

    try {
        // Prevent Duplicate APPLICANT creation
        if (data.role === 'APPLICANT' && (!data.id || data.id.length < 10)) {
            const existingApplicant = await prisma.dossierPerson.findFirst({
                where: {
                    profileId: user.id,
                    role: 'APPLICANT'
                }
            });
            if (existingApplicant) {
                data.id = existingApplicant.id;
            }
        }

        // Ensure profile exists
        let profile = await prisma.profile.findUnique({ where: { id: user.id } });
        if (!profile) {
            profile = await prisma.profile.create({
                data: { id: user.id, email: user.email }
            });
        }

        // Sanitize data: Remove nested relations like 'documents' and metadata AND birthDate (field collision)
        const { documents, id, createdAt, updatedAt, profileId, income, cafNumber, arrivalDate, birthDate, ...cleanData } = data as any;

        // Sanitize birthDate: Ensure it's a Date object for Prisma
        let finalBirthDate: Date | null = null;
        if (data.birthDate) {
            const d = new Date(data.birthDate);
            if (!isNaN(d.getTime())) {
                finalBirthDate = d;
            }
        }

        console.log("UpsertPerson: Processing", { id: data.id, inputBirthDate: data.birthDate, finalBirthDate });

        // SYNC PROFILE FIELDS (If Applicant)
        if (data.role === 'APPLICANT') {
            const profileUpdates: any = {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                status: data.status,
            };
            if (data.income !== undefined) profileUpdates.income = data.income;
            if (data.cafNumber !== undefined) profileUpdates.cafNumber = data.cafNumber;
            if (data.arrivalDate !== undefined) profileUpdates.arrivalDate = data.arrivalDate;
            if (finalBirthDate) profileUpdates.birthdate = finalBirthDate; // Use Date object

            await prisma.profile.update({
                where: { id: user.id },
                data: profileUpdates
            });
        }

        // Explicit Allowlist for DossierPerson (Safer than Omit)
        const personData = {
            role: data.role,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            status: data.status,
            nationality: data.nationality,
            isMinor: data.isMinor,
            guarantorType: data.guarantorType,
            birthDate: finalBirthDate, // The sanitized date
            updatedAt: new Date()
        };

        let updatedRecord = null;

        // Logic split: Update if existing ID + Ownership, else Create
        if (data.id && data.id.length > 20) {
            // Check ownership
            const existing = await prisma.dossierPerson.findUnique({ where: { id: data.id } });
            if (existing && existing.profileId !== user.id) return { error: 'Unauthorized' };

            console.log("UpsertPerson: Executing Update (Strict)", JSON.stringify(personData, null, 2));

            updatedRecord = await prisma.dossierPerson.update({
                where: { id: data.id },
                data: personData
            });
        } else {
            updatedRecord = await prisma.dossierPerson.create({
                data: {
                    ...personData,
                    profileId: user.id
                }
            });
        }

        revalidatePath('/account/dossier');


        return {
            success: true,
            debugRecord: updatedRecord,
            debugTrace: {
                receivedInput: data,
                parsedDate: finalBirthDate,
                updatePayload: personData
            }
        };
    } catch (e: any) {
        console.error("UPSERT PERSON ERROR:", e);
        return { error: `Erreur Technique: ${e.message}` };
    }
}


export async function deletePerson(personId: string) {
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    updateLastSeen(user.id);

    const person = await prisma.dossierPerson.findUnique({ where: { id: personId } });
    if (!person || person.profileId !== user.id) return { error: 'Unauthorized' };

    await prisma.dossierPerson.delete({ where: { id: personId } });
    revalidatePath('/account/dossier');
    return { success: true };
}

import { createClient } from '@supabase/supabase-js';

export async function getUploadUrl(personId: string, docType: string, filename: string) {
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    updateLastSeen(user.id);

    // Verify ownership
    const person = await prisma.dossierPerson.findUnique({ where: { id: personId } });
    if (!person || person.profileId !== user.id) return { error: 'Unauthorized' };

    // Sanitize filename to avoid weird characters
    const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filePath = `${user.id}/${personId}/${docType}/${safeFilename}`;

    // Debug availability
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    let storageClient = supabase; // Default to user client

    if (hasServiceKey) {
        storageClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
            }
        ) as any;
    } else {
        console.warn('⚠️ Missing SUPABASE_SERVICE_ROLE_KEY, falling back to user client. RLS might block.');
    }

    const { data, error } = await storageClient.storage
        .from('secure-documents')
        .createSignedUploadUrl(filePath, { upsert: true });

    if (error) {
        console.error('Storage Error (ServiceKey=' + hasServiceKey + '):', error);
        return { error: `Erreur préparation (${error.message || 'Inconnue'})` };
    }

    return { signedUrl: data?.signedUrl, path: filePath, token: data?.token };
}

export async function saveUserDocument(personId: string, docType: string, filePath: string, mimeType: string) {
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // DB Insert with Consistency Constraint
    try {
        // Enforce 1 document per Type per Person (Cleanup old ones)
        // 1. Find existing
        const existingDocs = await prisma.userDocument.findMany({
            where: {
                personId: personId,
                type: docType as any
            }
        });

        // 2. Delete old DB records (We could also delete files from storage here if we wanted to be super clean)
        if (existingDocs.length > 0) {
            await prisma.userDocument.deleteMany({
                where: {
                    personId: personId,
                    type: docType as any
                }
            });
        }

        // 3. Create new record
        await prisma.userDocument.create({
            data: {
                personId,
                type: docType as any,
                // DB Schema mapping:
                storagePath: filePath, // This is the internal Supabase path
                filename: filePath.split('/').pop() || 'document',
                mimeType: mimeType,
                size: 0, // We should pass size from client, but for now 0 to avoid schema error
                status: 'VALID'
            }
        });
        revalidatePath('/account/dossier');
        return { success: true };
    } catch (e: any) {
        console.error(e);
        return { error: e.message };
    }
}

// Internal helper to track activity
async function updateLastSeen(userId: string) {
    try {
        await prisma.profile.update({
            where: { id: userId },
            data: { lastSeenAt: new Date() }
        });
    } catch (e) {
        // Non-blocking error
        console.error('Failed to update last_seen_at', e);
    }
}

// Modify upsert/delete/getUploadUrl to call updateLastSeen
// Since we can't easily modify the start of functions with replace_file_content if they are long,
// I will just add the helper at the end and the user can assume consumption,
// OR I have to modify the specific functions.
// I will modify the start of upsertPerson to call this.
