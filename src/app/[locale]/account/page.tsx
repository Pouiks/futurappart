import { prisma } from '@/lib/db';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { User, Mail, Calendar, MapPin, Shield, Euro } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function AccountPage() {
    const t = await getTranslations('Profile');
    const tG = await getTranslations('Guarantors');
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        include: { guarantors: true }
    });

    const isProfileComplete = profile
        ? !!(profile.income && profile.income > 0 && profile.guarantors && profile.guarantors.length > 0)
        : false;

    // Handle missing profile (e.g. after DB reset)
    const displayProfile = profile || {
        firstName: 'Nouveau',
        lastName: 'Membre',
        status: null,
        phone: null,
        arrivalDate: null,
        income: null,
        cafNumber: null,
        email: user.email,
        guarantors: []
    };

    return (
        <div className="space-y-8">
            {/* Completion Banner */}
            {!isProfileComplete && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg animate-in fade-in slide-in-from-top-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                            <Shield className="w-6 h-6 animate-pulse" />
                            {t('banner.title')}
                        </h2>
                        <p className="text-orange-50 opacity-90">
                            {t('banner.text')}
                        </p>
                    </div>
                    <Link
                        href="/account/edit"
                        className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-md text-center"
                    >
                        {t('banner.cta')}
                    </Link>
                </div>
            )}

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                {!profile && (
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                        {t('incompleteBadge')}
                    </span>
                )}
            </div>

            {/* Informations Personnelles */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    {t('personalInfo')}
                </h2>

                <div className="flex items-center gap-6 mb-8 border-b border-gray-50 pb-8">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
                        {displayProfile.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {displayProfile.firstName} {displayProfile.lastName}
                        </h2>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                            <User className="w-4 h-4" /> {t('phone')}
                        </label>
                        <p className="font-medium text-gray-900 text-lg">{displayProfile.phone || t('notProvided')}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> {t('arrivalDate')}
                        </label>
                        <p className="font-medium text-gray-900 text-lg">
                            {displayProfile.arrivalDate ? new Date(displayProfile.arrivalDate).toLocaleDateString() : t('notProvidedFem')}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                            <Euro className="w-4 h-4" /> {t('income')}
                        </label>
                        <p className="font-medium text-gray-900 text-lg">
                            {displayProfile.income ? `${displayProfile.income} €` : t('notProvided')}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                            <Shield className="w-4 h-4" /> {t('cafNumber')}
                        </label>
                        <p className="font-medium text-gray-900 text-lg">{displayProfile.cafNumber || t('notProvided')}</p>
                    </div>
                </div>
            </div>

            {/* Mes Garants */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    {tG('title')}
                </h2>

                {displayProfile.guarantors && displayProfile.guarantors.length > 0 ? (
                    <div className="space-y-4">
                        {displayProfile.guarantors.map((g: any) => (
                            <div key={g.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-gray-900">
                                            {g.type === 'ORGANISM' ? `${tG('organismPrefix')}: ${g.relationship}` : `${g.firstName} ${g.lastName}`}
                                        </h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${g.type === 'ORGANISM' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                            {g.type === 'ORGANISM' ? tG('moralLabel') : tG('physicalLabel')}
                                        </span>
                                    </div>

                                    {g.type === 'ORGANISM' ? (
                                        <p className="text-sm text-gray-600">
                                            {tG('fileNumber')}: <span className="font-mono font-bold text-gray-900">{g.fileNumber}</span>
                                        </p>
                                    ) : (
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-600">
                                                {g.relationship} {g.situation ? `• ${g.situation}` : ''}
                                            </p>
                                            <p className="text-sm text-gray-600">{g.email} • {g.phone}</p>
                                            <p className="text-sm font-bold text-blue-600 mt-1">
                                                {tG('netIncome')}: {g.income} € / {tG('month')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">{tG('none')}</p>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <Link
                    href="/account/edit"
                    className={profile
                        ? "inline-flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all"
                        : "inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all transform hover:-translate-y-0.5"
                    }
                >
                    {profile ? t('edit') : t('completeNow')}
                </Link>
            </div>
        </div>
    );
}
