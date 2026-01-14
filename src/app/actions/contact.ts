'use server';

import { z } from 'zod';
import { emailService } from '@/lib/email';

const ContactSchema = z.object({
    residenceName: z.string().min(2, "Nom de résidence requis"),
    cities: z.string().min(2, "Précisez au moins une ville"),
    name: z.string().min(2, "Votre nom est requis"),
    email: z.string().email("Email invalide"),
    message: z.string().optional()
});

export type ContactState = {
    success?: boolean;
    error?: string;
    fieldErrors?: Record<string, string[]>;
} | null;

export async function submitPartnerContact(prevState: ContactState, formData: FormData): Promise<ContactState> {
    // 1. Validate Input
    const rawData = {
        residenceName: formData.get('residenceName'),
        cities: formData.get('cities'),
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };

    const validated = ContactSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            error: "Veuillez corriger les erreurs",
            fieldErrors: validated.error.flatten().fieldErrors
        };
    }

    const data = validated.data;

    // 2. Send Email
    // We send it to the Admin (Brevo Sender) *from* the contact form
    // Actually Brevo usually requires sender to be verified domain.
    // So we send TO ourselves, FROM verified sender, with Reply-To set to user 

    // Admin Notification
    const sentToAdmin = await emailService.sendEmail({
        to: [{ email: process.env.BREVO_SENDER_EMAIL!, name: 'Admin Team' }],
        replyTo: { email: data.email, name: data.name },
        subject: `[Partenaire] Nouvelle demande : ${data.residenceName}`,
        htmlContent: `
            <h1>Nouvelle demande de partenariat</h1>
            <p><strong>Résidence/Groupe :</strong> ${data.residenceName}</p>
            <p><strong>Ville(s) :</strong> ${data.cities}</p>
            <p><strong>Contact :</strong> ${data.name} (${data.email})</p>
            <hr />
            <p><strong>Message :</strong></p>
            <pre>${data.message || 'Aucun message'}</pre>
        `
    });

    if (!sentToAdmin) {
        return { success: false, error: "Erreur lors de l'envoi de l'email. Veuillez réessayer." };
    }

    // Optional: Send auto-reply to user? (Skipped for now to keep it simple)

    return { success: true };
}
