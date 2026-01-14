// Demo data for housing units
// This file provides static mock units used when NEXT_PUBLIC_DEMO_MODE is enabled.
// The shape mirrors the Prisma `canonUnit` model used in the app.

export const demoUnits = [
    {
        id: 'demo-1',
        type: 'STUDIO',
        price: 600,
        surface: 20,
        images: ['/assets/demo1.jpg', '/assets/demo2.jpg'],
        description: 'Studio cosy au cœur de Paris, proche métro et commerces.',
        amenities: ['Wifi Haut Débit', 'Sécurisé', 'Proche Métro', 'Meublé'],
        availability: 'IMMEDIATE',
        url: '/logement/demo-1',
        residence: {
            id: 'res-demo-1',
            name: 'Résidence Démo Paris',
            cityNormalized: 'paris',
            address: '10 Rue de la Demo, 75001 Paris',
            heroImageUrl: '/assets/demo_hero_paris.jpg',
            url: '', // Generic to avoid brand extraction
            status: 'NON_PARTNER',
            slaDays: null,
            trustScore: 85,
        },
    },
    {
        id: 'demo-2',
        type: 'T2',
        price: 850,
        surface: 35,
        images: ['/assets/demo3.jpg'],
        description: 'Appartement T2 lumineux à Lyon, idéal pour étudiants.',
        amenities: ['Wifi Haut Débit', 'Laverie', 'Salle de Sport'],
        availability: 'IMMEDIATE',
        url: '/logement/demo-2',
        residence: {
            id: 'res-demo-2',
            name: 'Résidence Démo Lyon',
            cityNormalized: 'lyon',
            address: '20 Avenue Demo, 69001 Lyon',
            heroImageUrl: '/assets/demo_hero_lyon.jpg',
            url: '',
            status: 'NON_PARTNER',
            slaDays: null,
            trustScore: 78,
        },
    },];

// Helper to generate dynamic mock units for any city
export const generateMockUnits = (city: string, count: number = 20) => {
    const cityCap = city.charAt(0).toUpperCase() + city.slice(1);

    // Use existing local assets
    const demoImages = [
        '/assets/student_studio_cozy.png',
        '/assets/student_studio_modern.png',
        '/assets/student_studio_minimal.png',
        '/assets/default_studio.png',
        '/assets/default_t2.png'
    ];

    // Generic heroes (can reuse room images if no city heroes available)
    const heroImage = '/assets/student_room.png';

    return Array.from({ length: count }).map((_, i) => ({
        id: `mock-${city}-${i}`,
        type: i % 3 === 0 ? 'T2' : 'STUDIO',
        price: 450 + (i * 50) + (Math.random() > 0.5 ? 20 : 0),
        surface: 18 + (i % 10),
        images: [
            demoImages[i % demoImages.length],
            demoImages[(i + 1) % demoImages.length],
            demoImages[(i + 2) % demoImages.length]
        ],
        description: `Logement étudiant idéal à ${cityCap}. Proche transports et commerces. Entièrement meublé et équipé pour votre réussite.`,
        amenities: ['Wifi Fibre', 'Meublé', 'Sécurisé', 'Proche Fac', 'Laverie'],
        availability: 'IMMEDIATE',
        url: `/logement/mock-${city}-${i}`,
        residence: {
            id: `res-mock-${city}-${i}`,
            name: `Résidence Étudiante ${cityCap} ${i + 1}`,
            cityNormalized: city.toLowerCase(),
            address: `${10 + i} Rue de l'Université, ${cityCap}`,
            heroImageUrl: heroImage,
            url: '',
            status: 'NON_PARTNER',
            slaDays: null,
            trustScore: 80 + (i % 20),
        },
    }));
};

// Helper to get a specific demo unit by ID (handling both static and dynamic mocks)
export const getDemoUnitById = (id: string) => {
    // 1. Check static demos
    const staticUnit = demoUnits.find(u => u.id === id);
    if (staticUnit) return staticUnit;

    // 2. Check dynamic mocks (format: mock-{city}-{index})
    if (id.startsWith('mock-')) {
        const parts = id.split('-');
        // mock-lyon-1 -> parts=['mock', 'lyon', '1']
        if (parts.length >= 3) {
            const city = parts[1];
            // We can just regenerate the specific unit or the batch (batch is safer for consistency logic)
            // Ideally we'd just generate the one unit we need, but generateMockUnits is fast.
            // Let's generate a batch large enough to include our index?
            // Actually, the index 'i' in `generateMockUnits` goes up to count.
            // If id is mock-lyon-1, i=1.
            const index = parseInt(parts[2], 10);

            // Generate mock array up to this index + 1 ensures it exists
            const mocks = generateMockUnits(city, index + 5);
            return mocks.find(u => u.id === id);
        }
    }

    return null;
};
