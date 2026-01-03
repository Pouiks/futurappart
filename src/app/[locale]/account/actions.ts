'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateProfile(formData: FormData) {
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

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const income = formData.get('income') ? parseInt(formData.get('income') as string) : 0;
    const cafNumber = formData.get('cafNumber') as string;
    const arrivalDate = formData.get('arrivalDate') as string;

    await prisma.profile.upsert({
        where: { id: user.id },
        update: {
            firstName,
            lastName,
            phone,
            income,
            cafNumber,
            arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
        },
        create: {
            id: user.id,
            email: user.email,
            firstName,
            lastName,
            phone,
            income,
            cafNumber,
            arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
        }
    });

    revalidatePath('/account');
    return { success: true };
}

export async function addGuarantor(formData: FormData) {
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

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const income = formData.get('income') ? parseInt(formData.get('income') as string) : 0;
    const relationship = formData.get('relationship') as string;
    const situation = formData.get('situation') as string;
    const type = formData.get('type') as string || 'PHYSICAL';
    const fileNumber = formData.get('fileNumber') as string;

    // Ensure profile exists before adding guarantor
    await prisma.profile.upsert({
        where: { id: user.id },
        create: { id: user.id, email: user.email },
        update: {}
    });

    await prisma.guarantor.create({
        data: {
            profileId: user.id,
            firstName,
            lastName,
            email,
            phone,
            income,
            relationship,
            situation,
            type,
            fileNumber
        }
    });

    await prisma.profile.update({
        where: { id: user.id },
        data: { hasGuarantor: true }
    });

    revalidatePath('/account');
    return { success: true };
}

export async function deleteGuarantor(guarantorId: string) {
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

    // Verify ownership
    const guarantor = await prisma.guarantor.findUnique({
        where: { id: guarantorId }
    });

    if (!guarantor || guarantor.profileId !== user.id) {
        return { error: 'Unauthorized' };
    }

    await prisma.guarantor.delete({ where: { id: guarantorId } });

    // Check if any guarantors left
    const count = await prisma.guarantor.count({ where: { profileId: user.id } });
    if (count === 0) {
        await prisma.profile.update({
            where: { id: user.id },
            data: { hasGuarantor: false }
        });
    }

    revalidatePath('/account');
    return { success: true };
}
