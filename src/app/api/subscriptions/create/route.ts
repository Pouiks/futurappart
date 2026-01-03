import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { trackEvent } from '@/lib/tracking';
import { v4 as uuidv4 } from 'uuid';

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
            where: { id: user.id }
        });

        if (!profile) {
            // Should theoretically exist if signup flow worked, but handle edge case
            return NextResponse.json({ code: 'PROFILE_MISSING', message: 'Profile not found' }, { status: 400 });
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
                redirect: '/account/complete-profile'
            }, { status: 400 });
        }

        // 3. Create Subscription Request
        // First fetch unit details to snapshot residence name
        const unit = await prisma.canonUnit.findUnique({
            where: { id: unitId },
            include: { residence: true }
        });

        if (!unit) return NextResponse.json({ error: 'Unit not found' }, { status: 404 });

        const sub = await prisma.subscriptionRequest.create({
            data: {
                userId: user.id,
                unitId: unitId,
                residenceName: unit.residence.name,
                status: 'PENDING',
                payload: {} // Add specific context if needed
            }
        });


        // 4. Trigger Email (Simulated)
        // await sendSubscriptionEmail(user.email, sub);

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
