import { PeopleRecord } from "../models/PeopleRecord";

export interface PersonView extends PeopleRecord {
  filmTitles: string[];
  speciesNames: string[];
  vehicleNames: string[];
  starshipNames: string[];
  homeworldName: string;
  homeworldRotationPeriod: string;
  homeworldOrbitalPeriod: string;
  homeworldDiameter: string;
  homeworldClimate: string;
  homeworldGravity: string;
  homeworldTerrain: string;
  homeworldSurfaceWater: string;
  homeworldPopulation: string;
  randImage: number;
}