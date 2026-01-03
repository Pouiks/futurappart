'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Shield, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SubscriptionCTAProps {
    unit: any;
    user: any | null;
    locale: string;
    isProfileComplete?: boolean;
}

export const SubscriptionCTA = ({ unit, user, locale, isProfileComplete = false }: SubscriptionCTAProps) => {
    const router = useRouter();
    const t = useTranslations('Subscription');

    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);

        if (user && !isProfileComplete) {
            router.push(`/${locale}/account/edit`);
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
                alert("🎉 Votre demande a bien été envoyée ! Le gestionnaire vous recontactera.");
                // Optional: Show success state in UI instead of alert
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white text-center">
                <h3 className="text-xl font-bold mb-1">
                    {user ? t('hello', { name: user.user_metadata?.first_name || 'Étudiant' }) : t('interested')}
                </h3>
                <p className="text-blue-100 text-sm">
                    {user ? t('ready') : t('deposit')}
                </p>
            </div>

            <div className="p-6">
                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
                        <div className="p-2 bg-green-50 rounded-full text-green-600"><Check className="w-4 h-4" /></div>
                        <span className="font-medium text-sm">{t('free')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                        <div className="p-2 bg-purple-50 rounded-full text-purple-600"><Shield className="w-4 h-4" /></div>
                        <span className="font-medium text-sm">{t('guarantee')}</span>
                    </div>
                    {user && (
                        <div className="flex items-center gap-3 text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <User className="w-4 h-4" />
                            <span className="font-bold text-sm">{t('verified')}</span>
                        </div>
                    )}
                </div>

                {user && !isProfileComplete && (
                    <div className="mb-4 bg-orange-50 border border-orange-100 p-3 rounded-lg flex items-start gap-3 text-sm text-orange-800 animate-in fade-in slide-in-from-bottom-2">
                        <div className="mt-0.5"><Shield className="w-4 h-4 text-orange-600" /></div>
                        <p className="font-medium">{t('incompleteBanner')}</p>
                    </div>
                )}

                <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className={`w-full font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all text-lg flex items-center justify-center gap-2 ${user && !isProfileComplete
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                >
                    {loading ? t('loading') : (
                        user && !isProfileComplete ? t('finalize') :
                            (user ? t('sendOneClick') : t('submit'))
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
