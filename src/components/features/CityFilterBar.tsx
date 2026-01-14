'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DatePicker } from '@/components/ui/date-picker';
import { ChevronDown, SlidersHorizontal, MapPin, Calendar, Home, Loader2, Euro } from 'lucide-react';
import { addDays } from 'date-fns';

interface CityFilterBarProps {
    currentCity: string;
}

import { CITIES, UNIT_TYPES } from '@/lib/search-constants';

interface CityFilterBarProps {
    currentCity: string;
}

export const CityFilterBar = ({ currentCity }: CityFilterBarProps) => {
    const t = useTranslations('SearchOverlay');
    const tCommon = useTranslations('Common');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // State initialized from URL
    const [budget, setBudget] = useState(Number(searchParams.get('budgetMax')) || 800);
    // Parse types from URL or default to ALL types if none selected? Or just Studio/Coloc?
    // User requested consistency. Let's default to empty or what was there.
    // Previous default: searchParams... : ['STUDIO', 'COLOCATION', 'T1', 'T2'] - this was inconsistent with other components.
    // Let's use UNIT_TYPES.slice(0, 2) as default or keep logic.
    const [types, setTypes] = useState<string[]>(searchParams.getAll('types').length > 0 ? searchParams.getAll('types') : ['STUDIO', 'COLOCATION', 'T1', 'T2']);
    const [date, setDate] = useState(searchParams.get('date') || '');
    const [isPending, setIsPending] = useState(false);

    // Debounce Budget Update
    useEffect(() => {
        const timeout = setTimeout(() => {
            updateFilters({ budgetMax: budget });
        }, 500);
        return () => clearTimeout(timeout);
    }, [budget]);

    // Update URL Helper
    const updateFilters = (newParams: Record<string, any>) => {
        setIsPending(true);
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(newParams).forEach(([key, value]) => {
            if (key === 'types') {
                params.delete('types');
                (value as string[]).forEach(t => params.append('types', t));
            } else if (value) {
                params.set(key, String(value));
            } else {
                params.delete(key);
            }
        });

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        // Simulating network delay for feel or just unset pending after a bit
        setTimeout(() => setIsPending(false), 500);
    };

    const handleCityChange = (newCity: string) => {
        if (!newCity || newCity === currentCity) return;
        setIsPending(true);
        // Navigate to new city page, keeping generic filters? Maybe reset them.
        // Let's reset for cleaner UX when changing city.
        router.push(`/ville/${newCity.toLowerCase()}`);
    };

    const toggleType = (type: string) => {
        const newTypes = types.includes(type)
            ? types.filter(t => t !== type)
            : [...types, type];

        setTypes(newTypes);
        updateFilters({ types: newTypes });
    };

    return (
        <div className="w-full bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm transition-all">
            <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-3">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">

                    {/* 1. City Selector */}
                    <div className="flex items-center gap-2 relative group min-w-[200px]">
                        <MapPin className="w-5 h-5 text-gray-400 absolute left-3" />
                        <select
                            value={currentCity}
                            onChange={(e) => handleCityChange(e.target.value)}
                            disabled={isPending}
                            className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-colors capitalize disabled:opacity-50"
                        >
                            {CITIES.map(c => (
                                <option key={c.slug} value={c.slug}>{c.title}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 pointer-events-none" />
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-1 items-center gap-2 md:gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">

                        {/* Budget Filter */}
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 min-w-[240px]">
                            <div className="flex flex-col w-full">
                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                    <span>Budget Max</span>
                                    <span className="text-blue-600">{budget} €</span>
                                </div>
                                <input
                                    type="range"
                                    min="300"
                                    max="1500"
                                    step="50"
                                    value={budget}
                                    onChange={(e) => setBudget(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div className="flex items-center gap-2">
                            {UNIT_TYPES.map(type => (
                                <button
                                    key={type}
                                    onClick={() => toggleType(type)}
                                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2
                                        ${types.includes(type)
                                            ? 'bg-gray-900 text-white shadow-md transform scale-105'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {['COLOCATION', 'COLIVING'].includes(type) ? <SlidersHorizontal className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                                    {tCommon(`UnitTypes.${type}`)}
                                </button>
                            ))}
                        </div>

                        {/* Date Filter (Simplified) */}
                        <div className="min-w-[150px]">
                            {/* Reusing DatePicker but styling it smaller if possible or just wrapping */}
                            <div className="relative">
                                {/* This is a placeholder since DatePicker might be large. 
                                    Ideally we pass classNames to DatePicker or wrap it. 
                                    For now let's use a simple button style trigger if strict control needed, 
                                    but existing DatePicker is standard input. */}
                                <DatePicker
                                    value={date}
                                    onChange={(d) => {
                                        setDate(d);
                                        updateFilters({ date: d });
                                    }}
                                    placeholder={t('arrivalDateLabel') || "Disponibilité"}
                                    minDate={new Date()}
                                />
                            </div>
                        </div>

                    </div>

                    {/* Loader */}
                    {isPending && (
                        <div className="flex items-center text-blue-600 animate-pulse font-medium text-sm whitespace-nowrap">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Mise à jour...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
