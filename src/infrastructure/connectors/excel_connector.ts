import { Connector, ParsedUnit } from './base';
import * as xlsx from 'xlsx';
import { prisma } from '../../lib/db';
import { randomUUID } from 'crypto';
import { AvailabilityEnum, UnitTypeEnum } from '@prisma/client';

export class ExcelImportConnector implements Connector {
    id = 'excel_canonical_v1';
    name = 'Import Excel 2026';

    async fetch(filePath: string): Promise<any> {
        console.log(`Reading file at ${filePath}`);
        // Use 'sheets' option or just read file if small enough
        const workbook = xlsx.readFile(filePath);
        return workbook;
    }

    async parse(workbook: xlsx.WorkBook): Promise<ParsedUnit[]> {
        const results: ParsedUnit[] = [];

        const sheetNames = workbook.SheetNames;
        const resSheetName = sheetNames.find(s => s.toLowerCase().includes('résid') || s.toLowerCase().includes('resid'));
        const typeSheetName = sheetNames.find(s => s.toLowerCase().includes('typo'));

        if (!resSheetName || !typeSheetName) {
            throw new Error("Missing sheets 'Résidences' or 'Typologies'");
        }

        const residencesSheet = workbook.Sheets[resSheetName];
        const typologiesSheet = workbook.Sheets[typeSheetName];

        const residencesRaw = xlsx.utils.sheet_to_json<any>(residencesSheet);
        const typologiesRaw = xlsx.utils.sheet_to_json<any>(typologiesSheet);

        const resMap = new Map<string, any>();
        for (const r of residencesRaw) {
            // New File: "Nom" is the key (Residence Name)
            if (r['Nom']) {
                resMap.set(r['Nom'], r);
            }
        }

        for (const t of typologiesRaw) {
            const resName = t['Résidence'];
            const resData = resMap.get(resName);

            if (!resData) {
                // console.warn(`Excluding typology for missing residence: ${resName}`);
                continue;
            }

            // Statut mapping from Typology or Residence
            const rawStatus = t['Statut'] || resData['Statut'] || 'UNKNOWN';

            // Rich Content
            const description = t['Description'] || resData['Description'] || '';
            const amenitiesStr = t['Équipements'] || resData['Équipements'] || '';
            const imagesStr = t['Images'] || t['Image'] || resData['Image'] || '';

            // Brand Extraction
            const brandName = resData['Source'] || 'Unknown Brand';

            // Name Cleaning Logic
            let cleanName = resName;

            // 1. Remove Dates (e.g. AOÛT 2025, SEPTEMBRE 2024)
            cleanName = cleanName.replace(/(JANVIER|FÉVRIER|MARS|AVRIL|MAI|JUIN|JUILLET|AOÛT|SEPTEMBRE|OCTOBRE|NOVEMBRE|DÉCEMBRE)\s+\d{4}/gi, '');

            // 2. Remove "Location XYZ à City"
            cleanName = cleanName.replace(/Location\s+(coliving|appartement|studio|chambre)\s+(à|sur)\s+[^-\n]+/gi, '');

            // 3. Remove " - BrandName" suffix if present
            if (brandName && brandName !== 'Unknown Brand') {
                const brandRegex = new RegExp(`\\s*-\\s*${brandName}.*`, 'gi');
                cleanName = cleanName.replace(brandRegex, '');
            }

            // 4. Remove Address parts (heuristics: Avenue, Rue, Boulevard followed by names)
            // This is risky but requested. We try to be conservative.
            // Example: "NANTERRE CITE INTERNATIONALE 48 AVENUE DES CHAMPS PIERREUX" -> "NANTERRE CITE INTERNATIONALE"
            // We search for digit + Avenue/Rue/Bd
            cleanName = cleanName.replace(/\d+\s+(RUE|AVENUE|BOULEVARD|BD|IMPASSE|ALLEE|PLACE|QUAI)\s+[\w\s]+/gi, '');

            // 5. Trim and cleanup special chars
            cleanName = cleanName.trim().replace(/^[-_]+|[-_]+$/g, '').trim();

            // 6. Capitalize nicely (optional but good for display)
            // cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

            if (cleanName.length < 3) cleanName = resName; // Fallback if we chopped too much

            results.push({
                name: cleanName, // Use cleaned name
                address: resData['Adresse'],
                // New File: Direct mapping
                city: resData['Ville'] || t['Ville'] || 'Unknown',
                priceRaw: t['Prix'] || t['Prix (€)'] || resData['Prix Min (€)'],
                surfaceRaw: t['Surface (m²)'] || t['Surface'],
                url: resData['URL'] || '',
                unitTypeRaw: t['Type'],
                availabilityRaw: rawStatus,
                description: description,
                amenities: amenitiesStr ? String(amenitiesStr).split(',').map(s => s.trim()).filter(Boolean) : [],
                images: imagesStr ? String(imagesStr).split(',').map(s => s.trim()).filter(Boolean) : [],
                source: 'excel_v1',
                externalId: `${this.id}_${resName}_${t['Type']}_${Math.random().toString(36).substr(2, 9)}`,
                brandName: brandName
            });
        }

        return results;
    }

    async emit(units: ParsedUnit[]): Promise<void> {
        console.log(`Pushing ${units.length} units to STAGING DB...`);

        const batchId = randomUUID();

        // Chunking to avoid parameter limit
        const chunkSize = 100;
        for (let i = 0; i < units.length; i += chunkSize) {
            const chunk = units.slice(i, i + chunkSize);

            const data = chunk.map(u => ({
                importBatchId: batchId,
                sourceId: this.id,
                rawData: u as any,
                cityNormalized: this.normalizeCity(u.city),
                cityRaw: u.city,
                priceMin: typeof u.priceRaw === 'number' ? u.priceRaw : parseInt(String(u.priceRaw).replace(/\D/g, '') || '0'),
                surfaceMin: u.surfaceRaw ? parseFloat(String(u.surfaceRaw).replace(',', '.')) : null,
                url: u.url,
                unitType: this.determineUnitType(u.unitTypeRaw, u.name, u.surfaceRaw),
                availability: this.determineAvailability(u.availabilityRaw || 'UNKNOWN'),
                name: u.name,
                address: u.address
            }));

            try {
                await prisma.stagingUnit.createMany({
                    data: data
                });
            } catch (e) {
                console.error("Error inserting batch", e);
            }
        }
        console.log("Emission complete. Batch ID:", batchId);
    }

    private normalizeCity(raw: string): string {
        if (!raw) return 'unknown';
        return String(raw).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");
    }

    private determineUnitType(raw: string | undefined, name: string | undefined, surfaceRaw: any): UnitTypeEnum {
        // 1. Try explicit type
        if (raw) {
            const lower = raw.toLowerCase();
            if (lower.includes('coloc') || lower.includes('room') || lower.includes('flatshare')) return UnitTypeEnum.COLOCATION;
            if (lower.includes('coliving')) return UnitTypeEnum.COLIVING;
            if (lower.includes('studio') || lower.includes('t1')) return UnitTypeEnum.STUDIO;
        }

        // 2. Heuristics
        if (name) {
            const lowerName = name.toLowerCase();
            if (lowerName.includes('colonies')) return UnitTypeEnum.COLIVING;
        }

        // Surface based fallback
        const surface = surfaceRaw ? parseFloat(String(surfaceRaw).replace(',', '.')) : 0;
        if (surface > 0 && surface < 18) return UnitTypeEnum.STUDIO;

        return UnitTypeEnum.UNKNOWN;
    }

    private determineAvailability(raw: string): AvailabilityEnum {
        if (!raw) return AvailabilityEnum.UNKNOWN;
        const lower = raw.toLowerCase();

        if (lower.includes('disponible') || lower.includes('immediate')) return AvailabilityEnum.IMMEDIATE;
        if (lower.includes('complet') || lower.includes('full')) return AvailabilityEnum.NOT_AVAILABLE;
        if (lower.includes('coming soon') || lower.includes('bientot')) return AvailabilityEnum.LT_30D;

        return AvailabilityEnum.UNKNOWN;
    }
}

