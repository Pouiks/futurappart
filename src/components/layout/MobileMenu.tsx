"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { X, ChevronDown, MapPin, BookOpen, Coins, ShieldCheck, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
    const t = useTranslations('Navbar');
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen) return null;
    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Menu Content */}
            <div className="absolute top-0 bottom-0 right-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Menu
                    </span>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Links */}
                <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2">

                    {/* Cities Section */}
                    <div className="border-b border-gray-50 pb-2">
                        <button
                            onClick={() => toggleSection('cities')}
                            className="w-full flex items-center justify-between p-3 text-left rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-gray-900">{t('findHousing')}</span>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'cities' ? 'rotate-180' : ''}`} />
                        </button>

                        {expandedSection === 'cities' && (
                            <div className="ml-14 space-y-1 mt-1 pr-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                {['Paris', 'Lyon', 'Bordeaux', 'Marseille', 'Montpellier', 'Lille'].map((city) => (
                                    <Link
                                        key={city}
                                        href={`/ville/${city.toLowerCase()}`}
                                        className="block py-2 px-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
                                        onClick={onClose}
                                    >
                                        {city}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Resources Section */}
                    <div className="border-b border-gray-50 pb-2">
                        <button
                            onClick={() => toggleSection('resources')}
                            className="w-full flex items-center justify-between p-3 text-left rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-gray-900">{t('resources')}</span>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'resources' ? 'rotate-180' : ''}`} />
                        </button>

                        {expandedSection === 'resources' && (
                            <div className="ml-4 mt-2 space-y-2 pr-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                <Link
                                    href="/blog"
                                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                    onClick={onClose}
                                >
                                    <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-gray-900">{t('blog')}</div>
                                        <div className="text-xs text-gray-500">Conseils et actus</div>
                                    </div>
                                </Link>

                                <Link
                                    href="/blog/aides-logement"
                                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                    onClick={onClose}
                                >
                                    <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                        <Coins className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-gray-900">{t('aids')}</div>
                                        <div className="text-xs text-gray-500">CAF, APL...</div>
                                    </div>
                                </Link>

                                <Link
                                    href="/blog/trouver-un-garant-guide"
                                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                    onClick={onClose}
                                >
                                    <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-gray-900">{t('guarantor')}</div>
                                        <div className="text-xs text-gray-500">Garantme, Visale...</div>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Owner Space */}
                    <div className="py-2">
                        <Link
                            href="/partenaire"
                            className="flex items-center gap-3 p-3 text-left rounded-xl hover:bg-gray-50 transition-colors"
                            onClick={onClose}
                        >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-gray-900">{t('ownerSpace')}</span>
                        </Link>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <Link
                        href="/auth/login"
                        className="flex items-center justify-center w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-[0.98]"
                        onClick={onClose}
                    >
                        Se connecter / S'inscrire
                    </Link>
                </div>
            </div>
        </div>,
        document.body
    );
};
