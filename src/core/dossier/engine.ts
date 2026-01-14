import rulesData from './rules_matrix.json';
import {
    PersonRole,
    PersonStatus,
    NationalityGroup,
    GuarantorType,
    DocType
} from '@prisma/client';

// Types derived from JSON Matrix or Prisma
export interface DossierRule {
    id: string;
    priority: number;
    when: {
        role?: string;
        roleIn?: string[];
        isMinor?: boolean;
        status?: string;
        nationalityGroup?: string;
        guarantorType?: string;
        not?: Record<string, any>;
    };
    required: DocType[];
    orGroups: DocType[][]; // Array of arrays (e.g. [[A, B], [C, D]]) means (A OR B) AND (C OR D) ? No, prompts says OR Groups. Generally usually means "Choose 1 from Group 1, 1 from Group 2". 
    // Wait, let's re-read the matrix: "orGroups": [["INCOME_PROOF", "TAX_NOTICE"]] means ONE requirement that can be satisfied by either.
    recommended: DocType[];
}

export interface EvaluationRequest {
    person: {
        role: PersonRole;
        status: PersonStatus;
        nationality: NationalityGroup;
        isMinor: boolean;
        guarantorType?: GuarantorType | null;
    };
}

export interface RequirementResult {
    required: DocType[];
    orGroups: DocType[][]; // Each sub-array is a "Choice" requirement
    recommended: DocType[];
    appliedRules: string[];
}

export class DossierEngine {
    private rules: DossierRule[];

    constructor() {
        // Cast strict typed JSON
        this.rules = rulesData.rules as unknown as DossierRule[];
    }

    /**
     * Computes the document requirements for a given person based on the matrix.
     */
    public getRequirements(person: EvaluationRequest['person']): RequirementResult {
        const result: RequirementResult = {
            required: [],
            orGroups: [],
            recommended: [],
            appliedRules: [],
        };

        // 1. Filter applicable rules
        const applicableRules = this.rules.filter(rule => this.isRuleApplicable(rule, person));

        // 2. Sort by priority (optional, but good for stability)
        applicableRules.sort((a, b) => b.priority - a.priority);

        // 3. Merge Requirements
        for (const rule of applicableRules) {
            result.appliedRules.push(rule.id);

            // Union of Required
            for (const doc of rule.required) {
                if (!result.required.includes(doc)) {
                    result.required.push(doc);
                }
            }

            // Concat of OrGroups (e.g. Rule A says [Tax/Income], Rule B says [Visa/Passport] -> Both choices required)
            // We assume simple concatenation for now, sophisticated dedupe could be done if identical groups exist.
            if (rule.orGroups && rule.orGroups.length > 0) {
                result.orGroups.push(...rule.orGroups);
            }

            // Union of Recommended
            if (rule.recommended) {
                for (const doc of rule.recommended) {
                    if (!result.recommended.includes(doc)) {
                        result.recommended.push(doc);
                    }
                }
            }
        }

        // dedupe orGroups ? 
        // If multiple rules ask for SAME choice, we shouldn't ask twice.
        // e.g. R-110 asks for [Income, Tax] and R-120 asks for [Income, Tax].
        // Actually rules are usually mutually exclusive on status, but some might overlap (e.g. Nationality + Status).
        // If Nationality says "Residency" and Status says "Income OR Tax", we want BOTH.
        // If two rules say "Income OR Tax", we simplify to one.
        result.orGroups = this.deduplicateOrGroups(result.orGroups);

        return result;
    }

    private isRuleApplicable(rule: DossierRule, person: EvaluationRequest['person']): boolean {
        const { when } = rule;

        // Role
        if (when.role && when.role !== person.role) return false;
        if (when.roleIn && !when.roleIn.includes(person.role)) return false;

        // Minor
        if (when.isMinor !== undefined && when.isMinor !== person.isMinor) return false;

        // Status
        if (when.status && when.status !== person.status) return false;

        // Nationality
        if (when.nationalityGroup && when.nationalityGroup !== person.nationality) return false;

        // Guarantor Type
        if (when.guarantorType && when.guarantorType !== person.guarantorType) return false;

        // NOT Condition (Nested)
        if (when.not) {
            // Check if the 'not' condition matches matches the person (inverse logic)
            // If the sub-condition matches, then the rule is NOT applicable.
            // We reuse isRuleApplicable logic for the sub-object but treating it as a mini-rule
            const notMatcher = { when: when.not } as DossierRule;
            if (this.isRuleApplicable(notMatcher, person)) return false;
        }

        return true;
    }

    private deduplicateOrGroups(groups: DocType[][]): DocType[][] {
        const unique: DocType[][] = [];
        const signatures = new Set<string>();

        for (const group of groups) {
            const sorted = [...group].sort();
            const sig = sorted.join('|');
            if (!signatures.has(sig)) {
                signatures.add(sig);
                unique.push(group);
            }
        }
        return unique;
    }
}
