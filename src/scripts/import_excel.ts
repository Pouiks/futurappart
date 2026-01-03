import 'dotenv/config';
import * as path from 'path';

async function main() {
    // Dynamic import to ensure .env is loaded before Prisma Client is instantiated
    const { ExcelImportConnector } = await import('../infrastructure/connectors/excel_connector');

    const connector = new ExcelImportConnector();
    const filePath = path.resolve(process.cwd(), 'consolidated_2025-12-21.xlsx');

    console.log("Starting Import Process...");
    try {
        const workbook = await connector.fetch(filePath);
        const units = await connector.parse(workbook);
        console.log(`Parsed ${units.length} units.`);
        await connector.emit(units);
        console.log("Import successfully finished.");
        process.exit(0);
    } catch (e) {
        console.error("Import failed:", e);
        process.exit(1);
    }
}

main();
