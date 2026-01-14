'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { login, signup } from './actions';
import { ArrowLeft, Check, Shield, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Simple Toggle Component because we don't have Tabs
const Tabs = ({ active, onChange, children }: any) => {
    return (
        <div>
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => onChange('signup')}
                    className={`flex-1 py-4 text-center font-bold text-lg border-b-2 transition-colors ${active === 'signup' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Créer un compte
                </button>
                <button
                    onClick={() => onChange('login')}
                    className={`flex-1 py-4 text-center font-bold text-lg border-b-2 transition-colors ${active === 'login' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Se connecter
                </button>
            </div>
            {children}
        </div>
    );
};

const PasswordStrength = ({ password }: { password: string }) => {
    const requirements = [
        { label: "10 caractères minimum", regex: /.{10,}/ },
        { label: "Une majuscule", regex: /[A-Z]/ },
        { label: "Une minuscule", regex: /[a-z]/ },
        { label: "Un chiffre", regex: /\d/ },
        { label: "Un caractère spécial", regex: /[!@#$%^&*(),.?":{}|<>]/ },
    ];

    return (
        <div className="mt-2 space-y-1">
            {requirements.map((req, idx) => {
                const isValid = req.regex.test(password);
                return (
                    <div key={idx} className={`flex items-center gap-2 text-xs transition-colors duration-300 ${isValid ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${isValid ? 'bg-green-100 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                            {isValid && <Check className="w-2.5 h-2.5" />}
                        </div>
                        {req.label}
                    </div>
                )
            })}
        </div>
    );
};

export default function AuthPage() {
    const searchParams = useSearchParams();
    const modeParam = searchParams.get('mode') || 'signup';
    const intentId = searchParams.get('intent');
    const returnTo = searchParams.get('returnTo');
    const [mode, setMode] = useState(modeParam);
    const [password, setPassword] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const router = useRouter(); // From our i18n wrapper or standard next/navigation? The file imports Link from i18n but useSearchParams from next. Actually let's use the standard router for redirect or the i18n one?
    // File imports: import { Link, useRouter } from '@/i18n/navigation'; - Wait, line 4 imports useSearchParams from next/navigation.
    // Line 7 imports Link from next/link (Wait, let me check imports again).
    // Original Line 4: import { useSearchParams } from 'next/navigation';
    // Original Line 7: import Link from 'next/link';

    // I should probably use the router from '@/i18n/navigation' if available to handle locales correctly, OR just standard next/navigation since /account is relative.
    // Let's stick to standard next/navigation for simplicity unless I see '@/i18n/navigation' usage in this file. 
    // This file DOES NOT currently import useRouter. I need to add it.

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Auth Check
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Already logged in -> Redirect
                const target = returnTo || '/account';
                // Use window.location for hard redirect or router for soft. 
                // Since this is creating a "loop" potentially if /account redirects back? No, /account is protected usually.
                window.location.href = target; // Safer to ensure full state reload if needed, but router.replace is better UX.
            } else {
                setCheckingAuth(false);
            }
        };
        checkUser();
    }, [supabase, returnTo]);

    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        if (intentId) formData.append('intentId', intentId);
        if (returnTo) formData.append('returnTo', returnTo);

        let res;
        if (mode === 'signup') {
            res = await signup(null, formData);
        } else {
            res = await login(null, formData);
        }

        if (res?.error) {
            setError(res.error);
        } else if ((res as any)?.success) {
            setShowConfirmation(true);
        }

        setLoading(false);
    }

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        const origin = window.location.origin;
        // Encode returnTo to ensure query params in the return URL don't break the callback URL structure
        const target = returnTo || '/account';
        const redirectTo = `${origin}/api/auth/callback?returnTo=${encodeURIComponent(target)}`;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                queryParams: {
                    access_type: 'offline', // Request refresh token
                    prompt: 'consent',
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        }
        // If success, Supabase redirects automatically
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-4xl mb-8">
                <Link href="/" className="flex justify-center mb-8">
                    <Image
                        src="/futurappartlogo.png"
                        alt="MonLogementEtudiant"
                        width={300}
                        height={100}
                        className="h-24 w-auto object-contain"
                        priority
                    />
                </Link>

                {intentId && (
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-900 text-sm mb-6">
                        <Shield className="w-5 h-5 flex-shrink-0 text-blue-600" />
                        <div>
                            <strong>Sécurisez votre demande</strong>
                            <p>Connectez-vous ou créez un compte pour finaliser votre dossier.</p>
                        </div>
                    </div>
                )}

                <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
                    {/* Google Login Button */}
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                            ) : (
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                            )}
                            Continuer avec Google
                        </button>

                        <div className="relative mt-6 flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">Ou avec email</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>
                    </div>

                    <Tabs active={mode} onChange={setMode}>
                        {mode === 'signup' && (
                            <form action={handleSubmit} className="space-y-4 animate-in fade-in">
                                <input type="hidden" name="returnTo" value={returnTo || ''} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Column 1: Identity & Status */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Prénom</label>
                                                <input name="firstName" required className="block w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500" placeholder="Thomas" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Nom</label>
                                                <input name="lastName" required className="block w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500" placeholder="Martin" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Statut</label>
                                            <select name="status" className="block w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500">
                                                <option value="STUDENT">Étudiant</option>
                                                <option value="ACTIVE">Jeune Actif</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Arrivée souhaitée</label>
                                            <input type="date" name="arrivalDate" className="block w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                                        </div>
                                    </div>

                                    {/* Column 2: Contact & Password */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                            <input type="email" name="email" defaultValue={searchParams.get('email') || ''} required className="block w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500" placeholder="thomas@ecole.com" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Téléphone</label>
                                            <input type="tel" name="phone" required className="block w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500" placeholder="06 12 34 56 78" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Mot de passe</label>
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="block w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="••••••••"
                                            />
                                            <PasswordStrength password={password} />
                                        </div>
                                    </div>
                                </div>

                                {error && <div className="text-red-600 text-sm font-bold bg-red-50 p-3 rounded-lg">{error}</div>}

                                <button type="submit" disabled={loading} className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 mt-6">
                                    {loading ? 'Création...' : 'Créer mon compte'}
                                </button>
                            </form>
                        )}

                        {mode === 'login' && (
                            <form action={handleSubmit} className="space-y-6 animate-in fade-in max-w-sm mx-auto">
                                <input type="hidden" name="returnTo" value={returnTo || ''} />
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                    <input type="email" name="email" defaultValue={searchParams.get('email') || ''} required className="block w-full rounded-lg border-gray-300 border p-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Mot de passe</label>
                                    <input type="password" name="password" required className="block w-full rounded-lg border-gray-300 border p-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                                </div>

                                {error && <div className="text-red-600 text-sm font-bold bg-red-50 p-3 rounded-lg">{error}</div>}

                                <button type="submit" disabled={loading} className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                    {loading ? 'Connexion...' : 'Se connecter'}
                                </button>
                            </form>
                        )}
                    </Tabs>
                </div>
            </div>

            {showConfirmation && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Vérifiez votre email</h3>
                        <p className="text-gray-600 text-center mb-8">
                            Un lien de confirmation vient de vous être envoyé. Cliquez dessus pour activer votre compte et sécuriser votre dossier.
                        </p>
                        <button
                            onClick={() => { setShowConfirmation(false); setMode('login'); }}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            D'accord, je vérifie
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
