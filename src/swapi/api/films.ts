import axios from "axios";
import { FilmRecord } from "../models/FilmRecord";
import { throughAllOrigins, normalizeList } from "../utils";
import { logError } from "../../services/logError";
import { infoLog } from "../../services/info";

const RAW_BASE = import.meta.env.VITE_APP_SWAPI_BASE.replace(/\/$/, "");
const ENDPOINT = `${RAW_BASE}/films/`;

export async function fetchAllFilms(): Promise<FilmRecord[]> {
  try {
    const filmsText = await axios
      .get<string>(throughAllOrigins(ENDPOINT), { responseType: "text" })
      .then((r) => r.data);

    const rawFilms = JSON.parse(filmsText);
    const filmsArray = normalizeList<any>(rawFilms);

    return filmsArray.map((r) => ({
      title: r.title ?? "unknown",
      episode_id: r.episode_id ?? -1,
      opening_crawl: r.opening_crawl ?? "",
      director: r.director ?? "unknown",
      producer: r.producer ?? "unknown",
      release_date: r.release_date ?? "unknown",
      characters: Array.isArray(r.characters) ? r.characters : [],
      planets: Array.isArray(r.planets) ? r.planets : [],
      starships: Array.isArray(r.starships) ? r.starships : [],
      vehicles: Array.isArray(r.vehicles) ? r.vehicles : [],
      species: Array.isArray(r.species) ? r.species : [],
      created: r.created ?? "",
      edited: r.edited ?? "",
      url: r.url ?? "",
    }));
  } catch (err) {
    logError(err, "Failed to fetch films");
    infoLog("Using empty data for films");
    return [];
  }
}