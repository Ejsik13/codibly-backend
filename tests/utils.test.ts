import { computeDayMixes, cleanShare } from "../src/utils";
import { GenerationInterval } from "../src/types";

describe("Utils tests", () => {
  test("cleanShare returns sum of only clean fuels", () => {
    const interval: GenerationInterval = {
      from: "2025-11-23T00:00Z",
      to: "2025-11-23T00:30Z",
      generationmix: [
        { fuel: "biomass", perc: 10 },
        { fuel: "nuclear", perc: 20 },
        { fuel: "coal", perc: 30 },
        { fuel: "wind", perc: 40 }
      ]
    };

    const clean = cleanShare(interval);

    expect(clean).toBe(10 + 20 + 40);
  });

  test("computeDayMixes groups by day and calculates averages", () => {
    const intervals: GenerationInterval[] = [
      {
        from: "2025-11-23T00:00Z",
        to: "2025-11-23T00:30Z",
        generationmix: [
          { fuel: "biomass", perc: 10 },
          { fuel: "coal", perc: 50 },
        ],
      },
      {
        from: "2025-11-23T00:30Z",
        to: "2025-11-23T01:00Z",
        generationmix: [
          { fuel: "biomass", perc: 30 },
          { fuel: "coal", perc: 70 },
        ],
      },
      {
        from: "2025-11-24T00:00Z",
        to: "2025-11-24T00:30Z",
        generationmix: [
          { fuel: "biomass", perc: 100 },
          { fuel: "coal", perc: 0 },
        ],
      },
    ];

    const result = computeDayMixes(intervals);

    expect(result.length).toBe(2);

    const day1 = result[0];
    expect(day1.date).toBe("2025-11-23");
    expect(day1.averages["biomass"]).toBe((10 + 30) / 2);
    expect(day1.averages["coal"]).toBe((50 + 70) / 2);

    const day2 = result[1];
    expect(day2.date).toBe("2025-11-24");
    expect(day2.averages["biomass"]).toBe(100);
  });
});
