'use client';

import { useState, Fragment } from 'react';
import { updateProfile, addGuarantor, deleteGuarantor } from '@/app/[locale]/account/actions';
import { Trash2, Plus, Save, User, Euro, Calendar, Phone, Mail, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProfileProps {
    profile: any;
    guarantors: any[];
}

export default function ProfileEditor({ profile, guarantors }: ProfileProps) {
    const t = useTranslations('Profile');
    const tG = useTranslations('Guarantors');
    const [loading, setLoading] = useState(false);
    const [guarantorType, setGuarantorType] = useState<'PHYSICAL' | 'ORGANISM'>('PHYSICAL');

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

    async function handleAddGuarantor(formData: FormData) {
        setLoading(true);
        await addGuarantor(formData);
        setLoading(false);
        (document.getElementById('guarantor-form') as HTMLFormElement).reset();
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

            {/* Guarantors Section */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    {tG('title')}
                </h2>

                <div className="space-y-6">
                    {/* List Existing Guarantors */}
                    {guarantors.map((g) => (
                        <div key={g.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-900">
                                        {g.type === 'ORGANISM' ? `${tG('organismPrefix')}: ${tG('enums.' + g.relationship)}` : `${g.firstName} ${g.lastName}`}
                                    </h3>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${g.type === 'ORGANISM' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                        {g.type === 'ORGANISM' ? tG('moralLabel') : tG('physicalLabel')}
                                    </span>
                                </div>

                                {g.type === 'ORGANISM' ? (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {tG('fileNumber')}: <span className="font-mono font-bold">{g.fileNumber}</span>
                                    </p>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {tG('enums.' + g.relationship)} {g.situation ? `• ${tG('enums.' + g.situation)}` : ''} • {g.email}
                                        </p>
                                        <p className="text-sm font-bold text-blue-600 mt-1">
                                            {tG('netIncome')}: {g.income}€ / {tG('month')}
                                        </p>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={() => deleteGuarantor(g.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}

                    {/* Add New Guarantor Form */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">{tG('add')}</h3>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setGuarantorType('PHYSICAL')}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${guarantorType === 'PHYSICAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {tG('physical')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGuarantorType('ORGANISM')}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${guarantorType === 'ORGANISM' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {tG('organism')}
                                </button>
                            </div>
                        </div>

                        <form id="guarantor-form" action={handleAddGuarantor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="hidden" name="type" value={guarantorType} />

                            {guarantorType === 'PHYSICAL' ? (
                                <Fragment key="physical">
                                    <input
                                        name="firstName"
                                        placeholder={tG('placeholders.firstName')}
                                        required
                                        className="rounded-lg border-gray-300 border p-3 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                    <input
                                        name="lastName"
                                        placeholder={tG('placeholders.lastName')}
                                        required
                                        className="rounded-lg border-gray-300 border p-3 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder={tG('placeholders.email')}
                                        required
                                        className="rounded-lg border-gray-300 border p-3 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                    <input
                                        name="phone"
                                        type="tel"
                                        placeholder={tG('placeholders.phone')}
                                        className="rounded-lg border-gray-300 border p-3 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />

                                    <select
                                        name="situation"
                                        required
                                        className="rounded-lg border-gray-300 border p-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    >
                                        <option value="">{tG('labels.situation')}</option>
                                        <option value="CDI">{tG('enums.CDI')}</option>
                                        <option value="CDD">{tG('enums.CDD')}</option>
                                        <option value="FONCTIONNAIRE">{tG('enums.FONCTIONNAIRE')}</option>
                                        <option value="RETRAITE">{tG('enums.RETRAITE')}</option>
                                        <option value="INDEPENDANT">{tG('enums.INDEPENDANT')}</option>
                                        <option value="AUTRE">{tG('enums.AUTRE')}</option>
                                    </select>

                                    <select
                                        name="relationship"
                                        className="rounded-lg border-gray-300 border p-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    >
                                        <option value="PERE">{tG('enums.PERE')}</option>
                                        <option value="MERE">{tG('enums.MERE')}</option>
                                        <option value="FRERE_SOEUR">{tG('enums.FRERE_SOEUR')}</option>
                                        <option value="AUTRE_FAMILLE">{tG('enums.AUTRE_FAMILLE')}</option>
                                        <option value="AMI">{tG('enums.AMI')}</option>
                                        <option value="AUTRE">{tG('enums.AUTRE')}</option>
                                    </select>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{tG('labels.incomeIndicative')}</label>
                                        <div className="relative">
                                            <Euro className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                            <input
                                                name="income"
                                                type="number"
                                                placeholder={tG('placeholders.income')}
                                                className="w-full rounded-lg border-gray-300 border p-3 pl-10 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </Fragment>
                            ) : (
                                <Fragment key="organism">
                                    <input type="hidden" name="firstName" value="Organisme" />
                                    <input type="hidden" name="lastName" value="Garant" />
                                    <input type="hidden" name="income" value="0" />

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{tG('labels.organismName')}</label>
                                        <select
                                            name="relationship"
                                            required
                                            className="w-full rounded-lg border-gray-300 border p-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        >
                                            <option value="VISALE">{tG('enums.VISALE')}</option>
                                            <option value="GARANTME">{tG('enums.GARANTME')}</option>
                                            <option value="UNCLE">{tG('enums.UNCLE')}</option>
                                            <option value="CAUTIONEO">{tG('enums.CAUTIONEO')}</option>
                                            <option value="AUTRE">{tG('enums.AUTRE_ORGANISM')}</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{tG('labels.id')}</label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                            <input
                                                name="fileNumber"
                                                required
                                                placeholder={tG('placeholders.fileNumber')}
                                                className="w-full rounded-lg border-gray-300 border p-3 pl-10 text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </Fragment>
                            )}

                            <div className="md:col-span-2 mt-4">
                                <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
                                    <Plus className="w-4 h-4" />
                                    {tG('addBtn')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
