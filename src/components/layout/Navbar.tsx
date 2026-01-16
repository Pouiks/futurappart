"use client";

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, BookOpen, Coins, ShieldCheck, HelpCircle, Briefcase, MapPin, Menu } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface NavbarProps {
    counts?: {
        favorites: number;
        applications: number;
    } | null;
    alerts?: {
        incompleteProfile: boolean;
    } | null;
}

export const Navbar = ({ counts, alerts }: NavbarProps) => {
    const t = useTranslations('Navbar');
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();



    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
            <div className="container mx-auto px-4 md:px-8 max-w-[1600px] py-6 flex items-center justify-between">

                {/* Mobile Menu Toggle (Left on Mobile) */}
                <div className="md:hidden mr-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Ouvrir le menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group flex-shrink-0 mr-auto md:mr-0">
                    <Image
                        src="/futurappartlogo.png"
                        alt="futurappart"
                        width={300}
                        height={100}
                        className="h-10 md:h-16 w-auto object-contain"
                        priority
                    />
                    <span className="sr-only">futurappart</span>
                </Link>

                {/* Desktop Navigation (Centered & Grouped) */}
                <nav className="hidden md:flex items-center gap-8">

                    {/* DROPDOWN 1: Finder (Cities) */}
                    <div className="relative group h-full flex items-center">
                        <button className="flex items-center gap-1.5 text-gray-900 font-bold hover:text-blue-600 transition-colors py-4 px-2 text-base">
                            <MapPin className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
                            {t('findHousing')}
                            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:rotate-180 transition-transform duration-300" />
                        </button>

                        {/* Dropdown Content */}
                        <div className="absolute top-[70%] left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                            <div className="p-2">
                                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider px-3 py-2 mb-1">{t('cities')}</div>
                                {['Paris', 'Lyon', 'Bordeaux', 'Marseille', 'Montpellier', 'Lille'].map((city) => (
                                    <Link
                                        key={city}
                                        href={`/ville/${city.toLowerCase()}`}
                                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-700 transition-colors group/item"
                                    >
                                        <span>{city}</span>
                                        <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* DROPDOWN 2: Resources */}
                    <div className="relative group h-full flex items-center">
                        <button className="flex items-center gap-1.5 text-gray-900 font-bold hover:text-blue-600 transition-colors py-4 px-2 text-base">
                            <BookOpen className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
                            {t('resources')}
                            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:rotate-180 transition-transform duration-300" />
                        </button>

                        {/* Dropdown Content */}
                        <div className="absolute top-[70%] -left-4 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                            <div className="p-3 space-y-1">
                                <Link href="/blog" className="flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group/item">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-base font-bold text-gray-900 group-hover/item:text-blue-700">{t('blog')}</div>
                                        <div className="text-sm text-gray-600 leading-snug">Conseils et actualités pour étudiants.</div>
                                    </div>
                                </Link>

                                <Link href="/blog/aides-logement" className="flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group/item">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Coins className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-base font-bold text-gray-900 group-hover/item:text-blue-700">{t('aids')}</div>
                                        <div className="text-sm text-gray-600 leading-snug">CAF, APL, Mobili-Jeune...</div>
                                    </div>
                                </Link>

                                <Link href="/blog/trouver-un-garant-guide" className="flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group/item">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-base font-bold text-gray-900 group-hover/item:text-blue-700">{t('guarantor')}</div>
                                        <div className="text-sm text-gray-600 leading-snug">Solutions Visale, Garantme...</div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4">

                    {/* Landlord Link */}
                    <Link
                        href="/partenaire"
                        className="hidden lg:flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mr-2"
                    >
                        <Briefcase className="w-4 h-4" />
                        {t('ownerSpace')}
                    </Link>

                    <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

                    {/* Lang Switcher (Mini) */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                        <Link
                            href={pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')}
                            locale="fr"
                            className={`px-2 py-1 rounded text-sm font-bold transition-all ${locale === 'fr' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            FR
                        </Link>
                        <Link
                            href={pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')}
                            locale="en"
                            className={`px-2 py-1 rounded text-sm font-bold transition-all ${locale === 'en' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            EN
                        </Link>
                    </div>

                    <UserMenu counts={counts} alerts={alerts} />
                </div>
            </div>

            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </header>
    );
};

// Helper Icon
function ArrowRightIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
        </svg>
    )
}
