import { NextResponse } from 'next/server';
import { createSubscriptionIntent } from '@/lib/intents/server';
import { z } from 'zod';

const schema = z.object({
    unitId: z.string(),
    returnTo: z.string(),
    action: z.string().optional()
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const payload = schema.parse(body);

        const intentId = await createSubscriptionIntent(payload);

        return NextResponse.json({ intentId });
    } catch (error) {
        console.error('Intent Creation Error:', error);
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
}
