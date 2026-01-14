'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
    unitId: string;
    initialIsFavorite?: boolean;
    size?: 'sm' | 'md' | 'xl';
    showLabel?: boolean; // For the header button
}

export const FavoriteButton = ({ unitId, initialIsFavorite = false, size = 'md', showLabel = false }: FavoriteButtonProps) => {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Sync state with prop if it changes (e.g. from server refresh)
    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading) return;

        // Check Auth
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            toast.error("Connectez-vous pour sauvegarder ce logement 🔒");
            router.push('/auth');
            return;
        }

        // Optimistic UI
        const newState = !isFavorite;
        setIsFavorite(newState);
        setLoading(true);

        try {
            const endpoint = newState ? '/api/favorites/add' : '/api/favorites/remove';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unitId })
            });

            if (!res.ok) throw new Error('Failed to toggle');
            toast.success(newState ? "Ajouté aux favoris ❤️" : "Retiré des favoris");
            router.refresh(); // Refresh server components to update lists
        } catch (err) {
            // Revert
            setIsFavorite(!newState);
            console.error(err);
            toast.error("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    // Styles Configuration
    const sizeConfig = {
        sm: { btn: 'w-8 h-8', icon: 'w-4 h-4' },
        md: { btn: 'w-10 h-10', icon: 'w-5 h-5' },
        xl: { btn: 'w-14 h-14 shadow-xl hover:scale-105', icon: 'w-8 h-8' } // 'Big Heart'
    };

    if (showLabel) {
        return (
            <button
                onClick={toggleFavorite}
                className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg transition border border-transparent
                   ${isFavorite
                        ? 'text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-200'
                        : 'text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100'
                    }
                `}
            >
                <Heart className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
                {isFavorite ? 'Sauvegardé' : 'Sauvegarder'}
            </button>
        );
    }

    return (
        <button
            onClick={toggleFavorite}
            className={`
                group transition-all duration-300 rounded-full flex items-center justify-center z-20
                ${sizeConfig[size].btn}
                ${isFavorite
                    ? 'bg-white text-red-500 shadow-md'
                    : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white shadow-sm'
                }
            `}
        >
            <Heart
                className={`
                    ${sizeConfig[size].icon} 
                    transition-transform duration-300 
                    ${isFavorite ? 'fill-current text-red-500 scale-110' : 'group-hover:scale-110'}
                `}
            />
        </button>
    );
};
