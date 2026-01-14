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

    return Array.from({ length: count }).map((_, i) => ({
        id: `mock-${city}-${i}`,
        type: i % 3 === 0 ? 'T2' : 'STUDIO', // Mix of types
        price: 450 + (i * 50) + (Math.random() > 0.5 ? 20 : 0), // Random prices
        surface: 18 + (i % 10), // Random surfaces
        images: [
            `/assets/demo${(i % 3) + 1}.jpg`
        ],
        description: `Logement étudiant idéal à ${cityCap}. Proche transports et commerces.`,
        amenities: ['Wifi', 'Meublé', 'Sécurisé'],
        availability: 'IMMEDIATE',
        url: `/logement/mock-${city}-${i}`,
        residence: {
            id: `res-mock-${city}-${i}`,
            name: `Résidence Étudiante ${cityCap} ${i + 1}`,
            cityNormalized: city.toLowerCase(),
            address: `${10 + i} Rue de l'Université, ${cityCap}`,
            heroImageUrl: `/assets/demo_hero_${city.toLowerCase()}.jpg`, // Will fallback if not found
            url: '',
            status: 'NON_PARTNER',
            slaDays: null,
            trustScore: 80 + (i % 20),
        },
    }));
};

