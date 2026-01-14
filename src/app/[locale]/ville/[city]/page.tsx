
import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { UnitTypeEnum } from '@prisma/client';
import { UnitCard } from '@/components/ui/UnitCard';
import { Search, ChevronDown } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CityResults } from '@/components/features/CityResults';

import { CITY_CONTENT } from '@/data/cityContent';
import { demoUnits, generateMockUnits } from '@/lib/demoData';

// ...







// 1. Generate Metadata dynamically
export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
    const { city } = await params;
    const cityNormalized = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");
    const data = CITY_CONTENT[cityNormalized] || CITY_CONTENT['default'];

    return {
        title: data.title,
        description: data.subtitle,
    };
}

import { CityFilterBar } from '@/components/features/CityFilterBar';

// ... (Metadata function remains same)

// 2. Server Component
export default async function CityPage({
    params,
    searchParams
}: {
    params: Promise<{ city: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { city } = await params;
    const resolvedSearchParams = await searchParams;

    const cityNormalized = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");
    const cityCapitalized = city.charAt(0).toUpperCase() + city.slice(1);
    const t = await getTranslations('CityPage');

    const isDemoRaw = process.env.DEMO_MODE;
    // Handle potential quoting issues in .env files
    const isDemo = isDemoRaw === 'true';

    // 1. Try DB Content (CMS) - ONLY if not in demo mode
    let dbContent = null;
    if (!isDemo) {
        dbContent = await prisma.cityContent.findUnique({
            where: { slug: cityNormalized }
        });
    }

    // 2. Fallback to Hardcoded (Legacy)
    const legacyContent = CITY_CONTENT[cityNormalized] || CITY_CONTENT['default'];

    // 3. Merge (DB takes precedence)
    const cityData = {
        title: dbContent?.title || legacyContent.title,
        subtitle: dbContent?.subtitle || legacyContent.subtitle,
        intro: dbContent?.intro || legacyContent.intro,
        price: dbContent?.price || legacyContent.price,
        transport: (dbContent?.transportJson as any) || legacyContent.transport,
        livingCost: (dbContent?.livingCostJson as any) || legacyContent.livingCost,
        neighborhood_details: (dbContent?.neighborhoodsJson as any) || legacyContent.neighborhood_details,
        faq: (dbContent?.faqJson as any) || legacyContent.faq,
        universities: legacyContent.universities // Not yet in DB, keep legacy
    };

    // Filter Logic
    const budgetMax = Number(resolvedSearchParams.budgetMax) || 1500;
    const rawTypes = resolvedSearchParams.types;

    let rawArray: string[] = [];
    if (typeof rawTypes === 'string') {
        rawArray = [rawTypes];
    } else if (Array.isArray(rawTypes)) {
        rawArray = rawTypes;
    } else {
        // Default only checks valid enums
        rawArray = ['STUDIO', 'COLOCATION', 'COLIVING'];
    }

    // Cast strings to UnitTypeEnum safely
    const typeFilter = rawArray
        .filter(t => Object.values(UnitTypeEnum).includes(t as UnitTypeEnum))
        .map(t => t as UnitTypeEnum);

    // Force default if empty after filtering
    if (typeFilter.length === 0) {
        typeFilter.push(UnitTypeEnum.STUDIO);
        typeFilter.push(UnitTypeEnum.COLOCATION);
    }



    // 3. Fetch Data (SSR)
    // isDemo is already defined above
    console.log(`[CITY] Fetching for ${cityNormalized}, Env Raw: '${isDemoRaw}', Bool: ${isDemo}`);

    let candidates;

    if (isDemo) {
        // Try to filter existing static mocks
        const staticMocks = demoUnits
            .filter(u => u.residence.cityNormalized === cityNormalized);

        // If no static mocks for this city (or not enough), generate them dynamically!
        if (staticMocks.length < 5) {
            console.log(`[CITY] Generating dynamic mocks for ${cityNormalized}`);
            const dynamicMocks = generateMockUnits(cityNormalized, 20); // Generate 20 units
            candidates = [...staticMocks, ...dynamicMocks];
        } else {
            candidates = staticMocks;
        }

        // Apply filters locally on the mocks
        candidates = candidates
            .filter(u =>
                u.price > 0 &&
                u.price <= budgetMax &&
                typeFilter.includes(u.type as UnitTypeEnum)
            )
            .sort((a, b) => a.price - b.price);

    } else {
        candidates = await prisma.canonUnit.findMany({
            where: {
                residence: { cityNormalized: cityNormalized },
                price: {
                    gt: 0,
                    lte: budgetMax
                },
                type: { in: typeFilter }
            },
            include: { residence: true },
            take: 50,
            orderBy: { price: 'asc' }
        });
    }

    const safeNum = (val: any) => (val && typeof val.toNumber === 'function') ? val.toNumber() : val;

    // Premium City Images Mapping
    const cityImages: Record<string, string> = {
        'bordeaux': 'https://images.unsplash.com/photo-1469521669194-babb45f83544?auto=format&fit=crop&w=1600&q=80',
        'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80',
        'lyon': 'https://images.unsplash.com/photo-1621255768652-5df580a5f029?auto=format&fit=crop&w=1600&q=80',
        'marseille': 'https://images.unsplash.com/photo-1548679777-62bda50c6091?auto=format&fit=crop&w=1600&q=80',
        'default': '/assets/student_room.png'
    };

    const heroImage = dbContent?.heroImageUrl || cityImages[cityNormalized] || cityImages['default'];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
            {/* Note: Global Navbar is already provided by layout */}

            {/* Premium Hero Header */}
            <div className="relative h-[300px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10" />
                <img
                    src={heroImage}
                    alt={cityCapitalized}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full z-20 p-4 md:p-8 max-w-[1600px] mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-lg">
                        {t('title', { city: cityCapitalized })}
                    </h1>
                    <p className="text-gray-100 font-medium text-lg drop-shadow-md">
                        {candidates.length} {candidates.length > 1 ? 'logements disponibles' : 'logement disponible'} • Prix moyen: {cityData.price}€
                    </p>
                </div>
            </div>

            {/* Sticky Filters */}
            <CityFilterBar currentCity={cityNormalized} />

            <main className="w-full max-w-[1920px] mx-auto px-4 md:px-6 py-6 transition-all">
                {candidates.length > 0 ? (
                    <>
                        <CityResults
                            city={city}
                            candidates={candidates.map((u: any, idx: number) => ({
                                id: u.id,
                                residenceName: u.residence.name,
                                price: u.price,
                                surface: safeNum(u.surface),
                                type: u.type,
                                score: 80 - (idx * 0.5),
                                url: u.residence.url,
                                photo: null,
                                available: Math.random() > 0.3
                            }))}
                        />

                        {/* SEO CONTENT SECTION - STUDENT LIFE */}
                        <div className="border-t border-gray-200 pt-12 mt-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Vivre et Étudier à {cityCapitalized}</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                                {/* LEFT COL: Budget & Transport */}
                                <div className="space-y-8">
                                    {/* Budget Card */}
                                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                                        <h3 className="flex items-center text-xl font-bold text-blue-900 mb-4">
                                            <span className="bg-blue-200 p-2 rounded-lg mr-3">💰</span>
                                            Coût de la vie
                                        </h3>
                                        <ul className="space-y-3">
                                            <li className="flex justify-between items-center text-gray-700">
                                                <span>Loyer moyen</span>
                                                <span className="font-bold">{cityData.livingCost.rent}</span>
                                            </li>
                                            <li className="flex justify-between items-center text-gray-700">
                                                <span>Nourriture / mois</span>
                                                <span className="font-bold">{cityData.livingCost.food}</span>
                                            </li>
                                            <li className="flex justify-between items-center text-gray-700">
                                                <span>Transport</span>
                                                <span className="font-bold">{cityData.livingCost.transport}</span>
                                            </li>
                                            <li className="flex justify-between items-center text-gray-700">
                                                <span>Loisirs & Extras</span>
                                                <span className="font-bold">{cityData.livingCost.extras}</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Transport Card */}
                                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                                        <h3 className="flex items-center text-xl font-bold text-green-900 mb-4">
                                            <span className="bg-green-200 p-2 rounded-lg mr-3">🚇</span>
                                            Transports
                                        </h3>
                                        <p className="text-gray-700 mb-4">{cityData.transport.summary}</p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {cityData.transport.lines.map((line: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-white border border-green-200 rounded-full text-sm font-bold text-green-800 shadow-sm">
                                                    {line}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="text-sm font-semibold text-green-700">
                                            Prix étud : {cityData.transport.price}
                                        </div>
                                    </div>

                                    {/* Intro Text */}
                                    <div className="prose prose-blue text-sm text-gray-600">
                                        <p>{cityData.intro}</p>
                                    </div>
                                </div>

                                {/* RIGHT COL: Neighborhoods & FAQ */}
                                <div className="space-y-8">

                                    {/* Neighborhoods */}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Quartiers Étudiants</h3>
                                        <div className="grid gap-4">
                                            {cityData.neighborhood_details.map((n: any, i: number) => (
                                                <div key={i} className="group p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all">

                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{n.name}</h4>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                                                            ${n.vibe === 'Festif' ? 'bg-purple-100 text-purple-700' : ''}
                                                            ${n.vibe === 'Calme' ? 'bg-green-100 text-green-700' : ''}
                                                            ${n.vibe === 'Bohème' ? 'bg-orange-100 text-orange-700' : ''}
                                                            ${n.vibe === 'Résidentiel' ? 'bg-gray-100 text-gray-700' : ''}
                                                        `}>{n.vibe}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{n.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* FAQ */}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Questions Fréquentes</h3>
                                        <div className="space-y-3">
                                            {cityData.faq.map((item: any, i: number) => (
                                                <details key={i} className="group bg-gray-50 rounded-xl">
                                                    <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-gray-800 list-none">
                                                        <span>{item.question}</span>
                                                        <span className="transition group-open:rotate-180">
                                                            <ChevronDown className="w-4 h-4 text-gray-500" />
                                                        </span>
                                                    </summary>
                                                    <div className="text-gray-600 px-4 pb-4 text-sm leading-relaxed">
                                                        {item.answer}
                                                    </div>
                                                </details>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Universities List as badges */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Campus & Écoles</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {cityData.universities.map(u => (
                                                <span key={u} className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                                                    {u}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-24 max-w-lg mx-auto">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
                            <Search className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-3">{t('noResults', { city: cityCapitalized })}</h3>
                        <p className="text-gray-500 mb-8 text-lg">{t('noResultsDesc')}</p>
                        <Link href="/search" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                            {t('nationalSearch')}
                        </Link>
                    </div>
                )}

            </main>
        </div>
    );
}
