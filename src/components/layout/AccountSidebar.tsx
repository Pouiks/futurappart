'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { User, Heart, FileText, Settings, LogOut, Folder } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface AccountSidebarProps {
    favoritesCount?: number;
}

export const AccountSidebar = ({ favoritesCount = 0 }: AccountSidebarProps) => {
    const t = useTranslations('AccountSidebar');
    const pathname = usePathname();
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/');
    };

    const navItems = [
        { label: t('dossier'), href: "/account/dossier", icon: Folder },
        {
            label: t('favorites'),
            href: "/account/favorites",
            icon: Heart,
            badge: favoritesCount > 0 ? favoritesCount : undefined
        },
        { label: t('applications'), href: "/account/applications", icon: FileText },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-50 flex justify-between items-center md:block">
                <h2 className="font-bold text-gray-900">{t('title')}</h2>
                <button
                    onClick={handleSignOut}
                    className="md:hidden text-red-600 p-2 hover:bg-red-50 rounded-lg"
                    title={t('logout')}
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* Mobile: Horizontal Scroll, Desktop: Vertical Stack */}
            <nav className="flex md:block overflow-x-auto p-2 md:p-4 gap-2 md:space-y-2 no-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl font-medium transition-all whitespace-nowrap flex-shrink-0 ${isActive
                                ? 'bg-blue-50 text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className="text-xs md:text-base">{item.label}</span>
                            {item.badge && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="hidden md:block p-4 border-t border-gray-50 mt-4">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all text-left"
                >
                    <LogOut className="w-5 h-5" />
                    {t('logout')}
                </button>
            </div>
        </div>
    );
};
