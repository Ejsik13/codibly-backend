"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const types_1 = require("./types");
test("cleanShare sums only clean fuels", () => {
    const interval = {
        from: "2025-11-23T00:00Z",
        to: "2025-11-23T00:30Z",
        generationmix: [
            { fuel: "biomass", perc: 10 },
            { fuel: "nuclear", perc: 20 },
            { fuel: "coal", perc: 30 }
        ]
    };
    expect((0, utils_1.cleanShare)(interval)).toBe(30);
});
//# sourceMappingURL=utils.test.js.map