
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { CITIES, UNIT_TYPES, PRIORITIES } from '@/lib/search-constants';

interface FilterPanelProps {
    onSearch: (filters: any) => void;
    cities?: { title: string; slug: string }[];
    stats?: {
        minPrice: number;
        maxPrice: number;
        minSurface: number;
        maxSurface: number;
    } | null;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onSearch, cities = [], stats }) => {
    const t = useTranslations('Search.filters');
    const tCommon = useTranslations('Common');
    const searchParams = useSearchParams();

    // Initialize state from URL or defaults
    const [city, setCity] = useState(searchParams.get('city') || 'lyon');
    const [budget, setBudget] = useState(Number(searchParams.get('budgetMax')) || 800);
    const [minSurface, setMinSurface] = useState(Number(searchParams.get('minSurface')) || 15);

    // Parse types from URL
    const typesParam = searchParams.get('types');
    const initialTypes = typesParam ? typesParam.split(',').filter(Boolean) : ['STUDIO', 'COLOCATION'];
    const [types, setTypes] = useState<string[]>(initialTypes);

    const [priority, setPriority] = useState(searchParams.get('priority') || 'BALANCE');

    const handleSearch = () => {
        onSearch({ city, budgetMax: budget, minSurface, types, priority });
    };

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch();
        }, 500);
        return () => clearTimeout(timer);
    }, [city, budget, minSurface, types, priority]);

    const toggleType = (t: string) => {
        if (types.includes(t)) setTypes(types.filter(x => x !== t));
        else setTypes([...types, t]);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24 h-fit">
            <h2 className="font-bold text-xl mb-6">{t('title')}</h2>

            <div className="space-y-6">
                {/* City */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('city')}</label>
                    <div className="relative">
                        <select
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            className="w-full border-gray-300 rounded-md border p-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer hover:border-blue-300 transition-colors"
                        >
                            {cities.length > 0 ? (
                                cities.map(c => (
                                    <option key={c.slug} value={c.slug}>{c.title}</option>
                                ))
                            ) : (
                                CITIES.map(c => (
                                    <option key={c.slug} value={c.slug}>{c.title}</option>
                                ))
                            )}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Budget */}
                <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700">{t('budgetMax')}</label>
                        <span className="text-sm font-bold text-blue-600">{budget}€</span>
                    </div>
                    <input
                        type="range"
                        min="300" max="2000" step="10"
                        value={budget}
                        onChange={e => setBudget(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700"
                    />
                    {stats && (
                        <div className="text-xs text-gray-500 mt-1 flex justify-between px-1">
                            <span>Min dispo: {stats.minPrice}€</span>
                            <span>Max: {stats.maxPrice}€</span>
                        </div>
                    )}
                </div>

                {/* Surface Min */}
                <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700">{t('surfaceMin')}</label>
                        <span className="text-sm font-bold text-blue-600">{minSurface}m²</span>
                    </div>
                    <input
                        type="range"
                        min="9" max="60" step="1"
                        value={minSurface}
                        onChange={e => setMinSurface(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700"
                    />
                    {stats && (
                        <div className="text-xs text-gray-500 mt-1 flex justify-between px-1">
                            <span>Min dispo: {stats.minSurface}m²</span>
                            <span>Max: {stats.maxSurface}m²</span>
                        </div>
                    )}
                </div>

                {/* Types */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('type')}</label>
                    <div className="flex flex-wrap gap-2">
                        {UNIT_TYPES.map(type => (
                            <button
                                key={type}
                                onClick={() => toggleType(type)}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors cursor-pointer ${types.includes(type) ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                            >
                                {tCommon(`UnitTypes.${type}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('priority')}</label>
                    <div className="flex rounded-md shadow-sm" role="group">
                        {['PRICE', 'BALANCE', 'SURFACE'].map((p, idx) => {
                            const pKey = p.toLowerCase() as 'price' | 'balance' | 'surface';
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPriority(p)}
                                    className={`flex-1 px-4 py-2 text-sm font-medium border cursor-pointer transition-colors
                                ${p === priority ? 'bg-blue-50 text-blue-700 z-10 hover:bg-blue-100' : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600'}
                                ${idx === 0 ? 'rounded-l-md' : ''} ${idx === 2 ? 'rounded-r-md' : ''}
                                border-gray-300 -ml-px first:ml-0
                            `}
                                >
                                    {t(`priorities.${pKey}`)}
                                </button>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};
