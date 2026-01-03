
import { prisma } from '../lib/db';

async function simulateAgent() {
    console.log("🤖 USER: 'Je cherche un studio étudiant à Lyon pour moins de 600€.'");
    console.log("\n--- AGENT THINKING ---");
    console.log("Analyzed request: City='Lyon', Type='STUDIO', Budget=600");
    console.log("Decided to call tool: `search_housing`");

    // Simulate Tool Execution (using same logic as MCP)
    const city = "Lyon";
    const budgetMax = 600;
    const type = "STUDIO";

    console.log(`\n--- EXECUTING TOOL: search_housing({ city: '${city}', budgetMax: ${budgetMax} }) ---`);

    const cityNormalized = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");

    const results = await prisma.canonUnit.findMany({
        where: {
            residence: { cityNormalized: { contains: cityNormalized } },
            price: { lte: budgetMax },
            type: type as any
        },
        include: { residence: true },
        take: 3,
        orderBy: { price: 'asc' }
    });

    console.log(`Found ${results.length} matches in database.`);

    // Simulate Agent Response Generation
    console.log("\n--- AGENT RESPONSE (What the user sees) ---");
    console.log(`
"J'ai trouvé **${results.length} offres** correspondant à votre recherche à Lyon :

1.  **${results[0]?.residence.name}**
    *   💰 Loyer : **${results[0]?.price}€**
    *   📐 Surface : ${results[0]?.surface}m²
    *   [Voir l'offre détaillée](http://localhost:3000/search?id=${results[0]?.id})

2.  **${results[1]?.residence.name}**
    *   💰 Loyer : **${results[1]?.price}€**
    *   📐 Surface : ${results[1]?.surface}m²
    *   [Voir l'offre détaillée](http://localhost:3000/search?id=${results[1]?.id})

Souhaitez-vous que j'affine la recherche avec plus de surface ?"
    `);
}

simulateAgent()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
