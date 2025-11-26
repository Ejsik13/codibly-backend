import { cleanShare } from "./utils";
import { GenerationInterval } from "./types";

test("cleanShare sums only clean fuels", () => {
  const interval: GenerationInterval = {
    from: "2025-11-23T00:00Z",
    to: "2025-11-23T00:30Z",
    generationmix: [
      { fuel: "biomass", perc: 10 },
      { fuel: "nuclear", perc: 20 },
      { fuel: "coal", perc: 30 }
    ]
  };

  expect(cleanShare(interval)).toBe(30);
});
