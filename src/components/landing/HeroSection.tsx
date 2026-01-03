import React from 'react';
import { useTranslations } from 'next-intl';
import { SearchOverlay } from './SearchOverlay';

export const HeroSection = () => {
    const t = useTranslations('Hero');

    return (
        <section className="relative w-full min-h-[75vh] flex items-center justify-center overflow-hidden py-16 pb-16">

            {/* Background Image Setup */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-800/60 z-10" />
                <img
                    src="/assets/student_room.png"
                    alt="Etudiants Campus"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content Container */}
            <div className="relative z-20 container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">

                {/* Left: Text */}
                <div className="text-white text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg leading-tight">
                        {t('title')}
                    </h1>
                    <p className="text-xl md:text-2xl mb-10 text-blue-100 font-light leading-relaxed">
                        {t('subtitle')}
                    </p>

                    {/* Trust Indicators (Desktop Left) */}
                    <div className="hidden lg:flex flex-wrap gap-6 text-sm font-medium text-blue-200 opacity-90">
                        <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">✓ 100% Gratuit</span>
                        <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">✓ Pas de frais de dossier</span>
                        <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">✓ Réponse sous 24h</span>
                    </div>
                </div>

                {/* Right: Search Overlay */}
                <div className="w-full">
                    <SearchOverlay />
                    {/* Trust Indicators (Mobile) */}
                    <div className="mt-8 flex lg:hidden flex-wrap justify-center gap-4 text-sm font-medium text-blue-200 opacity-90">
                        <span className="flex items-center gap-2">✓ 100% Gratuit</span>
                        <span className="flex items-center gap-2">✓ Pas de frais de dossier</span>
                    </div>
                </div>

            </div>
        </section>
    );
};
