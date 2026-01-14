import * as xlsx from 'xlsx';
import * as path from 'path';

async function main() {
    const filePath = path.resolve(process.cwd(), 'consolidated_2026-01-05.xlsx');
    console.log(`Reading file at ${filePath}`);

    try {
        const workbook = xlsx.readFile(filePath);
        console.log("Sheet Names:", workbook.SheetNames);

        for (const sheetName of workbook.SheetNames) {
            console.log(`\n--- Sheet: ${sheetName} ---`);
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json<any>(sheet, { header: 1 }); // Get raw array of arrays

            if (data.length > 0) {
                console.log("Headers:", data[0]);
                console.log("First row data:", data[1]);
            } else {
                console.log("Sheet is empty.");
            }
        }

    } catch (e) {
        console.error("Error reading file:", e);
    }
}

main();
