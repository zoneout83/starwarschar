import axios from "axios";
import { SpeciesRecord } from "../models/SpeciesRecord";
import { logError } from "../../services/logError";
import { infoLog } from "../../services/info";

const RAW_BASE = import.meta.env.VITE_APP_SWAPI_BASE.replace(/\/$/, "");
const PROXY    = import.meta.env.VITE_PROXY_URL;

const ENDPOINT = `${RAW_BASE}/species/`;

function throughAllOrigins(url: string): string {
  return `${PROXY}/raw?url=${encodeURIComponent(url)}`;
}

function normalizeList<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.results)) return raw.results;
  return [];
}

export async function fetchAllSpecies(): Promise<SpeciesRecord[]> {
  try {
    const speciesText = await axios
      .get<string>(throughAllOrigins(ENDPOINT), { responseType: "text" })
      .then((r) => r.data);

    const rawSpecies = JSON.parse(speciesText);
    const speciesArray = normalizeList<any>(rawSpecies);

    return speciesArray.map((r) => ({
      name: r.name ?? "unknown",
      classification: r.classification ?? "unknown",
      designation: r.designation ?? "unknown",
      average_height: r.average_height ?? "unknown",
      skin_colors: r.skin_colors ?? "unknown",
      hair_colors: r.hair_colors ?? "unknown",
      eye_colors: r.eye_colors ?? "unknown",
      average_lifespan: r.average_lifespan ?? "unknown",
      homeworld: r.homeworld ?? "",
      language: r.language ?? "unknown",
      people: Array.isArray(r.people) ? r.people : [],
      films: Array.isArray(r.films) ? r.films : [],
      created: r.created ?? "",
      edited: r.edited ?? "",
      url: r.url ?? "",
    }));
  } catch (err) {
    logError(err, "Failed to fetch species");
    infoLog("Using empty data for species");
    return [];
  }
}