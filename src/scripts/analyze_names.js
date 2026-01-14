const xlsx = require('xlsx');
const path = require('path');

const filePath = path.resolve(process.cwd(), 'consolidated_2026-01-09.xlsx');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames.find(s => s.toLowerCase().includes('résid'));
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

console.log("Analyzing 'Nom' column for patterns like dates or addresses...");

const suspicious = data.filter(r => {
    const name = r['Nom'] || '';
    // Check for years, all caps long strings, or street names indicators
    return name.match(/\d{4}/) || name.includes('AVENUE') || name.includes('RUE ') || name.length > 50;
});

console.log(`Found ${suspicious.length} suspicious names out of ${data.length} rows.`);
console.log("Examples:");
suspicious.slice(0, 15).forEach(r => console.log(`- ${r['Nom']}`));
