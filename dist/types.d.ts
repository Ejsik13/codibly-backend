export type FuelType = "biomass" | "nuclear" | "hydro" | "wind" | "solar" | "imports" | "gas" | "coal" | "other";
export interface GenerationMixItem {
    fuel: string;
    perc: number;
}
export interface GenerationInterval {
    from: string;
    to: string;
    generationmix: GenerationMixItem[];
}
export interface DayMix {
    date: string;
    averages: Record<string, number>;
    cleanPercentage: number;
}
export interface OptimalWindowResult {
    start: string;
    end: string;
    cleanPercentage: number;
}
//# sourceMappingURL=types.d.ts.map