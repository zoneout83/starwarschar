import axios from "axios";
import { PlanetRecord } from "../models/PlanetRecord";
import { logError } from "../../services/logError";
import { infoLog } from "../../services/info";

const RAW_BASE = import.meta.env.VITE_APP_SWAPI_BASE.replace(/\/$/, "");
const PROXY    = import.meta.env.VITE_PROXY_URL;

const ENDPOINT = `${RAW_BASE}/planets/`;

function throughAllOrigins(url: string): string {
  return `${PROXY}/raw?url=${encodeURIComponent(url)}`;
}

function normalizeList<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.results)) return raw.results;
  return [];
}

export async function fetchAllPlanets(): Promise<PlanetRecord[]> {
  try {
    const planetsText = await axios
      .get<string>(throughAllOrigins(ENDPOINT), { responseType: "text" })
      .then((r) => r.data);

    const rawPlanets = JSON.parse(planetsText);
    const planetsArray = normalizeList<any>(rawPlanets);

    return planetsArray.map((r) => ({
      name: r.name ?? "unknown",
      rotation_period: r.rotation_period ?? "unknown",
      orbital_period: r.orbital_period ?? "unknown",
      diameter: r.diameter ?? "unknown",
      climate: r.climate ?? "unknown",
      gravity: r.gravity ?? "unknown",
      terrain: r.terrain ?? "unknown",
      surface_water: r.surface_water ?? "unknown",
      population: r.population ?? "unknown",
      residents: Array.isArray(r.residents) ? r.residents : [],
      films: Array.isArray(r.films) ? r.films : [],
      created: r.created ?? "",
      edited: r.edited ?? "",
      url: r.url ?? "",
    }));
  } catch (err) {
    logError(err, "Failed to fetch planets");
    infoLog("Using empty data for planets");
    return [];
  }
}