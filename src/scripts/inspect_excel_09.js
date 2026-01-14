const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.resolve(process.cwd(), 'consolidated_2026-01-09.xlsx');
const outputPath = path.resolve(process.cwd(), 'src/scripts/inspection_result_09.txt');

console.log(`Reading file at ${filePath}`);
try {
    const workbook = xlsx.readFile(filePath);
    let output = '';

    output += "SHEET_NAMES:\n" + JSON.stringify(workbook.SheetNames, null, 2) + "\n\n";

    workbook.SheetNames.forEach(sheetName => {
        output += `--- SHEET: ${sheetName} ---\n`;
        const sheet = workbook.Sheets[sheetName];

        if (sheet['!ref']) {
            const range = xlsx.utils.decode_range(sheet['!ref']);
            const C = range.s.c;
            const R = range.s.r;
            const headers = [];

            for (let c = C; c <= range.e.c; ++c) {
                const cell = sheet[xlsx.utils.encode_cell({ r: R, c: c })];
                if (cell && cell.v) {
                    headers.push(String(cell.v));
                }
            }
            output += "HEADERS: " + JSON.stringify(headers) + "\n";

            if (range.e.r > R) {
                const dataRow = [];
                for (let c = C; c <= range.e.c; ++c) {
                    const cell = sheet[xlsx.utils.encode_cell({ r: R + 1, c: c })];
                    if (cell && cell.v !== undefined) {
                        dataRow.push(cell.v);
                    } else {
                        dataRow.push(null);
                    }
                }
                output += "FIRST_ROW: " + JSON.stringify(dataRow) + "\n";
            }

        } else {
            output += "EMPTY SHEET\n";
        }
        output += "\n";
    });

    fs.writeFileSync(outputPath, output);
    console.log("Written to " + outputPath);

} catch (e) {
    console.error("Error:", e);
    fs.writeFileSync(outputPath, "Error: " + e.message);
}
