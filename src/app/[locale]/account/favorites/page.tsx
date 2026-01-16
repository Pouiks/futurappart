import { prisma } from '@/lib/db';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getCachedUser } from '@/lib/auth-cache';
import { redirect } from 'next/navigation';
import { UnitCard } from '@/components/ui/UnitCard';
import { getTranslations } from 'next-intl/server';
import { Heart } from 'lucide-react';

export default async function FavoritesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('UnitCard'); // Reusing UnitCard translations
    const user = await getCachedUser();

    if (!user) {
        redirect('/auth');
    }

    const favorites = await prisma.favorite.findMany({
        where: { userId: user.id },
        include: {
            unit: {
                include: {
                    residence: true
                }
            }
        }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="text-red-500 fill-current" />
                Mes Favoris
            </h1>

            {favorites.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border dashed border-gray-200">
                    <p className="text-gray-500">Vous n'avez aucun logement sauvegardé pour le moment.</p>
                    <a href="/" className="inline-block mt-4 text-blue-600 font-bold hover:underline">
                        Parcourir les offres
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((fav) => (
                        <UnitCard
                            key={fav.id}
                            unit={{
                                ...fav.unit,
                                residenceName: fav.unit.residence?.name || "Résidence",
                                surface: fav.unit.surface ? Number(fav.unit.surface) : null,
                                price: Number(fav.unit.price)
                            }}
                            isFavorite={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
