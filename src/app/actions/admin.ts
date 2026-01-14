'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteSubscriptionRequest(requestId: string) {
    if (!requestId) {
        throw new Error('Request ID is required');
    }

    try {
        await prisma.subscriptionRequest.delete({
            where: { id: requestId }
        });
        revalidatePath('/admin/users/[id]'); // Revalidate pages
        return { success: true };
    } catch (error) {
        console.error('Failed to delete subscription request:', error);
        return { success: false, error: 'Failed to delete request' };
    }
}
