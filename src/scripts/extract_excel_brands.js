const xlsx = require('xlsx');
const path = require('path');

const filePath = path.resolve(process.cwd(), 'consolidated_2026-01-09.xlsx');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames.find(s => s.toLowerCase().includes('résid'));
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

const brands = new Set();
data.forEach(row => {
    if (row['Source']) {
        brands.add(row['Source'].trim());
    }
});

console.log("Unique Brands in Excel:");
console.log(JSON.stringify([...brands], null, 2));
