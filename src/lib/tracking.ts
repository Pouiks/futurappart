'use server';

import { prisma } from './db';
import { headers } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

/**
 * Track a user event (Server Action)
 * Can be called from Client Components or Server Components.
 */
export async function trackEvent(data: {
    eventType: string;
    userId?: string;
    residenceId?: string;
    city?: string;
    sessionId?: string;
    metadata?: any;
}) {
    try {
        const headersList = await headers();
        const userAgent = headersList.get('user-agent') || 'unknown';

        // Simple session ID strategy (cookie or header would be better, but MVP)
        // Ideally tracking happens via a specialized analytics provider, but for internal:
        // We rely on client passing sessionId or we generate one here if we had cookies.
        // For now, let's allow passing sessionId or default to 'anonymous'.

        const sessionId = 'anonymous'; // TODO: Cookie based session

        await prisma.event.create({
            data: {
                eventType: data.eventType,
                userId: data.userId || null,
                sessionId: sessionId,
                residenceId: data.residenceId || null,
                city: data.city || null,
                metadata: {
                    ...data.metadata,
                    userAgent
                }
            }
        });
    } catch (e) {
        console.error("Tracking Error:", e);
        // Fail silently to not block UI
    }
}
