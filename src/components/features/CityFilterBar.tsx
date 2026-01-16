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
import { MobileFilterDrawer } from './MobileFilterDrawer';

interface CityFilterBarProps {
    currentCity: string;
    totalResults: number; // Initial server count
    candidates?: { price: number; type: string }[]; // For client-side preview
}

export const CityFilterBar = ({ currentCity, totalResults, candidates = [] }: CityFilterBarProps) => {
    const t = useTranslations('SearchOverlay');
    const tCommon = useTranslations('Common');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // State initialized from URL
    const [budget, setBudget] = useState(Number(searchParams.get('budgetMax')) || 800);
    const [types, setTypes] = useState<string[]>(searchParams.getAll('types').length > 0 ? searchParams.getAll('types') : ['STUDIO', 'COLOCATION', 'T1', 'T2']);
    const [date, setDate] = useState(searchParams.get('date') || '');
    const [isPending, setIsPending] = useState(false);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    // Preview Count State
    const [previewCount, setPreviewCount] = useState(totalResults);

    // Debounce Budget Update (Desktop)
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
        setTimeout(() => setIsPending(false), 500);
    };

    const handleCityChange = (newCity: string) => {
        if (!newCity || newCity === currentCity) return;
        setIsPending(true);
        router.push(`/ville/${newCity.toLowerCase()}`);
    };

    const toggleType = (type: string) => {
        const newTypes = types.includes(type)
            ? types.filter(t => t !== type)
            : [...types, type];

        setTypes(newTypes);
        updateFilters({ types: newTypes });
    };

    // Recalculate preview count based on client-side candidates
    // Note: This only filters *loaded* candidates, which is fine for the "preview" in most cases unless pagination is heavy.
    const handleDrawerFilterChange = (filters: { city: string; budget: number; types: string[]; date: string }) => {
        if (!candidates.length) return;

        // Simple client-side filtering logic matching the DB query
        const matches = candidates.filter(u =>
            u.price <= filters.budget &&
            (filters.types.length === 0 || filters.types.includes(u.type))
            // Date filtering is complex client-side without full unit data (availability dates)
            // So we mostly ignore it for the "count" preview unless we want to assume all are available or pass availability dates.
            // For now, let's assume availability doesn't strictly filter count in this simple preview version.
        );

        setPreviewCount(matches.length);
    };

    return (
        <div className="w-full bg-white border-b border-gray-200 sticky top-16 md:top-20 z-40 shadow-sm transition-all">
            <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-3">
                <div className="flex items-center justify-between gap-4">

                    {/* MOBILE TOGGLE (Visible < md) */}
                    <div className="md:hidden flex-1 flex gap-2">
                        {/* City Selector */}
                        <div className="flex-1 relative">
                            <select
                                value={currentCity}
                                onChange={(e) => handleCityChange(e.target.value)}
                                className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold text-sm outline-none appearance-none truncate"
                            >
                                {CITIES.map(c => (
                                    <option key={c.slug} value={c.slug}>{c.title}</option>
                                ))}
                            </select>
                            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        <button
                            onClick={() => setIsFilterDrawerOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-transform"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filtrer
                        </button>
                    </div>

                    {/* DESKTOP FILTERS (Hidden < md) */}
                    <div className="hidden md:flex flex-col xl:flex-row xl:items-center justify-between gap-4 flex-1">
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
                        <div className="flex flex-1 items-center gap-2 md:gap-4">

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

                            {/* Date Filter */}
                            <div className="min-w-[150px]">
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
                            <span className="hidden md:inline">Mise à jour...</span>
                        </div>
                    )}
                </div>
            </div>

            <MobileFilterDrawer
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                currentFilters={{ city: currentCity, budget, types, date }}
                onApply={(filters) => {
                    setBudget(filters.budget);
                    setTypes(filters.types);
                    setDate(filters.date);
                    if (filters.city !== currentCity) {
                        handleCityChange(filters.city);
                    } else {
                        updateFilters({ budgetMax: filters.budget, types: filters.types, date: filters.date });
                    }
                }}
                onFilterChange={handleDrawerFilterChange}
                resultCount={previewCount}
            />
        </div>
    );
};
