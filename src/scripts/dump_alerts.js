const xlsx = require('xlsx');
const path = require('path');

const filePath = path.resolve(process.cwd(), 'consolidated_2026-01-05.xlsx');
const workbook = xlsx.readFile(filePath);
const sheet = workbook.Sheets['Alertes Validation'];
const data = xlsx.utils.sheet_to_json(sheet);

console.log(JSON.stringify(data, null, 2));
