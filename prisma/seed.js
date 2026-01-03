console.log("Loading modules...");
const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
console.log("Modules loaded.");
console.log("Initializing Prisma...");
const prisma = new PrismaClient();
console.log("Prisma initialized.");

const DATA_FILE = path.join(process.cwd(), 'consolidated_2025-12-21.xlsx');
console.log("Data file path:", DATA_FILE);

async function main() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            throw new Error(`❌ Source file not found: ${DATA_FILE}`);
        }

        console.log("Reading file...");
        const workbook = xlsx.readFile(DATA_FILE);
        console.log("File read successfully.");

        // 1. Process "Sources" Sheet
        console.log("--- Syncing Partner Configs ---");
        const sourceSheet = workbook.Sheets['Sources'];
        if (sourceSheet) {
            const sources = xlsx.utils.sheet_to_json(sourceSheet);
            for (const row of sources) {
                const sourceId = row['Source']?.toString().toLowerCase().trim();
                // Check default price safely
                const defaultPrice = row['Prix Lead Default'] ? parseFloat(row['Prix Lead Default']) : 0;

                if (sourceId) {
                    await prisma.partnerConfig.upsert({
                        where: { sourceId },
                        update: {
                            defaultLeadPrice: defaultPrice,
                            defaultNotificationEmail: row['Email Notification']
                        },
                        create: {
                            sourceId,
                            defaultLeadPrice: defaultPrice,
                            defaultNotificationEmail: row['Email Notification']
                        }
                    });
                    console.log(`   Processed Brand: ${sourceId}`);
                }
            }
        }

        // 2. Process "Listings" Sheet
        console.log("--- Syncing Residences ---");
        // Check for 'Listings' or fallback to first sheet
        const sheetName = workbook.SheetNames.includes('Listings') ? 'Listings' : workbook.SheetNames[0];
        console.log(`Using sheet: ${sheetName}`);

        const listings = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        let count = 0;
        for (const row of listings) {
            const name = row['Nom'] || row['Residence Name'];
            if (!name) continue;

            const rawCity = row['Ville'] || row['City'] || 'Inconnue';
            const cityNormalized = rawCity.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");
            const slug = cityNormalized + '-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const sourceId = row['Source'] ? row['Source'].toString().toLowerCase().trim() : 'excel-import';

            // Status Logic
            let status = 'NON_PARTNER';
            if (['PARTNER_SLA', 'PARTNER_EMAIL'].includes(row['Statut'])) status = row['Statut'];

            try {
                const res = await prisma.canonResidence.upsert({
                    where: { slug },
                    update: {
                        name,
                        address: row['Adresse'] || rawCity,
                        cityNormalized,
                        sourceId,
                        url: row['URL'] || `https://monlogementetudiant.fr/${cityNormalized}/residence-${count}`,
                        status
                    },
                    create: {
                        slug,
                        name,
                        address: row['Adresse'] || rawCity,
                        cityNormalized,
                        sourceId,
                        url: row['URL'] || `https://monlogementetudiant.fr/${cityNormalized}/residence-${count}`,
                        status,
                        trustScore: 80
                    }
                });

                // Create Units if none
                const unitCount = await prisma.canonUnit.count({ where: { residenceId: res.id } });
                if (unitCount === 0) {
                    await prisma.canonUnit.createMany({
                        data: [
                            { type: 'STUDIO', price: 550, surface: 18, availability: 'IMMEDIATE', residenceId: res.id },
                            { type: 'STUDIO', price: 620, surface: 24, availability: 'LT_30D', residenceId: res.id }
                        ]
                    });
                }
                count++;
            } catch (e) {
                console.error(`Failed ${name}:`, e.message);
            }
        }
        console.log(`✅ Seed Completed. Synced ${count} residences.`);
    } catch (e) {
        console.error("Reading failed:", e);
    }
}
main();
