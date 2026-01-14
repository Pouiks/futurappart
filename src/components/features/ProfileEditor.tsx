'use client';

import { useState, Fragment } from 'react';
import { updateProfile } from '@/app/[locale]/account/actions';
import { Save, User, Euro, Calendar, Phone, Mail, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProfileProps {
    profile: any;
    guarantors: any[];
}

export default function ProfileEditor({ profile }: ProfileProps) {
    const t = useTranslations('Profile');
    const tG = useTranslations('Guarantors');
    const [loading, setLoading] = useState(false);

    // Profile State
    // Format date for input type="date"
    const formattedDate = profile.arrivalDate
        ? new Date(profile.arrivalDate).toISOString().split('T')[0]
        : '';

    async function handleProfileUpdate(formData: FormData) {
        setLoading(true);
        await updateProfile(formData);
        setLoading(false);
        // Could show toast success here
    }

    return (
        <div className="space-y-12">

            {/* Personal Info Section */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    {t('personalInfo')}
                </h2>

                <form action={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('firstName')}</label>
                        <input
                            name="firstName"
                            defaultValue={profile.firstName || ''}
                            placeholder={t('placeholders.firstName')}
                            className="block w-full rounded-lg border-gray-300 border p-3 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('lastName')}</label>
                        <input
                            name="lastName"
                            defaultValue={profile.lastName || ''}
                            placeholder={t('placeholders.lastName')}
                            className="block w-full rounded-lg border-gray-300 border p-3 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('phone')}</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            <input
                                name="phone"
                                defaultValue={profile.phone || ''}
                                placeholder={t('placeholders.phone')}
                                className="block w-full rounded-lg border-gray-300 border p-3 pl-10 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('arrivalDate')}</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                name="arrivalDate"
                                defaultValue={formattedDate}
                                className="block w-full rounded-lg border-gray-300 border p-3 pl-10 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('income')}</label>
                        <div className="relative">
                            <Euro className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            <input
                                type="number"
                                name="income"
                                defaultValue={profile.income || ''}
                                placeholder={t('placeholders.income')}
                                className="block w-full rounded-lg border-gray-300 border p-3 pl-10 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('cafNumber')}</label>
                        <input
                            name="cafNumber"
                            defaultValue={profile.cafNumber || ''}
                            placeholder={t('placeholders.caf')}
                            className="block w-full rounded-lg border-gray-300 border p-3 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            {t('save')}
                        </button>
                    </div>
                </form>
            </section>

            {/* Guarantors Note */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        {tG('title')}
                    </h2>
                    <p className="text-gray-500 max-w-lg">
                        La gestion des garants et de leurs documents se fait désormais directement dans votre <strong>Dossier Locatif</strong> pour plus de simplicité.
                    </p>
                </div>
                <a href="/account/dossier" className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors">
                    Aller à mon Dossier
                </a>
            </section>
        </div>
    );
}
