'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FilterPanel } from '@/components/features/FilterPanel';
import { UnitCard } from '@/components/ui/UnitCard';
import { useTranslations } from 'next-intl';

// Dynamic import for Leaflet map to avoid SSR issues
const CityMap = dynamic(
    () => import('@/components/features/CityMap').then((mod) => mod.CityMap),
    { ssr: false }
);

export default function SearchPage() {
    const t = useTranslations('Search.results');
    const [results, setResults] = useState<any[]>([]);
    const [others, setOthers] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Interaction State
    const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);

    // Track current city for Map
    const [currentCity, setCurrentCity] = useState('France');

    // Map Toggle State
    const [showMap, setShowMap] = useState(false);

    // Initial search on mount
    useEffect(() => {
        // Optional: trigger default search
    }, []);

    const handleSearch = async (filters: any) => {
        setLoading(true);
        setHasSearched(true);
        setCurrentCity(filters.city);

        // Sync URL with filters for shareability
        const params = new URLSearchParams();
        params.set('city', filters.city);
        params.set('budgetMax', filters.budgetMax.toString());
        params.set('minSurface', filters.minSurface.toString());
        if (filters.types) params.set('types', filters.types.join(','));
        if (filters.priority) params.set('priority', filters.priority);

        // Update URL without reloading
        window.history.replaceState(null, '', `?${params.toString()}`);

        try {
            const res = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters)
            });
            const data = await res.json();
            setResults(data.recommendations || []);
            setOthers(data.others || []);
            setMeta(data.meta || {});
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const allUnits = [...results, ...others];

    return (
        <div className={`bg-gray-50 font-sans text-gray-900 flex flex-col ${showMap ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
            {/* Map Toggle Button (Floating or Sticky) */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
                <button
                    onClick={() => setShowMap(!showMap)}
                    className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    {showMap ? 'Liste' : 'Carte'}
                </button>
            </div>

            <main className={`flex-1 w-full max-w-[1920px] mx-auto flex flex-col md:flex-row relative ${showMap ? 'overflow-hidden' : ''}`}>

                {/* Left: Filters (Sidebar) */}
                <aside className={`w-full md:w-80 flex-shrink-0 bg-white border-r border-gray-200 z-20 hidden md:block ${showMap ? 'overflow-y-auto' : 'sticky top-0 h-screen overflow-y-auto'}`}>
                    <div className="p-4">
                        <FilterPanel onSearch={handleSearch} />
                    </div>
                </aside>

                {/* Middle: Results */}
                <div className={`flex-1 p-4 md:p-6 bg-gray-50 relative transition-all duration-300 ${showMap ? 'overflow-y-auto' : ''}`} id="results-container">

                    {/* Desktop Toggle Button */}
                    <div className="hidden md:flex justify-end mb-4">
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm transition-all"
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            {showMap ? 'Masquer la carte' : 'Afficher la carte'}
                        </button>
                    </div>

                    {!hasSearched && (
                        <div className="text-center py-20 opacity-50">
                            <h2 className="text-2xl font-bold mb-2">{t('launchSearch')}</h2>
                            <p>{t('launchSearchDesc')}</p>
                        </div>
                    )}

                    {loading && (
                        <div className="space-y-4 animate-pulse max-w-2xl mx-auto">
                            <div className="h-48 bg-gray-200 rounded-lg"></div>
                            <div className="h-48 bg-gray-200 rounded-lg"></div>
                            <div className="h-48 bg-gray-200 rounded-lg"></div>
                        </div>
                    )}

                    {!loading && hasSearched && (
                        <div className={`space-y-12 ${showMap ? 'max-w-2xl mx-auto' : ''}`}>
                            <section>
                                <div className="flex items-baseline justify-between mb-6">
                                    <h2 className="text-2xl font-bold">Nos Recommandations</h2>
                                    {meta?.total > 0 && <span className="text-sm text-gray-500">{t('analyzed', { count: meta.total })}</span>}
                                </div>

                                {results.length > 0 ? (
                                    <div className={`grid gap-6 ${showMap ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}`}>
                                        {results.map((unit, idx) => (
                                            <div
                                                key={unit.id}
                                                id={`unit-${unit.id}`}
                                                className={`transition-all duration-200 rounded-xl ${hoveredUnitId === unit.id ? 'ring-2 ring-blue-500 shadow-lg scale-[1.02]' : ''}`}
                                                onMouseEnter={() => setHoveredUnitId(unit.id)}
                                                onMouseLeave={() => setHoveredUnitId(null)}
                                            >
                                                <UnitCard unit={unit} rank={idx + 1} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                                        <h3 className="font-bold text-yellow-800 text-lg mb-2">{t('emptyTitle')}</h3>
                                        <p className="text-yellow-700">{t('emptyDesc')}</p>
                                    </div>
                                )}
                            </section>

                            {others.length > 0 && (
                                <section className="pt-8 border-t border-gray-100">
                                    <h2 className="text-xl font-bold mb-1 text-gray-800">{t('others')}</h2>
                                    <div className={`grid gap-4 mt-6 ${showMap ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4'}`}>
                                        {others.map((unit) => (
                                            <div
                                                key={unit.id}
                                                className={`group bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center transition cursor-pointer ${hoveredUnitId === unit.id ? 'border-blue-500 shadow-md bg-blue-50' : 'hover:border-blue-200 hover:shadow-md'}`}
                                                onMouseEnter={() => setHoveredUnitId(unit.id)}
                                                onMouseLeave={() => setHoveredUnitId(null)}
                                            >
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-700 group-hover:text-blue-700 transition">{unit.residenceName}</h4>
                                                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                            {t('match', { quality: unit.score > 70 ? 'Très bon' : 'Bon' })}
                                                        </span>
                                                        <span>{Math.round(unit.price)}€/mois</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Link href={`/logement/${unit.id}`} className="text-sm font-bold text-blue-600 hover:underline">{t('view')}</Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Map (Conditionnal) */}
                {showMap && (
                    <div className="hidden lg:block w-[45%] h-full bg-gray-200 relative">
                        <CityMap
                            city={currentCity}
                            units={allUnits}
                            hoveredUnitId={hoveredUnitId}
                            onMarkerHover={setHoveredUnitId}
                            onMarkerClick={(id) => {
                                const el = document.getElementById(`unit-${id}`);
                                if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    // Update URL hash without scrolling (native behavior suppressed by scrollIntoView)
                                    window.history.replaceState(null, '', `#unit-${id}`);
                                    setHoveredUnitId(id);
                                }
                            }}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
