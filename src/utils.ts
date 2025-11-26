import { GenerationInterval, DayMix } from "./types";

const CLEAN_FUELS = ["biomass", "nuclear", "hydro", "wind", "solar"];

export function getDateString(iso: string): string {
  return iso.slice(0, 10);
}

export function computeDayMixes(intervals: GenerationInterval[]): DayMix[] {
  const byDate: Record<string, GenerationInterval[]> = {};

  for (const interval of intervals) {
    const date = getDateString(interval.from);
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(interval);
  }

  const result: DayMix[] = [];

  for (const [date, dayIntervals] of Object.entries(byDate)) {
    const fuelSums: Record<string, number> = {};
    let count = 0;

    for (const interval of dayIntervals) {
      count++;
      for (const item of interval.generationmix) {
        fuelSums[item.fuel] = (fuelSums[item.fuel] || 0) + item.perc;
      }
    }

    const averages: Record<string, number> = {};
    for (const [fuel, sum] of Object.entries(fuelSums)) {
      averages[fuel] = sum / count;
    }

    const cleanPercentage = CLEAN_FUELS.reduce(
      (acc, fuel) => acc + (averages[fuel] || 0),
      0
    );

    result.push({ date, averages, cleanPercentage });
  }

  result.sort((a, b) => (a.date < b.date ? -1 : 1));

  return result;
}

export function cleanShare(interval: GenerationInterval): number {
  let sum = 0;
  for (const item of interval.generationmix) {
    if (CLEAN_FUELS.includes(item.fuel)) sum += item.perc;
  }
  return sum;
}
