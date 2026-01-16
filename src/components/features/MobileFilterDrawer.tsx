"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, SlidersHorizontal, MapPin, Calendar, Home, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CITIES, UNIT_TYPES } from '@/lib/search-constants';

interface MobileFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    currentFilters: {
        city: string;
        budget: number;
        types: string[];
        date: string;
    };
    onApply: (filters: { city: string; budget: number; types: string[]; date: string }) => void;
    onFilterChange: (filters: { city: string; budget: number; types: string[]; date: string }) => void;
    resultCount?: number;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({ isOpen, onClose, currentFilters, onApply, onFilterChange, resultCount }) => {
    const t = useTranslations('SearchOverlay');
    const tCommon = useTranslations('Common');
    const [mounted, setMounted] = useState(false);

    // Local state for deferred application
    const [city, setCity] = useState(currentFilters.city);
    const [budget, setBudget] = useState(currentFilters.budget);
    const [types, setTypes] = useState<string[]>(currentFilters.types);
    const [date, setDate] = useState(currentFilters.date);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync when opening
    useEffect(() => {
        if (isOpen) {
            setCity(currentFilters.city);
            setBudget(currentFilters.budget);
            setTypes(currentFilters.types);
            setDate(currentFilters.date);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Notify parent of changes for dynamic counting
    useEffect(() => {
        if (isOpen) {
            onFilterChange({ city, budget, types, date });
        }
    }, [city, budget, types, date, isOpen]);

    if (!mounted || !isOpen) return null;

    const toggleType = (type: string) => {
        setTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    };

    const handleApply = () => {
        onApply({ city, budget, types, date });
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] md:hidden flex flex-col">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer Content */}
            <div className="relative mt-auto h-[85vh] w-full bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <SlidersHorizontal className="w-6 h-6 text-blue-600" />
                        Filtres
                    </h2>
                    <button onClick={onClose} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-10">

                    {/* Destination */}
                    <section>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Destination
                        </h3>
                        <div className="relative group">
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full appearance-none bg-blue-50/50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 text-gray-900 text-lg font-bold rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all cursor-pointer"
                            >
                                {CITIES.map(c => (
                                    <option key={c.slug} value={c.slug}>{c.title}</option>
                                ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                                <span className="text-xs font-bold bg-blue-100 px-2 py-1 rounded-md group-hover:bg-blue-200 transition-colors">Modifier</span>
                            </div>
                        </div>
                    </section>

                    {/* Budget */}
                    <section>
                        <div className="flex justify-between items-end mb-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span>💰</span> Budget Max
                            </h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-blue-600 tracking-tight">{budget}</span>
                                <span className="text-lg font-bold text-blue-600">€</span>
                            </div>
                        </div>
                        <div className="relative h-6 flex items-center">
                            <div className="absolute w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${((budget - 300) / (2000 - 300)) * 100}%` }} />
                            </div>
                            <input
                                type="range"
                                min="300"
                                max="2000"
                                step="50"
                                value={budget}
                                onChange={(e) => setBudget(Number(e.target.value))}
                                className="relative w-full h-6 opacity-0 cursor-pointer z-10"
                            />
                            <div
                                className="absolute h-6 w-6 bg-white border-2 border-blue-600 rounded-full shadow-md pointer-events-none transition-all"
                                style={{ left: `calc(${((budget - 300) / (2000 - 300)) * 100}% - 12px)` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-400 mt-3">
                            <span>300€</span>
                            <span>2000€+</span>
                        </div>
                    </section>


                    {/* Types */}
                    <section>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Home className="w-4 h-4" /> Type de logement
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {UNIT_TYPES.map(type => {
                                const isSelected = types.includes(type);
                                return (
                                    <button
                                        key={type}
                                        onClick={() => toggleType(type)}
                                        className={`group relative px-4 py-4 rounded-2xl border-2 text-sm font-bold transition-all duration-200 outline-none
                                            ${isSelected
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                                                : 'border-gray-100 bg-white text-gray-600 hover:border-blue-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {tCommon(`UnitTypes.${type}`)}
                                        </span>

                                        {isSelected && (
                                            <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white rounded-full p-0.5 shadow-sm scale-100 animate-in zoom-in-50 duration-200">
                                                <Check className="w-3 h-3 stroke-[3px]" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Date */}
                    <section>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Date de disponibilité
                        </h3>
                        <div className="relative">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full appearance-none bg-gray-50 hover:bg-white border-2 border-gray-100 hover:border-blue-200 text-gray-900 text-lg font-bold rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all cursor-pointer"
                            />
                        </div>
                    </section>

                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-gray-100 bg-white pb-safe">
                    <button
                        onClick={handleApply}
                        className="w-full bg-gray-900 hover:bg-black text-white text-lg font-bold py-4 rounded-2xl shadow-xl shadow-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                        <span>Afficher les résultats</span>
                        {resultCount !== undefined && (
                            <span className="bg-white/20 text-white text-sm px-2 py-0.5 rounded-full font-medium group-hover:bg-white/30 transition-colors">
                                {resultCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
