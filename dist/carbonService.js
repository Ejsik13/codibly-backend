"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGeneration = fetchGeneration;
const axios_1 = __importDefault(require("axios"));
const types_1 = require("./types");
const BASE_URL = "https://api.carbonintensity.org.uk";
async function fetchGeneration(fromIso, toIso) {
    const url = `${BASE_URL}/generation/${fromIso}/${toIso}`;
    const response = await axios_1.default.get(url);
    return response.data.data;
}
//# sourceMappingURL=carbonService.js.map