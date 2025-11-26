import request from "supertest";
import nock from "nock";
import express from "express";

import { getEnergyMix, getOptimalWindow } from "../src/mixController";

const app = express();
app.get("/api/mix", getEnergyMix);
app.get("/api/optimal-window", getOptimalWindow);

const API_BASE = "https://api.carbonintensity.org.uk";

describe("Mix Controller", () => {
  afterEach(() => nock.cleanAll());

  test("GET /api/mix returns 3 days with averages", async () => {
    const fakeData = [
      {
        from: "2025-11-23T00:00Z",
        to: "2025-11-23T00:30Z",
        generationmix: [
          { fuel: "biomass", perc: 10 },
          { fuel: "wind", perc: 20 },
        ],
      },
      {
        from: "2025-11-24T00:00Z",
        to: "2025-11-24T00:30Z",
        generationmix: [
          { fuel: "biomass", perc: 30 },
          { fuel: "wind", perc: 40 },
        ],
      },
      {
        from: "2025-11-25T00:00Z",
        to: "2025-11-25T00:30Z",
        generationmix: [
          { fuel: "biomass", perc: 50 },
          { fuel: "wind", perc: 60 },
        ],
      }
    ];

    nock(API_BASE)
      .get(/\/generation\/.*/)
      .reply(200, { data: fakeData });

    const res = await request(app).get("/api/mix");

    expect(res.status).toBe(200);
    expect(res.body.days.length).toBe(3);
    expect(res.body.days[0]).toHaveProperty("averages");
    expect(res.body.days[0]).toHaveProperty("cleanPercentage");
  });

  test("GET /api/optimal-window returns best window", async () => {
    const fakeIntervals = [
      {
        from: "2025-11-24T00:00Z",
        to: "2025-11-24T00:30Z",
        generationmix: [{ fuel: "wind", perc: 90 }],
      },
      {
        from: "2025-11-24T00:30Z",
        to: "2025-11-24T01:00Z",
        generationmix: [{ fuel: "wind", perc: 10 }],
      },
      {
        from: "2025-11-24T01:00Z",
        to: "2025-11-24T01:30Z",
        generationmix: [{ fuel: "wind", perc: 100 }],
      },
      {
        from: "2025-11-24T01:30Z",
        to: "2025-11-24T02:00Z",
        generationmix: [{ fuel: "wind", perc: 100 }],
      }
    ];

    nock(API_BASE)
      .get(/\/generation\/.*/)
      .reply(200, { data: fakeIntervals });

    const res = await request(app).get("/api/optimal-window?hours=1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("start");
    expect(res.body).toHaveProperty("end");
    expect(res.body).toHaveProperty("cleanPercentage");
    expect(res.body.cleanPercentage).toBeGreaterThan(50);
  });
});
