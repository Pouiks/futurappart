import * as Brevo from '@getbrevo/brevo';

interface SendEmailParams {
    to: { email: string; name?: string }[];
    subject: string;
    htmlContent: string;
    textContent?: string;
    replyTo?: { email: string; name?: string };
}

class EmailService {
    private apiInstance: Brevo.TransactionalEmailsApi;
    private sender: { email: string; name: string };

    constructor() {
        this.apiInstance = new Brevo.TransactionalEmailsApi();

        // Configure API Key
        // Note: The SDK might look for this differently, but we set it explicitly
        this.apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

        this.sender = {
            email: process.env.BREVO_SENDER_EMAIL || 'contact@monlogementetudiant.com',
            name: process.env.BREVO_SENDER_NAME || 'MonLogementEtudiant'
        };
    }

    async sendEmail(params: SendEmailParams): Promise<boolean> {
        if (!process.env.BREVO_API_KEY) {
            console.warn('[EmailService] No API Key provided. Email skipped.');
            return false;
        }

        const sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.sender = this.sender;
        sendSmtpEmail.to = params.to;
        sendSmtpEmail.subject = params.subject;
        sendSmtpEmail.htmlContent = params.htmlContent;
        if (params.textContent) sendSmtpEmail.textContent = params.textContent;
        if (params.replyTo) sendSmtpEmail.replyTo = params.replyTo;

        try {
            const data = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('[EmailService] Email sent successfully. Message ID:', data.body.messageId);
            return true;
        } catch (error) {
            console.error('[EmailService] Error sending email:', error);
            // We don't throw to avoid crashing the caller, just return false
            return false;
        }
    }
    async sendDossierEmail(params: {
        to: string;
        applicant: {
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            income?: number;
            situation?: string;
            documents: { type: string; filename: string; url: string }[];
        };
        guarantors: {
            firstName: string;
            lastName: string;
            type: string;
            relation?: string;
            income?: number;
            email?: string;
            phone?: string;
            documents: { type: string; filename: string; url: string }[];
        }[];
        residenceName: string;
        unitType?: string;
    }): Promise<boolean> {
        const { applicant, guarantors, residenceName, unitType } = params;

        const typeMap: Record<string, string> = {
            'PERSON': 'Physique',
            'ORGANISM': 'Organisme',
            'VISALE': 'Visale',
            'GARANTME': 'GarantMe'
        };

        const docLabels: Record<string, string> = {
            IDENTITY: "Pièce d'identité",
            STUDENT_ENROLLMENT: "Certificat de scolarité",
            PROFESSIONAL_STATUS_PROOF: "Justificatif professionnel",
            INCOME_PROOF: "Justificatif de ressources",
            TAX_NOTICE: "Avis d'imposition",
            RESIDENCY_RIGHT: "Titre de séjour",
            GUARANTEE_CERTIFICATE: "Acte de cautionnement",
            ADDRESS_PROOF: "Justificatif de domicile",
            BANK_ID: "RIB"
        };

        const renderDocs = (docs: { type: string; filename: string; url: string }[]) => {
            if (!docs || docs.length === 0) return '<li><em>Aucun document joint</em></li>';
            return docs.map(d => `
                <li>
                    <strong>${docLabels[d.type] || d.type}</strong> : 
                    <a href="${d.url}" target="_blank" style="color: #2563eb; text-decoration: underline;">Voir le document (${d.filename})</a>
                </li>
            `).join('');
        };

        let guarantorHtml = '';
        if (guarantors.length > 0) {
            guarantorHtml = `
            <h3>Garants (${guarantors.length})</h3>
            <ul>
                ${guarantors.map(g => `
                    <li style="margin-bottom: 15px;">
                        <strong>${g.firstName} ${g.lastName}</strong> (${typeMap[g.type] || g.type})<br/>
                        ${g.email ? `Email: <a href="mailto:${g.email}">${g.email}</a><br/>` : ''}
                        ${g.phone ? `Tél: ${g.phone}<br/>` : ''}
                        ${g.relation ? `Relation: ${g.relation}<br/>` : ''}
                        ${g.income ? `Revenus: ${g.income}€/mois<br/>` : ''}
                        <br/>
                        <em>Pièces :</em>
                        <ul>
                            ${renderDocs(g.documents)}
                        </ul>
                    </li>
                `).join('')}
            </ul>`;
        } else {
            guarantorHtml = '<p><em>Aucun garant renseigné.</em></p>';
        }

        const htmlContent = `
            <h1>Nouvelle Candidature : ${residenceName}</h1>
            <p>Un étudiant a postulé pour un logement (${unitType || 'Unité'}) via Mon Logement Étudiant.</p>
            
            <hr />
            
            <h2>Candidat</h2>
            <ul>
                <li><strong>Nom :</strong> ${applicant.firstName} ${applicant.lastName}</li>
                <li><strong>Email :</strong> <a href="mailto:${applicant.email}">${applicant.email}</a></li>
                <li><strong>Téléphone :</strong> ${applicant.phone}</li>
                ${applicant.situation ? `<li><strong>Situation :</strong> ${applicant.situation}</li>` : ''}
                ${applicant.income ? `<li><strong>Revenus :</strong> ${applicant.income}€/mois</li>` : ''}
            </ul>
            
            <h3>Pièces du Candidat</h3>
            <ul>
                ${renderDocs(applicant.documents)}
            </ul>

            <hr />

            ${guarantorHtml}
            
            <hr />
            <p style="font-size: 12px; color: #666;">
                Ce dossier a été vérifié sommairement par notre algorithme mais la validation finale vous appartient.
            </p>
            
            <p style="margin-top: 20px;">
                Bien cordialement,<br/>
                <strong>La team FuturAppart</strong>
            </p>
            
            <img src="https://monlogementetudiant.com/futurappartlogo.png" alt="FuturAppart" style="width: 150px; height: auto; display: block; margin-top: 10px;" />
        `;

        return this.sendEmail({
            to: [{ email: params.to, name: 'Partenaire' }],
            replyTo: { email: applicant.email, name: `${applicant.firstName} ${applicant.lastName}` },
            subject: `[Nouvelle Candidature] ${applicant.firstName} ${applicant.lastName} - ${residenceName}`,
            htmlContent
        });
    }


    async sendStudentReminder(params: {
        to: string;
        firstName: string;
        lastName: string;
        residenceName: string;
        loginLink: string;
    }): Promise<boolean> {
        const { to, firstName, lastName, residenceName, loginLink } = params;
        const htmlContent = `
            <h1>Bonjour ${firstName},</h1>
            <p>Nous avons bien reçu votre intérêt pour la résidence <strong>${residenceName}</strong>.</p>
            <p>Votre dossier semble incomplet ou en attente de validation. Pour maximiser vos chances, nous vous invitons à compléter vos informations dès que possible.</p>
            <p>
                <a href="${loginLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Accéder à mon dossier
                </a>
            </p>
            <p>Ou cliquez ici : <a href="${loginLink}">${loginLink}</a></p>
            <hr />
            <p style="font-size: 12px; color: #666;">L'équipe Mon Logement Étudiant</p>
        `;

        return this.sendEmail({
            to: [{ email: to, name: `${firstName} ${lastName}` }],
            subject: `[Rappel] Votre dossier pour ${residenceName}`,
            htmlContent
        });
    }
}

// Singleton instance
export const emailService = new EmailService();
