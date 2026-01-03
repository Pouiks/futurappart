'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSubscriptionIntent } from '@/lib/intents/server';
import { trackEvent } from '@/lib/tracking';
import { v4 as uuidv4 } from 'uuid';

async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                }
            }
        }
    );
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const intentId = formData.get('intentId') as string;
    const returnTo = formData.get('returnTo') as string;

    const sb = await getSupabase();

    const { error } = await sb.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    // Handle Intent
    if (intentId) {
        const intent = await getSubscriptionIntent(intentId);
        if (intent && (intent.payload as any).returnTo) {
            redirect((intent.payload as any).returnTo);
        }
    }

    if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
        redirect(returnTo);
    }

    redirect('/');
}

export async function signup(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const status = formData.get('status') as string;
    const arrivalDate = formData.get('arrivalDate') as string;
    const intentId = formData.get('intentId') as string;
    const returnTo = formData.get('returnTo') as string;

    // Validate Password Complexity (Min 10 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char)
    // Updated Regex to include special character check
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{10,}$/;
    if (!passwordRegex.test(password)) {
        return { error: 'Le mot de passe doit contenir 10 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.' };
    }

    const cookieStore = await cookies();
    const sb = createServerClient(
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

    const { data, error } = await sb.auth.signUp({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    if (data.user) {
        // Create Profile
        try {
            await prisma.profile.create({
                data: {
                    id: data.user.id,
                    email: email,
                    firstName,
                    lastName,
                    phone,
                    status,
                    arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
                }
            });

            // [TRACKING] Account Created
            // Best effort, non-blocking
            const sessionId = intentId ? `intent-${intentId}` : uuidv4();
            trackEvent({
                eventType: 'account_created',
                sessionId: sessionId,
                userId: data.user.id,
                metadata: {
                    source: intentId ? 'cta' : 'direct',
                    city: null // Profile creation doesn't enforce city yet
                }
            });

        } catch (dbError) {
            console.error("Profile creation failed", dbError);
        }
    }

    // If session exists, user is logged in (Auto Confirm ON) -> Redirect
    if (data.session) {
        if (intentId) {
            const intent = await getSubscriptionIntent(intentId);
            if (intent && (intent.payload as any).returnTo) {
                redirect((intent.payload as any).returnTo);
            }
        }

        if (returnTo && returnTo.startsWith('/')) {
            redirect(returnTo);
        }

        redirect('/');
    }

    // If no session, Confirmation Required -> Return Success for Popup
    return { success: true };
}
