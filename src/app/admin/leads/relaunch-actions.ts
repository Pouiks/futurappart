'use server';

import { prisma } from '@/lib/db';
import { emailService } from '@/lib/email';
import { headers } from 'next/headers';

export async function relaunchStudentEmail(leadId: string) {
    try {
        // 1. Fetch Lead
        const lead = await prisma.subscriptionRequest.findUnique({
            where: { id: leadId },
            include: {
                profile: true
            }
        });

        if (!lead || !lead.profile || !lead.profile.email) {
            return { success: false, error: 'Lead ou email introuvable.' };
        }

        // 2. Generate Link
        // Current host for absolute URL
        const headersList = await headers();
        const host = headersList.get('host') || 'futurappart.com';
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

        // Simple Link to Dashboard (User must log in if not already)
        // If we want to prefill email on login page, we could add ?email=... to /auth
        const loginLink = `${protocol}://${host}/fr/auth?returnTo=/fr/dossier&email=${encodeURIComponent(lead.profile.email)}`;

        // 3. Send Email
        const sent = await emailService.sendStudentReminder({
            to: lead.profile.email,
            firstName: lead.profile.firstName || 'Candidat',
            lastName: lead.profile.lastName || '',
            residenceName: lead.residenceName || 'Résidence',
            loginLink
        });

        if (sent) {
            return { success: true };
        } else {
            return { success: false, error: 'Erreur lors de l\'envoi (Brevo).' };
        }

    } catch (error) {
        console.error('Error relaunching student:', error);
        return { success: false, error: 'Erreur serveur.' };
    }
}
