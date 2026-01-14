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
        availability: 'IMMEDIATE', // matches AvailabilityEnum
        url: '/logement/demo-1',
        residence: {
            id: 'res-demo-1',
            name: 'Résidence Demo Paris',
            cityNormalized: 'paris',
            address: '10 Rue de la Demo, 75001 Paris',
            heroImageUrl: '/assets/demo_hero_paris.jpg',
            url: 'https://demo.monlogementetudiant.com/paris',
            status: 'PARTNER_SLA',
            slaDays: 2,
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
            name: 'Résidence Demo Lyon',
            cityNormalized: 'lyon',
            address: '20 Avenue Demo, 69001 Lyon',
            heroImageUrl: '/assets/demo_hero_lyon.jpg',
            url: 'https://demo.monlogementetudiant.com/lyon',
            status: 'PARTNER_EMAIL',
            slaDays: null,
            trustScore: 78,
        },
    },
    // Add more mock units as needed for the demo
];
