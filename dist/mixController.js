"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnergyMix = getEnergyMix;
exports.getOptimalWindow = getOptimalWindow;
const express_1 = require("express");
const carbonService_1 = require("./carbonService");
const utils_1 = require("./utils");
const types_1 = require("./types");
function toApiDate(d) {
    const copy = new Date(d);
    copy.setUTCMinutes(0, 0, 0);
    return copy.toISOString().slice(0, 16) + "Z";
}
async function getEnergyMix(req, res) {
    try {
        const now = new Date();
        const todayStart = toApiDate(now);
        const thirdDay = new Date(now);
        thirdDay.setUTCDate(thirdDay.getUTCDate() + 3);
        const thirdDayStart = toApiDate(thirdDay);
        const intervals = await (0, carbonService_1.fetchGeneration)(todayStart, thirdDayStart);
        const mixes = (0, utils_1.computeDayMixes)(intervals);
        const firstThree = mixes.slice(0, 3);
        res.json({ days: firstThree });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch energy mix" });
    }
}
async function getOptimalWindow(req, res) {
    try {
        const hours = parseInt(req.query.hours);
        if (!hours || hours < 1 || hours > 6) {
            return res.status(400).json({ error: "hours must be 1–6" });
        }
        const intervalsNeeded = hours * 2;
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        const start = toApiDate(tomorrow);
        const dayAfter = new Date(tomorrow);
        dayAfter.setUTCDate(dayAfter.getUTCDate() + 2);
        const end = toApiDate(dayAfter);
        const intervals = await (0, carbonService_1.fetchGeneration)(start, end);
        intervals.sort((a, b) => (a.from < b.from ? -1 : 1));
        const clean = intervals.map(utils_1.cleanShare);
        let bestAvg = -1;
        let bestIndex = 0;
        let sum = 0;
        for (let i = 0; i < intervalsNeeded; i++)
            sum += clean[i];
        bestAvg = sum / intervalsNeeded;
        for (let i = intervalsNeeded; i < clean.length; i++) {
            sum += clean[i] - clean[i - intervalsNeeded];
            const avg = sum / intervalsNeeded;
            if (avg > bestAvg) {
                bestAvg = avg;
                bestIndex = i - intervalsNeeded + 1;
            }
        }
        const startTime = intervals[bestIndex].from;
        const endTime = intervals[bestIndex + intervalsNeeded - 1].to;
        const result = {
            start: startTime,
            end: endTime,
            cleanPercentage: bestAvg
        };
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to calculate window" });
    }
}
//# sourceMappingURL=mixController.js.map