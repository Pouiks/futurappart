import { Connector, ParsedUnit } from './base';
import * as xlsx from 'xlsx';
import { prisma } from '../../lib/db';
import { randomUUID } from 'crypto';
import { AvailabilityEnum, UnitTypeEnum } from '@prisma/client';

export class ExcelImportConnector implements Connector {
    id = 'excel_canonical_v1';
    name = 'Import Excel 2025';

    async fetch(filePath: string): Promise<any> {
        console.log(`Reading file at ${filePath}`);
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
            if (r['Nom']) {
                resMap.set(r['Nom'], r);
            }
        }

        for (const t of typologiesRaw) {
            const resName = t['Résidence'];
            const resData = resMap.get(resName);

            if (!resData) continue;

            results.push({
                name: resName,
                address: resData['Adresse'],
                city: resData['Ville'] || t['Ville'] || 'Unknown',
                priceRaw: t['Prix'] || t['Prix (€)'] || resData['Prix Min (€)'],
                surfaceRaw: t['Surface (m²)'] || t['Surface'],
                url: resData['URL'] || '',
                unitTypeRaw: t['Type'],
                availabilityRaw: 'UNKNOWN',
                source: 'excel_v1',
                externalId: `${this.id}_${resName}_${t['Type']}_${Math.random().toString(36).substr(2, 9)}`
            });
        }

        return results;
    }

    async emit(units: ParsedUnit[]): Promise<void> {
        console.log(`Pushing ${units.length} units to STAGING DB...`);

        const batchId = randomUUID();

        // Chunking to avoid parameter limit, though valid with createMany
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
                // Simple mapping for MVP, better in proper normalizer
                unitType: this.mapUnitType(u.unitTypeRaw),
                availability: AvailabilityEnum.UNKNOWN,
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
        console.log("Emission complete.");
    }

    private normalizeCity(raw: string): string {
        if (!raw) return 'unknown';
        return String(raw).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");
    }

    private mapUnitType(raw?: string): UnitTypeEnum {
        if (!raw) return UnitTypeEnum.UNKNOWN;
        const lower = raw.toLowerCase();
        if (lower.includes('coloc') || lower.includes('room')) return UnitTypeEnum.COLOCATION;
        if (lower.includes('coliving')) return UnitTypeEnum.COLIVING;
        if (lower.includes('studio') || lower.includes('t1')) return UnitTypeEnum.STUDIO;
        return UnitTypeEnum.UNKNOWN;
    }
}
