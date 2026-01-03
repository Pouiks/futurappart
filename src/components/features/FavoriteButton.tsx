'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
    unitId: string;
    initialIsFavorite?: boolean;
    compact?: boolean;
}

export const FavoriteButton = ({ unitId, initialIsFavorite = false, compact = false }: FavoriteButtonProps) => {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
            router.refresh(); // Refresh server components to update lists
        } catch (err) {
            // Revert
            setIsFavorite(!newState);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            className={`
                group transition-all duration-300 rounded-full flex items-center justify-center
                ${compact ? 'w-8 h-8' : 'w-10 h-10'}
                ${isFavorite
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-white/80 backdrop-blur-sm text-gray-500 hover:bg-white hover:text-red-500 hover:scale-110 shadow-sm'
                }
            `}
        >
            <Heart
                className={`
                    ${compact ? 'w-4 h-4' : 'w-5 h-5'} 
                    transition-transform duration-300 
                    ${isFavorite ? 'fill-current scale-110' : 'group-hover:scale-110'}
                `}
            />
        </button>
    );
};
