import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { trackEvent } from '@/lib/tracking';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // "next" is a common param used by Supabase for redirect after auth
    const next = searchParams.get('next') ?? '/account';

    // Also support "returnTo" content if passed specifically
    const returnTo = searchParams.get('returnTo');
    const finalRedirect = returnTo ?? next;

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    },
                },
            }
        );

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data?.user) {
            // SYNC PROFILE
            const meta = data.user.user_metadata || {};
            const email = data.user.email;

            // Extract Name from Metadata
            const firstName = meta.first_name || (meta.full_name ? meta.full_name.split(' ')[0] : '') || '';
            const lastName = meta.last_name || (meta.full_name ? meta.full_name.split(' ').slice(1).join(' ') : '') || '';

            try {
                // Determine Status only if new? logic is tricky. 
                // We'll default to STUDENT if not set, or leave it if exists.
                // Upsert logic:
                // We don't want to overwrite existing detailed info if user logs in again.
                // But we want to create if missing.

                // Fetch existing profile to be safe
                const existing = await prisma.profile.findUnique({ where: { id: data.user.id } });

                if (!existing) {
                    await prisma.profile.create({
                        data: {
                            id: data.user.id,
                            email: email || '',
                            firstName,
                            lastName,
                            status: 'STUDENT', // Default
                            // phone is missing from Google usually
                        }
                    });

                    // [TRACKING] Account Created via Google
                    trackEvent({
                        eventType: 'account_created',
                        sessionId: uuidv4(),
                        userId: data.user.id,
                        metadata: { source: 'google_oauth' }
                    });

                } else {
                    // Optional: Update name if missing in profile?
                    // Let's decide to NOT overwrite unless empty, similar to DossierBuilder logic previously added.
                    // But prisma upsert is cleaner.
                    // Actually, if they use Google, let's allow updating email/name if relevant?
                    // No, safe approach: create if not exists.
                }

            } catch (err) {
                console.error('Profile Creation Error (OAuth)', err);
            }

            return NextResponse.redirect(`${origin}${finalRedirect}`);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth?error=OAuthFail`);
}
