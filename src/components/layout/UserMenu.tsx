import { createBrowserClient } from '@supabase/ssr';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { User as UserIcon, LogIn, Heart, FileText, LogOut, LayoutDashboard, Settings, Folder } from 'lucide-react';
import { usePathname as useNextPathname, useSearchParams } from 'next/navigation';

interface UserMenuProps {
    counts?: {
        favorites: number;
        applications: number;
    } | null;
    alerts?: {
        incompleteProfile: boolean;
    } | null;
}

export const UserMenu = ({ counts, alerts }: UserMenuProps) => {
    const t = useTranslations('Navbar');
    const tU = useTranslations('UserMenu');
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const pathname = useNextPathname();
    const searchParams = useSearchParams();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
            setLoading(false);
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    if (loading) return (
        <div className="hidden md:block w-32 h-10 bg-gray-100 rounded-full animate-pulse ml-4" />
    );

    if (user) {
        return (
            <div className="relative group ml-4 z-50">
                <Link
                    href="/account"
                    className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-700 px-5 py-2.5 rounded-full font-bold shadow-sm hover:bg-blue-100 transition-all border border-blue-100 group-hover:shadow-md relative"
                >
                    <UserIcon className="w-4 h-4" />
                    {t('myAccount')}
                    {alerts?.incompleteProfile && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                </Link>

                {/* Dropdown Menu - Wrapped with padding for bridge */}
                <div className="absolute top-full right-0 pt-2 w-72 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform origin-top-right">

                        {/* Header */}
                        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                            <p className="text-sm font-bold text-gray-500">{tU('connectedAs')}</p>
                            <p className="text-base font-bold text-gray-900 truncate">{user.email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2 space-y-1">
                            {alerts?.incompleteProfile && (
                                <Link href="/account/edit" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-50 text-orange-700 font-bold hover:bg-orange-100 transition-colors mb-1">
                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                                    <span className="text-sm">{tU('completeProfile')}</span>
                                </Link>
                            )}
                            <Link href="/account" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-900 font-bold transition-colors">
                                <LayoutDashboard className="w-5 h-5 text-gray-400" />
                                {tU('dashboard')}
                            </Link>

                            <Link href="/account/favorites" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-900 font-bold transition-colors group/item">
                                <div className="flex items-center gap-3">
                                    <Heart className="w-5 h-5 text-red-400 group-hover/item:text-red-500 transition-colors" />
                                    {tU('favorites')}
                                </div>
                                {counts?.favorites ? (
                                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {counts.favorites}
                                    </span>
                                ) : null}
                            </Link>

                            <Link href="/account/dossier" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-900 font-bold transition-colors group/item">
                                <Folder className="w-5 h-5 text-indigo-400 group-hover/item:text-indigo-500 transition-colors" />
                                {tU('dossier')}
                            </Link>

                            <Link href="/account/applications" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-900 font-bold transition-colors group/item">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-blue-400 group-hover/item:text-blue-500 transition-colors" />
                                    {tU('applications')}
                                </div>
                                {counts?.applications ? (
                                    <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {counts.applications}
                                    </span>
                                ) : null}
                            </Link>
                        </div>

                        {/* Footer / Logout */}
                        <div className="p-2 border-t border-gray-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 font-bold transition-colors text-left"
                            >
                                <LogOut className="w-5 h-5" />
                                {tU('logout')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuery = searchParams.toString();
    const returnTo = `${pathname}${currentQuery ? `?${currentQuery}` : ''}`;

    return (
        <Link
            href={`/auth?returnTo=${encodeURIComponent(returnTo)}`}
            className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5 ml-4"
        >
            <LogIn className="w-4 h-4" />
            {t('login')}
        </Link>
    );
};
