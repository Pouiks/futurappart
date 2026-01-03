'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { DatePicker } from '@/components/ui/date-picker';
import { addDays } from 'date-fns';

export const SearchOverlay = () => {
    const t = useTranslations('SearchOverlay');
    const router = useRouter();
    const [city, setCity] = useState('');
    const [budget, setBudget] = useState(800);
    const [date, setDate] = useState('');
    const [types, setTypes] = useState<string[]>(['STUDIO']);

    const handleSearch = () => {
        if (!city) return; // Simple validation for MVP

        const params = new URLSearchParams();
        params.set('city', city);
        params.set('budgetMax', budget.toString());
        if (date) params.set('date', date);
        types.forEach(t => params.append('types', t));

        router.push(`/search?${params.toString()}`);
    };

    const toggleType = (t: string) => {
        if (types.includes(t)) {
            // Prevent empty selection
            if (types.length > 1) setTypes(types.filter(x => x !== t));
        } else {
            setTypes([...types, t]);
        }
    };

    const getTypeLabel = (type: string) => {
        if (type === 'STUDIO') return t('studio');
        if (type === 'COLOCATION') return t('coloc');
        if (type === 'COLIVING') return t('coliving');
        return type;
    };

    return (
        <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-2xl rounded-3xl p-6 md:p-8 w-full max-w-2xl mx-auto transform transition-all hover:scale-[1.005]">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">{t('title')}</h2>

            <div className="space-y-5">

                {/* City Input */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1.5">{t('cityLabel')}</label>
                    <div className="relative">
                        <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 pl-10 h-12 text-base font-medium shadow-sm transition-colors hover:bg-white cursor-pointer"
                        >
                            <option value="" disabled>{t('cityPlaceholder')}</option>
                            <option value="bordeaux">Bordeaux</option>
                            <option value="lyon">Lyon</option>
                            <option value="paris">Paris</option>
                            <option value="lille">Lille</option>
                            <option value="toulouse">Toulouse</option>
                            <option value="marseille">Marseille</option>
                        </select>
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Date Picker (New) */}
                <div>
                    <DatePicker
                        label={t('arrivalDateLabel')}
                        value={date}
                        onChange={setDate}
                        minDate={addDays(new Date(), 3)}
                        placeholder="JJ/MM/AAAA"
                        className="h-12"
                    />
                </div>

                {/* Budget */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-900">{t('budgetLabel')}</label>
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{budget} €</span>
                    </div>
                    <input
                        type="range"
                        min="300"
                        max="2000"
                        step="50"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1 font-medium">
                        <span>300€</span>
                        <span>2000€+</span>
                    </div>
                </div>

                {/* Type Selection */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1.5">{t('typeLabel')}</label>
                    <div className="flex gap-2">
                        {['STUDIO', 'COLOCATION', 'COLIVING'].map(t => (
                            <button
                                key={t}
                                onClick={() => toggleType(t)}
                                className={`flex-1 py-2.5 px-3 text-sm font-bold rounded-xl border-2 transition-all duration-200
                            ${types.includes(t)
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                            >
                                {getTypeLabel(t)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={handleSearch}
                    className={`w-full py-4 px-6 rounded-2xl font-extrabold text-lg shadow-lg transform transition-all hover:-translate-y-1 hover:shadow-xl
                ${city ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
                    disabled={!city}
                >
                    {t('cta')}
                </button>

                <p className="text-xs text-center text-gray-500 font-medium pb-2">
                    {t('footer')}
                </p>

            </div>
        </div>
    );
};
