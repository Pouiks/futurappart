import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Check, Star, Ruler, Euro, ArrowLeft, MapPin, Wifi, Shield, Train, Sofa, Shirt, Bike } from 'lucide-react';
import Link from 'next/link';
import { ResidenceMapWrapper } from '@/components/features/ResidenceMapWrapper';
import { ScoringService } from '@/core/scoring';
import { StickySubNav } from '@/components/features/StickySubNav';
import { SubscriptionCTA } from '@/components/features/SubscriptionCTA';

interface PageProps {
    params: Promise<{ id: string; locale: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// 1. Generate Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const unit = await prisma.canonUnit.findUnique({
        where: { id },
        include: { residence: true }
    });

    if (!unit) return { title: 'Logement introuvable' };

    return {
        title: `${unit.type} à ${unit.residence.cityNormalized} - ${unit.price}€`,
        description: `Louez ce ${unit.type} de ${unit.surface}m² à ${unit.residence.name}. Dispo immédiate !`,
    };
}

// 2. Page Content
export default async function LogementPage({ params }: PageProps) {
    const { id, locale } = await params;

    // Auth Session
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch Profile for Completion Check
    let isProfileComplete = false;
    if (user) {
        const profile = await prisma.profile.findUnique({
            where: { id: user.id },
            include: { guarantors: true }
        });
        isProfileComplete = !!(profile?.income && profile.income > 0 && profile.guarantors && profile.guarantors.length > 0);
    }

    const unit = await prisma.canonUnit.findUnique({
        where: { id },
        include: { residence: true }
    });

    if (!unit) notFound();

    // Fetch Stats for accurate scoring
    const cityStats = await prisma.cityStatsDaily.findFirst({
        where: {
            cityNormalized: unit.residence.cityNormalized,
            unitType: unit.type
        },
        orderBy: { date: 'desc' }
    });

    // Run Scoring
    const statsForScoring = {
        medianPrice: cityStats?.medianPrice ?? null,
        medianPriceM2: cityStats?.medianPriceM2 ?? null,
        medianSurface: cityStats?.medianSurface ?? null
    };

    const scoreResult = ScoringService.score({
        ...unit,
        surface: unit.surface ? Number(unit.surface) : null,
        priceM2: (unit.surface && Number(unit.surface) > 0) ? Math.round(unit.price / Number(unit.surface)) : null,
        cityStats: statsForScoring,
        trustScore: unit.residence.trustScore || 50
    } as any, { priority: 'BALANCE' });

    // Helper to generate a consistent gallery based on ID
    const getGalleryImages = (type: string, id: string) => {
        const t = type.toUpperCase();
        const baseImages = [
            "/assets/default_studio.png",
            "/assets/student_studio_modern.png",
            "/assets/student_studio_cozy.png",
            "/assets/student_studio_minimal.png"
        ];

        // Simple hash of ID to pick start index
        const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        // Coloc logic
        if (t.includes('COLOC') || t.includes('T3')) {
            return ["/assets/default_coloc.png", "/assets/student_studio_modern.png", "/assets/student_studio_minimal.png"];
        }

        const start = seed % baseImages.length;
        const gallery = [];
        for (let i = 0; i < 3; i++) {
            gallery.push(baseImages[(start + i) % baseImages.length]);
        }
        return gallery;
    };

    const gallery = getGalleryImages(unit.type, unit.id);

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Secondary Sticky Nav */}
            <StickySubNav />

            {/* Back Button / Title */}
            <div className="bg-white border-b px-6 py-4">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <Link href={`/ville/${unit.residence.cityNormalized}`} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Retour rechercher</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition border border-transparent hover:border-blue-100">
                            Partager
                        </button>
                        <button className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition border border-transparent hover:border-red-100">
                            Sauvegarder
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Visuals & Info */}
                <div className="lg:col-span-7 space-y-10">

                    {/* SECTION: ATOUTS / HIGHLIGHTS - HERO GRID */}
                    <section id="highlights" className="space-y-6 scroll-mt-40">
                        {/* Bento Grid Gallery */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px] md:h-[450px] rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white p-1">
                            {/* Main Large Image */}
                            <div className="relative h-[300px] md:h-full md:col-span-1 rounded-2xl overflow-hidden group cursor-pointer">
                                <img
                                    src={gallery[0]}
                                    alt={`${unit.residence.name} - Vue principale`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                                <div className="absolute bottom-4 left-4">
                                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-blue-900 shadow-sm uppercase tracking-wider">
                                        Principal
                                    </span>
                                </div>
                            </div>

                            {/* Secondary Column */}
                            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 h-full">
                                {/* Top Right */}
                                <div className="relative h-full rounded-2xl overflow-hidden group cursor-pointer">
                                    <img
                                        src={gallery[1]}
                                        alt="Cuisine / Bureau"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                {/* Bottom Right */}
                                <div className="relative h-full rounded-2xl overflow-hidden group cursor-pointer">
                                    <div className="absolute inset-0 bg-gray-900/10 group-hover:bg-transparent transition-colors z-10" />
                                    <img
                                        src={gallery[2]}
                                        alt="Détail"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute bottom-4 right-4 z-20">
                                        <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-gray-50 transition">
                                            <span className="hidden sm:inline">Voir les</span> photos
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Title & Badge Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                                    {unit.type} • {unit.residence.name}
                                </h1>
                                <p className="text-gray-500 text-lg flex items-center gap-2 mt-2 font-medium">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    {unit.residence.address}, {unit.residence.cityNormalized}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {(unit.residence.status === 'PARTNER_EMAIL' || unit.residence.status === 'PARTNER_SLA') && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold border border-indigo-100">
                                        <Shield className="w-4 h-4" /> Résidence Partenaire
                                    </span>
                                )}
                                {unit.residence.status === 'PARTNER_SLA' && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-bold border border-purple-100">
                                        <Star className="w-4 h-4" /> Réponse sous {unit.residence.slaDays || 2}j
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100">
                                    <Check className="w-4 h-4" /> Dispo immédiate
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-bold border border-green-100">
                                    Vérifié
                                </span>
                            </div>
                        </div>

                        {/* Key Metrics - Glassmorphism */}
                        <div className="grid grid-cols-3 gap-4 md:gap-6">
                            <div className="p-6 rounded-2xl bg-white border border-blue-50 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                                    <Euro className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{unit.price}€</span>
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">Loyer CC / mois</span>
                            </div>
                            <div className="p-6 rounded-2xl bg-white border border-purple-50 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group">
                                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                                    <Ruler className="w-6 h-6 text-purple-600" />
                                </div>
                                <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{unit.surface ? unit.surface.toString() : '?'}m²</span>
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">Surface habitable</span>
                            </div>
                            <div className="p-6 rounded-2xl bg-white border border-yellow-50 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group">
                                <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center mb-3 group-hover:bg-yellow-100 transition-colors">
                                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                </div>
                                <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{scoreResult.totalScore}/100</span>
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">Score Qualité</span>
                            </div>
                        </div>
                    </section>

                    {/* SECTION: DESCRIPTION */}
                    <section id="description" className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm scroll-mt-40">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">À propos du logement</h2>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            Ce logement étudiant idéalement situé à {unit.residence.cityNormalized} offre un cadre de vie parfait pour réussir ses études.
                            Proche des transports et des écoles, la résidence {unit.residence.name} propose des services adaptés aux besoins des étudiants.
                            Profitez d'un environnement calme et sécurisé, propice au travail et à la détente.
                        </p>
                    </section>

                    {/* SECTION: EQUIPEMENTS */}
                    <section id="amenities" className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm scroll-mt-40">
                        <h2 className="font-bold text-2xl text-gray-900 mb-6 flex items-center gap-3">
                            Équipements & Services
                            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full uppercase tracking-wider">Premium</span>
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {['Wifi Haut Débit', 'Sécurisé', 'Proche Métro', 'Meublé', 'Laverie', 'Local Vélo', 'Salle de Sport', 'Espace Coworking'].map((s, i) => {
                                let Icon = Check;
                                let colorClass = "text-green-600";
                                if (s.includes('Wifi')) Icon = Wifi;
                                if (s.includes('Sécurisé')) { Icon = Shield; colorClass = "text-blue-600"; }
                                if (s.includes('Métro')) { Icon = Train; colorClass = "text-red-600"; }
                                if (s.includes('Meublé')) { Icon = Sofa; colorClass = "text-orange-600"; }
                                if (s.includes('Laverie')) { Icon = Shirt; colorClass = "text-cyan-600"; }
                                if (s.includes('Vélo')) { Icon = Bike; colorClass = "text-indigo-600"; }
                                return (
                                    <div key={i} className="flex flex-col items-center p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors text-center group cursor-default">
                                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Icon className={`w-6 h-6 ${colorClass}`} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 group-hover:text-blue-800">{s}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* SECTION: LOCALISATION */}
                    <section id="location" className="scroll-mt-40">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Localisation</h2>
                        <div className="h-[400px] relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                            <ResidenceMapWrapper
                                address={unit.residence.address || unit.residence.cityNormalized}
                                city={unit.residence.cityNormalized}
                            />
                        </div>
                    </section>

                </div>

                {/* RIGHT COLUMN: Subscription Form - Sticky */}
                <div className="lg:col-span-5">
                    <div className="sticky top-40">
                        <SubscriptionCTA
                            unit={{
                                ...unit,
                                surface: unit.surface ? Number(unit.surface) : null,
                                price: Number(unit.price) // Ensure price is number too if ever changed to Decimal
                            }}
                            user={user}
                            locale={locale}
                            isProfileComplete={isProfileComplete}
                        />
                        <div className="mt-6 pt-6 border-t border-gray-100 bg-white p-6 rounded-3xl shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-3 text-sm">Pourquoi réserver ici ?</h3>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li className="flex gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    Service 100% Gratuit
                                </li>
                                <li className="flex gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    Réponse sous 24h garantie
                                </li>
                                <li className="flex gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    Pas de frais cachés
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
