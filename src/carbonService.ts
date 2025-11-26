import axios from "axios";
import { GenerationInterval } from "./types";

const BASE_URL = "https://api.carbonintensity.org.uk";

export async function fetchGeneration(
  fromIso: string,
  toIso: string
): Promise<GenerationInterval[]> {
  const url = `${BASE_URL}/generation/${fromIso}/${toIso}`;
  const response = await axios.get(url);
  return response.data.data as GenerationInterval[];
}
