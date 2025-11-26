import { Request, Response } from "express";
import { fetchGeneration } from "./carbonService";
import { computeDayMixes, cleanShare } from "./utils";
import { OptimalWindowResult } from "./types";

function toApiDate(d: Date): string {
  const copy = new Date(d);
  copy.setUTCMinutes(0, 0, 0);
  return copy.toISOString().slice(0, 16) + "Z";
}

export async function getEnergyMix(req: Request, res: Response) {
  try {
    const now = new Date();

    const todayStart = toApiDate(now);

    const thirdDay = new Date(now);
    thirdDay.setUTCDate(thirdDay.getUTCDate() + 3);
    const thirdDayStart = toApiDate(thirdDay);

    const intervals = await fetchGeneration(todayStart, thirdDayStart);

    const mixes = computeDayMixes(intervals);
    const firstThree = mixes.slice(0, 3);

    res.json({ days: firstThree });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch energy mix" });
  }
}

export async function getOptimalWindow(req: Request, res: Response) {
  try {
    const hours = parseInt(req.query.hours as string);

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

    const intervals = await fetchGeneration(start, end);

    if (!intervals || intervals.length < intervalsNeeded) {
      return res.status(500).json({ error: "Not enough intervals returned" });
    }

    intervals.sort((a, b) => (a.from < b.from ? -1 : 1));

    const clean = intervals.map(cleanShare);

    if (clean.length < intervalsNeeded) {
      return res.status(500).json({ error: "Not enough clean data" });
    }

    let bestAvg = -1;
    let bestIndex = 0;

    let sum = 0;
    for (let i = 0; i < intervalsNeeded; i++) {
      sum += clean[i] ?? 0;
    }
    bestAvg = sum / intervalsNeeded;

    for (let i = intervalsNeeded; i < clean.length; i++) {
      sum += (clean[i] ?? 0) - (clean[i - intervalsNeeded] ?? 0);
      const avg = sum / intervalsNeeded;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestIndex = i - intervalsNeeded + 1;
      }
    }

    const startInterval = intervals[bestIndex];
    const endInterval = intervals[bestIndex + intervalsNeeded - 1];

    if (!startInterval || !endInterval) {
      return res.status(500).json({ error: "Invalid interval index" });
    }

    const result: OptimalWindowResult = {
      start: startInterval.from,
      end: endInterval.to,
      cleanPercentage: bestAvg
    };

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to calculate window" });
  }
}
