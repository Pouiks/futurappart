'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { FavoriteButton } from '@/components/features/FavoriteButton';

interface UnitCardProps {
    unit: any; // Type strictly later
    rank?: number;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, rank }) => {
    const t = useTranslations('UnitCard');

    // Basic heuristics to guess brand (MVP only)
    const getBrand = (name: string, url: string) => {
        if (!name) return 'RÉSIDENCE';
        const brands = ['STUDEA', 'KLEY', 'TWENTY CAMPUS', 'LES BELLES ANNEES', 'NEMEA', 'CARDINAL', 'NEXITY', 'FAC-HABITAT', 'SUITETUDES'];
        const found = brands.find(b => name.toUpperCase().includes(b));

        if (found) return found;

        // Fallback: extract from URL
        try {
            if (!url) return 'RÉSIDENCE';
            const domain = new URL(url).hostname;
            const parts = domain.split('.');
            let brand = parts.length > 2 ? parts[parts.length - 2] : parts[0];

            // Custom mappings
            if (brand === 'residencesartemisia') return 'RÉSIDENCES ARTÉMISIA';

            return brand.replace(/-/g, ' ').toUpperCase();
        } catch (e) {
            return 'RÉSIDENCE';
        }
    };

    const brandName = getBrand(unit.residenceName, unit.url || '');
    const cleanName = unit.residenceName.replace(brandName, '').trim() || unit.residenceName;
    const displayBrand = brandName === 'RÉSIDENCE' ? 'RÉSIDENCE INDÉPENDANTE' : brandName;

    const getPlaceholderImage = (type: string, id: string) => {
        const t = type.toUpperCase();

        // Seed based on unit ID (simple hash)
        const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        if (t.includes('COLOCATION') || t.includes('T3') || t.includes('T4')) {
            return "/assets/default_coloc.png";
        }
        if (t.includes('T2')) {
            // Mix T2 with some spacious studio images if needed, but for now stick to one
            // Or use the cozy one as it looks big enough
            return seed % 2 === 0 ? "/assets/default_t2.png" : "/assets/student_studio_cozy.png";
        }

        // Studios / T1 (The majority) - Rotate between 4 variations
        const variations = [
            "/assets/default_studio.png",
            "/assets/student_studio_modern.png",
            "/assets/student_studio_cozy.png",
            "/assets/student_studio_minimal.png"
        ];

        return variations[seed % variations.length];
    };

    // Mock availability (random for MVP if not present)
    const isAvailable = unit.available !== false;
    const availableLabel = isAvailable ? t('available') : `${t('availableFrom')} 01/09`;

    return (
        <div className={`group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 w-full flex flex-col ${rank === 1 ? 'ring-2 ring-blue-500' : ''}`}>

            {/* Top Badge for Rank 1 */}
            {rank === 1 && (
                <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg z-30 shadow-md">
                    {t('bestChoice')}
                </div>
            )}

            {/* Favorite Button (Top Right) */}
            <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <FavoriteButton unitId={unit.id} />
            </div>

            {/* Image Section (Top, Full Width) */}
            <Link href={`/logement/${unit.id}`} className="w-full aspect-[16/10] overflow-hidden relative cursor-pointer block bg-gray-100">
                <img
                    src={(unit.photo && !unit.photo.includes('placehold.co')) ? unit.photo : getPlaceholderImage(unit.type, unit.id)}
                    alt={unit.residenceName}
                    className="w-full h-full object-cover transform opacity-95 group-hover:scale-105 transition duration-700 ease-out"
                />

                {/* Brand Badge (Bottom Left of Image) */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-md text-xs font-bold text-gray-800 shadow-sm border border-gray-100/50">
                    {displayBrand}
                </div>

                {/* Availability Badge (Top Left of Image - Cleaner) */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide shadow-sm backdrop-blur-md ${isAvailable ? 'bg-green-500/90 text-white' : 'bg-purple-600/90 text-white'}`}>
                    {availableLabel}
                </div>
            </Link>

            {/* Content Section (Bottom) */}
            <div className="flex-1 p-5 md:p-6 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <Link href={`/logement/${unit.id}`} className="block group/title flex-1 pr-3">
                        <h3 className="text-xl font-bold text-gray-900 leading-snug group-hover/title:text-blue-600 transition cursor-pointer line-clamp-1 mb-1">
                            {cleanName}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {t('furnished')} • {unit.surface ? `${unit.surface} m²` : t('surfaceUnknown')}
                        </p>
                    </Link>

                    {/* Price Block */}
                    <div className="text-right shrink-0 pl-2">
                        <span className="text-2xl font-black text-gray-900 block leading-none">{unit.price}€</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{t('monthCC')}</span>
                    </div>
                </div>

                {/* Divider Line */}
                <div className="w-full h-px bg-gray-100 my-4"></div>

                {/* Footer: Tags & CTA */}
                <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        {unit.type && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-semibold">
                                {unit.type}
                            </span>
                        )}
                        {unit.reasons && unit.reasons.length > 0 && (
                            <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-semibold">
                                {unit.reasons[0]}
                            </span>
                        )}
                        {/* Status Badges - Rule B */}
                        {(unit.scoreDetails?.partnerBonus > 0) && (
                            <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-bold border border-indigo-100 flex items-center gap-1">
                                ⭐ Partenaire
                            </span>
                        )}
                    </div>

                    <Link
                        href={`/logement/${unit.id}`}
                        className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1 group/link opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300"
                    >
                        {t('viewOffer')} &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
};
