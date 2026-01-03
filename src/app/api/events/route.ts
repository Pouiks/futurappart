import { NextResponse } from 'next/server';
import { trackEvent, EventType } from '@/lib/tracking';
import { z } from 'zod';
import { cookies } from 'next/headers';

const EventSchema = z.object({
    eventType: z.enum([
        'search_submitted',
        'recommendation_shown',
        'cta_clicked',
        'account_created',
        'request_sent',
        'partner_activated'
    ] as [EventType, ...EventType[]]),
    residenceId: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    metadata: z.record(z.any()).optional().default({}),
    sessionId: z.string().optional(), // Can be passed explicitly or inferred
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = EventSchema.parse(body);

        // Enrich with potential user info if available from session/cookies
        // For now, rely on what's passed or minimal server context
        // Ideally we grab session_id from a cookie if not provided

        let sessionId = data.sessionId;
        if (!sessionId) {
            // Fallback: try to read a session cookie or just "unknown"
            // For MVP, client sends it or we default to anonymous
            const cookieStore = await cookies();
            sessionId = cookieStore.get('session_id')?.value || 'anonymous';
        }

        await trackEvent({
            eventType: data.eventType,
            sessionId: sessionId,
            residenceId: data.residenceId,
            city: data.city,
            metadata: data.metadata,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API TRACKING] Error:', error);
        return NextResponse.json({ error: 'Invalid event data' }, { status: 400 });
    }
}
