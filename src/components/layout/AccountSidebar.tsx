'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { User, Heart, FileText, Settings, LogOut } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export const AccountSidebar = () => {
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
        { label: t('profile'), href: "/account", icon: User },
        { label: t('favorites'), href: "/account/favorites", icon: Heart },
        { label: t('applications'), href: "/account/applications", icon: FileText },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
                <h2 className="font-bold text-gray-900">{t('title')}</h2>
            </div>
            <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                                ? 'bg-blue-50 text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-gray-50 mt-4">
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
