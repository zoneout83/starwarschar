import axios from "axios";
import { StarshipRecord } from "../models/StarshipRecord";
import { logError } from "../../services/logError";
import { infoLog } from "../../services/info";

const RAW_BASE = import.meta.env.VITE_APP_SWAPI_BASE.replace(/\/$/, "");
const PROXY    = import.meta.env.VITE_PROXY_URL;

const ENDPOINT = `${RAW_BASE}/starships/`;

function throughAllOrigins(url: string): string {
  return `${PROXY}/raw?url=${encodeURIComponent(url)}`;
}

function normalizeList<T>(raw: any): T[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.results)) return raw.results;
  return [];
}

export async function fetchAllStarships(): Promise<StarshipRecord[]> {
  try {
    const starshipsText = await axios
      .get<string>(throughAllOrigins(ENDPOINT), { responseType: "text" })
      .then((r) => r.data);

    const rawStarships = JSON.parse(starshipsText);
    const starshipsArray = normalizeList<any>(rawStarships);

    return starshipsArray.map((r) => ({
      name: r.name ?? "unknown",
      model: r.model ?? "unknown",
      manufacturer: r.manufacturer ?? "unknown",
      cost_in_credits: r.cost_in_credits ?? "unknown",
      length: r.length ?? "unknown",
      max_atmosphering_speed: r.max_atmosphering_speed ?? "unknown",
      crew: r.crew ?? "unknown",
      passengers: r.passengers ?? "unknown",
      cargo_capacity: r.cargo_capacity ?? "unknown",
      consumables: r.consumables ?? "unknown",
      hyperdrive_rating: r.hyperdrive_rating ?? "unknown",
      MGLT: r.MGLT ?? "unknown",
      starship_class: r.starship_class ?? "unknown",
      pilots: Array.isArray(r.pilots) ? r.pilots : [],
      films: Array.isArray(r.films) ? r.films : [],
      created: r.created ?? "",
      edited: r.edited ?? "",
      url: r.url ?? "",
    }));
  } catch (err) {
    logError(err, "Failed to fetch starships");
    infoLog("Using empty data for starships");
    return [];
  }
}