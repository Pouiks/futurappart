import { prisma } from '@/lib/db';

export type EventType =
    | 'search_submitted'
    | 'recommendation_shown'
    | 'cta_clicked'
    | 'account_created'
    | 'request_sent'
    | 'partner_activated';

interface TrackEventParams {
    eventType: EventType;
    sessionId: string;
    userId?: string | null;
    residenceId?: string | null;
    city?: string | null;
    metadata?: Record<string, any>;
}

/**
 * Centralized tracking helper.
 * Always running on server-side (Server Actions or API Routes).
 */
export async function trackEvent({
    eventType,
    sessionId,
    userId,
    residenceId,
    city,
    metadata = {}
}: TrackEventParams) {
    try {
        await prisma.event.create({
            data: {
                eventType,
                sessionId,
                userId: userId || null, // Ensure explicit null if undefined
                residenceId: residenceId || null,
                city,
                metadata
            }
        });
        // console.log(`[TRACKING] ${eventType} tracked.`);
    } catch (error) {
        // Fail silently to not impact user experience, but log error
        console.error(`[TRACKING ERROR] Failed to track ${eventType}:`, error);
    }
}
