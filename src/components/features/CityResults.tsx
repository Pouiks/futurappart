'use client';

import React, { useState, useRef } from 'react';
import { UnitCard } from '@/components/ui/UnitCard';
import { Link } from '@/i18n/navigation';
import { Map as MapIcon, List as ListIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslations } from 'next-intl';

// Lazy load map to avoid SSR issues
const CityMap = dynamic(
    () => import('./CityMap').then((mod) => mod.CityMap),
    {
        loading: () => <Skeleton className="h-full w-full bg-gray-200" />,
        ssr: false
    }
);

interface CityResultsProps {
    candidates: any[];
    city: string;
}

export const CityResults = ({ candidates, city }: CityResultsProps) => {
    const t = useTranslations('CityPage');

    const [showMap, setShowMap] = useState(false);
    const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);
    const listContainerRef = useRef<HTMLDivElement>(null);

    const toggleMap = () => setShowMap(!showMap);

    // Custom smooth scroll function
    const scrollToTarget = (targetId: string) => {
        const container = listContainerRef.current;
        const target = document.getElementById(targetId);

        if (!target) return;

        // If map is NOT showing, we rely on window scroll usually, but here the container logic is slightly different.
        // If !showMap, the container ref points to the div, but that div might not be the scrolling element if it's full page.
        // However, let's assume if !showMap, we scroll window.
        if (!showMap) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (!container) return;

        // Calculate position relative to the scrolling container
        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        // We want to center the target in the container
        const relativeTop = targetRect.top - containerRect.top;
        const currentScroll = container.scrollTop;
        const targetScroll = currentScroll + relativeTop - (container.clientHeight / 2) + (target.clientHeight / 2);

        const startPosition = currentScroll;
        const distance = targetScroll - startPosition;
        const duration = 1000; // 1s duration
        let start: number | null = null;

        const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };

        const animation = (currentTime: number) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);

            container.scrollTop = run;

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    };

    return (
        <div className="flex flex-col h-full">

            {/* Main Content Area */}
            <div className={`flex flex-col-reverse lg:flex-row gap-6 ${showMap ? 'h-[calc(100vh-160px)]' : ''}`}>

                {/* LIST SECTION */}
                <div
                    ref={listContainerRef}
                    className={`transition-all duration-500 ease-in-out ${showMap ? 'lg:w-1/2 overflow-y-auto pr-2' : 'w-full'}`}
                >

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="hidden lg:block">
                            {/* Desktop Map Toggle */}
                            <button
                                onClick={toggleMap}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-sm border ${showMap ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                            >
                                {showMap ? (
                                    <>
                                        <ListIcon className="w-4 h-4" />
                                        Fermer la carte
                                    </>
                                ) : (
                                    <>
                                        <MapIcon className="w-4 h-4" />
                                        Afficher la carte
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Mobile/Tablet Map Toggle (Visible when no sidebar) */}
                        <div className="lg:hidden w-full">
                            <button
                                onClick={toggleMap}
                                className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-bold bg-white text-gray-900 border border-gray-200 shadow-sm"
                            >
                                {showMap ? 'Voir la liste' : 'Voir la carte'}
                            </button>
                        </div>

                        {/* Alert Box - Horizontal Banner in List View */}
                        <div className="flex-1 w-full lg:w-auto bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between gap-4 max-w-2xl ml-auto">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg text-xl">🔔</div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Alerte Nouveauté</h4>
                                    <p className="text-gray-500 text-xs hidden sm:block">Soyez notifié dès qu'un logement est dispo à {city}.</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 whitespace-nowrap">
                                Créer une alerte
                            </button>
                        </div>
                    </div>

                    <div className={`grid gap-4 ${showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'}`}>
                        {candidates.map((u, idx) => {
                            return (
                                <div
                                    key={u.id}
                                    id={`unit-${u.id}`}
                                    onMouseEnter={() => setHoveredUnitId(u.id)}
                                    onMouseLeave={() => setHoveredUnitId(null)}
                                    className={`scroll-mt-32 transition-all duration-300 ${hoveredUnitId === u.id ? 'transform scale-[1.02] ring-2 ring-blue-400 rounded-2xl z-10' : ''}`}
                                >
                                    <UnitCard unit={u} rank={idx + 1} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* MAP SECTION */}
                <div className={`transition-all duration-500 ease-in-out relative ${showMap ? 'lg:w-1/2 h-[400px] lg:h-full opacity-100' : 'w-0 h-0 opacity-0 overflow-hidden'}`}>
                    <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-inner border border-gray-200 bg-gray-100">
                        {showMap && (
                            <CityMap
                                city={city}
                                units={candidates}
                                hoveredUnitId={hoveredUnitId}
                                onMarkerClick={(id) => {
                                    setHoveredUnitId(id);
                                    scrollToTarget(`unit-${id}`);
                                }}
                                onMarkerHover={(id) => setHoveredUnitId(id)}
                            />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
