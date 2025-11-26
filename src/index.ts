import express from "express";
import cors from "cors";
import { getEnergyMix, getOptimalWindow } from "./mixController";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/mix", getEnergyMix);
app.get("/api/optimal-window", getOptimalWindow);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
