import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a temporary subscription intent (draft)
 * This is used to store context (unitId, returnTo path) before redirecting to auth.
 */
export async function createSubscriptionIntent(payload: any) {
    const intent = await prisma.subscriptionIntent.create({
        data: {
            sessionId: 'anon-' + uuidv4(), // In a real scenario, use cookies().get('session_id') if available, or just ephemeral uuid
            payload: payload,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000) // Expires in 30 mins
        }
    });
    return intent.id;
}

/**
 * Retrieves and validates an intent
 */
export async function getSubscriptionIntent(intentId: string) {
    if (!intentId) return null;

    const intent = await prisma.subscriptionIntent.findUnique({
        where: { id: intentId }
    });

    if (!intent) return null;

    // Check expiration
    if (new Date() > intent.expiresAt) {
        return null; // Expired
    }

    return intent;
}
