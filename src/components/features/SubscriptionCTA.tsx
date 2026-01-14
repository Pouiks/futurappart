'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Shield, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface SubscriptionCTAProps {
    unit: any;
    user: any | null;
    locale: string;
    isProfileComplete?: boolean;
    firstName?: string;
    missingFields?: string[];
    isAlreadySent?: boolean;
    isDemo?: boolean;
}

export const SubscriptionCTA = ({ unit, user, locale, isProfileComplete = false, firstName, missingFields = [], isAlreadySent = false, isDemo = false }: SubscriptionCTAProps) => {
    const router = useRouter();
    const t = useTranslations('Subscription');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const isSent = isAlreadySent || success;

    const handleSubscribe = async () => {
        if (isSent) return;

        // Demo Mode Interception: Simulate Success
        if (isDemo) {
            setLoading(true);
            toast.info("Mode Démo : Envoi simulé...");

            // Fake delay for realism
            setTimeout(() => {
                setLoading(false);
                setSuccess(true);
                toast.success("Dossier envoyé (Simulation) !");
            }, 1500);
            return;
        }

        setLoading(true);

        if (user && !isProfileComplete) {
            // Auto-save to favorites so user doesn't lose it
            try {
                await fetch('/api/favorites/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ unitId: unit.id })
                });
                toast.success("Mis de côté dans vos favoris !");
            } catch (err) {
                console.error("Auto-favorite failed", err);
            }

            router.push(`/${locale}/account/edit`);
            setLoading(false); // Stop loading if redirecting
            return;
        }

        if (!user) {
            // 1. ANONYMOUS: Create Intent & Redirect
            try {
                const res = await fetch('/api/intents/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        unitId: unit.id,
                        returnTo: window.location.href, // Current page
                        action: 'SUBSCRIBE'
                    })
                });

                if (!res.ok) throw new Error('Intent failed');

                const { intentId } = await res.json();

                // Redirect to Auth with Intent
                router.push(`/${locale}/auth?mode=signup&intent=${intentId}`);
            } catch (error) {
                console.error(error);
                alert("Une erreur est survenue.");
                setLoading(false);
            }
            return;
        }

        // 2. AUTHENTICATED: 1-Click Subscription
        try {
            const res = await fetch('/api/subscriptions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    unitId: unit.id
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                router.refresh();
            } else {
                if (data.code === 'PROFILE_INCOMPLETE') {
                    // Redirect to completion
                    router.push(data.redirect);
                } else {
                    alert("Erreur: " + (data.error || "Impossible d'envoyer la demande."));
                }
            }
        } catch (error) {
            console.error(error);
            alert("Erreur de connexion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className={`p-6 text-white text-center transition-colors ${isSent ? 'bg-green-600' : 'bg-gradient-to-r from-blue-600 to-blue-800'}`}>
                <h3 className="text-xl font-bold mb-1">
                    {isSent ? "Candidature envoyée !" : (user ? `Bonjour ${firstName || 'Étudiant'},` : t('interested'))}
                </h3>
                <p className={`text-sm ${isSent ? 'text-green-100' : 'text-blue-100'}`}>
                    {isSent
                        ? "Le propriétaire a reçu votre dossier."
                        : (user ? (
                            isProfileComplete
                                ? (isDemo ? "Ce logement est une démonstration." : "Votre dossier est prêt à être envoyé.")
                                : "Finalisez votre dossier pour postuler."
                        ) : t('deposit'))
                    }
                </p>
            </div>

            <div className="p-6">
                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
                        <div className="p-2 bg-green-50 rounded-full text-green-600"><Check className="w-4 h-4" /></div>
                        <span className="font-medium text-sm">{t('free')}</span>
                    </div>

                    {/* Guarantors Status */}
                    <div className="flex items-center gap-3 text-gray-700">
                        {missingFields.includes('garants') ? (
                            <div className="p-2 bg-orange-50 rounded-full text-orange-600"><Shield className="w-4 h-4" /></div>
                        ) : (
                            <div className="p-2 bg-purple-50 rounded-full text-purple-600"><Shield className="w-4 h-4" /></div>
                        )}
                        <span className={`font-medium text-sm ${missingFields.includes('garants') ? 'text-orange-600 font-bold' : ''}`}>
                            {missingFields.includes('garants') ? 'Garant manquant' : t('guarantee')}
                        </span>
                    </div>

                    {user && (
                        <div className="flex items-center gap-3 text-gray-700">
                            {missingFields.includes('revenus') ? (
                                <div className="p-2 bg-orange-50 rounded-full text-orange-600"><User className="w-4 h-4" /></div>
                            ) : (
                                <div className="p-2 bg-blue-50 rounded-full text-blue-600"><User className="w-4 h-4" /></div>
                            )}
                            <span className={`font-medium text-sm ${missingFields.includes('revenus') ? 'text-orange-600 font-bold' : ''}`}>
                                {missingFields.includes('revenus') ? 'Revenus manquants' : t('verified')}
                            </span>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSubscribe}
                    disabled={loading || isSent}
                    className={`w-full font-bold py-4 rounded-xl shadow-lg transform transition-all text-lg flex items-center justify-center gap-2 ${isSent
                        ? "bg-green-500 text-white cursor-default shadow-none"
                        : (isDemo && isProfileComplete
                            ? "bg-orange-500 hover:bg-orange-600 text-white active:scale-95" // Re-enable interaction style (Orange like 'finaliser')
                            : (user && !isProfileComplete
                                ? "bg-orange-500 hover:bg-orange-600 text-white active:scale-95"
                                : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"))
                        }`}
                >
                    {loading ? t('loading') : (
                        isSent ? (
                            <>
                                <Check className="w-5 h-5" />
                                <span>Dossier envoyé</span>
                            </>
                        ) : (
                            user && !isProfileComplete ? (
                                <>
                                    <span>Finaliser mon profil</span>
                                    <span className="text-sm bg-white/20 px-2 py-0.5 rounded ml-1">1 min</span>
                                </>
                            ) :
                                (isDemo && isProfileComplete ? "En attente de partenariat !" : (user ? t('sendOneClick') : t('submit')))
                        )
                    )}
                </button>

                {!user && (
                    <p className="text-center text-xs text-gray-400 mt-4">
                        {t('createAccountDesc')}
                    </p>
                )}
            </div>
        </div>
    );
};
