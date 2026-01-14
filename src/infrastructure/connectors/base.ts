import { z } from 'zod';

// Define the shape of data coming out of a parser
export interface ParsedUnit {
    externalId?: string;
    name: string; // Residence name
    address?: string;
    city: string;
    priceRaw: number;
    surfaceRaw?: number;
    url: string;
    unitTypeRaw?: string;
    availabilityRaw?: string;
    description?: string;
    amenities?: string[];
    images?: string[];
    source: string;
    brandName?: string;
}

export interface Connector {
    id: string; // 'excel_v1'
    name: string;

    /**
     * Fetch data from source (File path for excel, URL for scrape)
     */
    fetch(sourceInput: string): Promise<any>;

    /**
     * Parse raw content into structured units
     */
    parse(rawData: any): Promise<ParsedUnit[]>;

    /**
     * Save to staging DB
     */
    emit(units: ParsedUnit[]): Promise<void>;
}
