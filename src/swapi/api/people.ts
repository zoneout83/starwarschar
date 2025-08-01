import axios from "axios";
import { PeopleRecord } from "../models/PeopleRecord";
import { PersonView } from "../views/PersonView";
import { FilmRecord } from "../models/FilmRecord";
import { PlanetRecord } from "../models/PlanetRecord";
import { SpeciesRecord } from "../models/SpeciesRecord";
import { StarshipRecord } from "../models/StarshipRecord";
import { VehicleRecord } from "../models/VehicleRecord";
import { throughAllOrigins, normalizeList, delay } from "../utils";
import { logError } from "../../services/logError";
import { infoLog } from "../../services/info";

const RAW_BASE = import.meta.env.VITE_APP_SWAPI_BASE.replace(/\/$/, "");

const ENDPOINTS = {
  people:    `${RAW_BASE}/people/`,
  films:     `${RAW_BASE}/films/`,
  species:   `${RAW_BASE}/species/`,
  vehicles:  `${RAW_BASE}/vehicles/`,
  starships: `${RAW_BASE}/starships/`,
  planets:   `${RAW_BASE}/planets/`,
};

export async function fetchAllPeople(): Promise<PersonView[]> {
  const peopleText = await axios
    .get<string>(throughAllOrigins(ENDPOINTS.people), { responseType: "text" })
    .then((r) => r.data);
  let rawPeople: any;
  try {
    rawPeople = JSON.parse(peopleText);
  } catch (err){
    logError(err, "Failed to parse people data");
    return [];
  }
  const peopleArray = normalizeList<any>(rawPeople);

  const people: PeopleRecord[] = peopleArray.map((r) => ({
    name: r.name ?? "unknown",
    height: r.height ?? "unknown",
    mass: r.mass ?? "unknown",
    hair_color: r.hair_color ?? "unknown",
    skin_color: r.skin_color ?? "unknown",
    eye_color: r.eye_color ?? "unknown",
    birth_year: r.birth_year ?? "unknown",
    gender: r.gender ?? "unknown",
    homeworld: r.homeworld ?? "",
    films: Array.isArray(r.films) ? r.films : [],
    species: Array.isArray(r.species) ? r.species : [],
    vehicles: Array.isArray(r.vehicles) ? r.vehicles : [],
    starships: Array.isArray(r.starships) ? r.starships : [],
    created: r.created ?? "",
    edited: r.edited ?? "",
    url: r.url ?? "",
    randImage: r.randImage
  }));

  const entityUrls = [
    ENDPOINTS.films,
    ENDPOINTS.species,
    ENDPOINTS.vehicles,
    ENDPOINTS.starships,
    ENDPOINTS.planets,
  ];

  const texts: string[] = [];
  for (const url of entityUrls) {
    await delay();
    let data: string;
    try {
      data = await axios
        .get<string>(throughAllOrigins(url), { responseType: "text" })
        .then((r) => r.data);
    } catch (err) {
      logError(err, `Failed to fetch data from ${url}`);
      infoLog(`Using empty data for ${url}`);
      data = "[]";
    }
    texts.push(data);
  }
  const [filmsText, speciesText, vehiclesText, starshipsText, planetsText] = texts;

  function buildMap<T extends { url: string }>(raw: any, keyName: keyof T) {
    const m = new Map<string, string>();
    normalizeList<T>(raw).forEach((item) => {
      if (item.url && typeof item[keyName] === "string") {
        m.set(item.url, item[keyName] as string);
      }
    });
    return m;
  }

  const filmMap = buildMap<FilmRecord>(JSON.parse(filmsText), "title");
  const speciesMap = buildMap<SpeciesRecord>(JSON.parse(speciesText), "name");
  const vehicleMap = buildMap<VehicleRecord>(JSON.parse(vehiclesText), "name");
  const starshipMap = buildMap<StarshipRecord>(JSON.parse(starshipsText), "name");

  const rawPlanets = normalizeList<PlanetRecord>(JSON.parse(planetsText));
  const planetInfoMap = new Map<string, PlanetRecord>();
  rawPlanets.forEach((p) => {
    if (p.url) planetInfoMap.set(p.url, p);
  });

  return people.map((p) => {
    const planet = planetInfoMap.get(p.homeworld);
    return {
      ...p,
      filmTitles: p.films.map((u) => filmMap.get(u) ?? "Unknown Film"),
      speciesNames: p.species.map((u) => speciesMap.get(u) ?? "Unknown Species"),
      vehicleNames: p.vehicles.map((u) => vehicleMap.get(u) ?? "Unknown Vehicle"),
      starshipNames: p.starships.map((u) => starshipMap.get(u) ?? "Unknown Starship"),
      homeworldName: planet?.name ?? "Unknown Planet",
      homeworldRotationPeriod: planet?.rotation_period ?? "unknown",
      homeworldOrbitalPeriod: planet?.orbital_period ?? "unknown",
      homeworldDiameter: planet?.diameter ?? "unknown",
      homeworldClimate: planet?.climate ?? "unknown",
      homeworldGravity: planet?.gravity ?? "unknown",
      homeworldTerrain: planet?.terrain ?? "unknown",
      homeworldSurfaceWater: planet?.surface_water ?? "unknown",
      homeworldPopulation: planet?.population ?? "unknown",
      randImage: Math.floor(Math.random() * 100000)
    };
  });
}