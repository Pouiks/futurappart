
import { prisma } from '../src/lib/db';

async function main() {
    console.log("Starting Audit...");

    // Fetch all units with their amenities
    // We fetch ID to count total, and amenities to analyze
    const units = await prisma.canonUnit.findMany({
        select: {
            id: true,
            amenities: true
        }
    });

    const totalUnits = units.length;
    console.log(`Total Units Analyzed: ${totalUnits}`);

    const amenityCounts: Record<string, number> = {};

    for (const unit of units) {
        if (!unit.amenities) continue;

        const ams = Array.isArray(unit.amenities)
            ? unit.amenities
            : typeof unit.amenities === 'string'
                ? JSON.parse(unit.amenities) // In case it's a stringified JSON
                : [];

        if (Array.isArray(ams)) {
            // Remove duplicates within the same unit just in case
            const uniqueAms = new Set(ams.map(a => String(a).trim()));

            uniqueAms.forEach(a => {
                // Normalization (optional)
                // const normalized = a.toLowerCase(); 
                // We keep original case for readability first, or maybe normalize to group 'Wifi' and 'WiFi'
                const key = a;
                amenityCounts[key] = (amenityCounts[key] || 0) + 1;
            });
        }
    }

    // Convert to array and sort
    const sorted = Object.entries(amenityCounts)
        .map(([name, count]) => ({
            name,
            count,
            percentage: ((count / totalUnits) * 100).toFixed(1) + '%'
        }))
        .sort((a, b) => b.count - a.count);

    console.log("\n--- Top Amenities by Coverage ---");
    sorted.slice(0, 50).forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}: ${item.count} units (${item.percentage})`);
    });

    console.log("\n--- Audit Complete ---");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
