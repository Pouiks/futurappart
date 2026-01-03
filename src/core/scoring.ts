
export type Unit = {
    id: string;
    price: number;
    surface: number | null;
    priceM2: number | null;
    availability: 'IMMEDIATE' | 'LT_30D' | 'UNKNOWN' | 'NOT_AVAILABLE';
    trustScore: number;
    cityStats: CityStats;
    residenceStatus?: 'NON_PARTNER' | 'PARTNER_EMAIL' | 'PARTNER_SLA';
};

export type CityStats = {
    medianPrice: number | null;
    medianPriceM2: number | null;
    medianSurface: number | null;
};

export type UserCriteria = {
    priority: 'PRICE' | 'SURFACE' | 'BALANCE';
};

export type ScoreResult = {
    totalScore: number;
    details: {
        priceScore: number;
        priceM2Score: number;
        surfaceScore: number;
        availabilityScore: number;
        trustScore: number;
        partnerBonus: number;
    };
    reasons: string[];
};

export class ScoringService {

    static score(unit: Unit, criteria: UserCriteria): ScoreResult {
        // 1. Calculate Individual Scores
        const priceScore = this.scorePrice(unit.price, unit.cityStats.medianPrice);
        const priceM2Score = this.scorePriceM2(unit.priceM2, unit.cityStats.medianPriceM2);
        const surfaceScore = this.scoreSurface(unit.surface, unit.cityStats.medianSurface); // To implement
        const availabilityScore = this.scoreAvailability(unit.availability);
        const trustScore = unit.trustScore;

        // 2. Weights
        const weights = this.getWeights(criteria.priority);

        // 3. Partner Bonus (Rule P1)
        let partnerBonus = 0;
        if (unit.residenceStatus === 'PARTNER_SLA') partnerBonus = 5;
        else if (unit.residenceStatus === 'PARTNER_EMAIL') partnerBonus = 2;

        // 4. Total Calculation
        let total =
            (priceScore * weights.price) +
            (priceM2Score * weights.priceM2) +
            (surfaceScore * weights.surface) +
            (availabilityScore * weights.availability) +
            (trustScore * weights.trust);

        // Add Bonus and Clamp
        total += partnerBonus;
        total = Math.min(total, 100);

        // 5. Generate Reasons
        const reasons = this.generateReasons(unit, priceScore, surfaceScore);

        return {
            totalScore: Math.round(total),
            details: { priceScore, priceM2Score, surfaceScore, availabilityScore, trustScore, partnerBonus },
            reasons
        };
    }

    private static getWeights(priority: 'PRICE' | 'SURFACE' | 'BALANCE') {
        switch (priority) {
            case 'PRICE': return { price: 0.55, priceM2: 0.25, surface: 0.10, availability: 0.05, trust: 0.05 };
            case 'SURFACE': return { price: 0.20, priceM2: 0.30, surface: 0.40, availability: 0.05, trust: 0.05 };
            default: return { price: 0.40, priceM2: 0.25, surface: 0.20, availability: 0.10, trust: 0.05 };
        }
    }

    private static scorePrice(price: number, median: number | null): number {
        if (!median) return 50;
        const ratio = price / median;
        if (ratio <= 0.85) return 100;
        if (ratio <= 1.00) return 80;
        if (ratio <= 1.15) return 60;
        if (ratio <= 1.30) return 30;
        return 0;
    }

    private static scorePriceM2(priceM2: number | null, median: number | null): number {
        if (!priceM2 || !median) return 40; // Fallback
        const ratio = priceM2 / median;
        if (ratio <= 0.85) return 100;
        if (ratio <= 1.00) return 80;
        if (ratio <= 1.15) return 60;
        if (ratio <= 1.30) return 30;
        return 0;
    }

    private static scoreSurface(surface: number | null, median: number | null): number {
        if (!surface || !median) return 40;
        const ratio = surface / median;
        if (ratio >= 1.25) return 100;
        if (ratio >= 1.10) return 80;
        if (ratio >= 0.95) return 60;
        if (ratio >= 0.85) return 30;
        return 0;
    }

    private static scoreAvailability(status: string): number {
        const map: Record<string, number> = { 'IMMEDIATE': 100, 'LT_30D': 70, 'UNKNOWN': 50, 'NOT_AVAILABLE': 0 };
        return map[status] || 0;
    }

    private static generateReasons(unit: Unit, pScore: number, sScore: number): string[] {
        const reasons: string[] = [];
        if (pScore >= 80) reasons.push("Top Prix");
        if (sScore >= 80) reasons.push("Belle Surface");
        if (unit.availability === 'IMMEDIATE') reasons.push("Dispo Immédiate");
        return reasons.slice(0, 3);
    }
}
