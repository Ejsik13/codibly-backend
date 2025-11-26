"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDateString = getDateString;
exports.computeDayMixes = computeDayMixes;
exports.cleanShare = cleanShare;
const types_1 = require("./types");
const CLEAN_FUELS = ["biomass", "nuclear", "hydro", "wind", "solar"];
function getDateString(iso) {
    return iso.slice(0, 10);
}
function computeDayMixes(intervals) {
    const byDate = {};
    for (const interval of intervals) {
        const date = getDateString(interval.from);
        if (!byDate[date])
            byDate[date] = [];
        byDate[date].push(interval);
    }
    const result = [];
    for (const [date, dayIntervals] of Object.entries(byDate)) {
        const fuelSums = {};
        let count = 0;
        for (const interval of dayIntervals) {
            count++;
            for (const item of interval.generationmix) {
                fuelSums[item.fuel] = (fuelSums[item.fuel] || 0) + item.perc;
            }
        }
        const averages = {};
        for (const [fuel, sum] of Object.entries(fuelSums)) {
            averages[fuel] = sum / count;
        }
        const cleanPercentage = CLEAN_FUELS.reduce((acc, fuel) => acc + (averages[fuel] || 0), 0);
        result.push({ date, averages, cleanPercentage });
    }
    result.sort((a, b) => (a.date < b.date ? -1 : 1));
    return result;
}
function cleanShare(interval) {
    let sum = 0;
    for (const item of interval.generationmix) {
        if (CLEAN_FUELS.includes(item.fuel))
            sum += item.perc;
    }
    return sum;
}
//# sourceMappingURL=utils.js.map