import axios from "axios";
import { VehicleRecord } from "../models/VehicleRecord";
import { logError } from "../../services/logError";
import { infoLog } from "../../services/info";

const RAW_BASE = import.meta.env.VITE_APP_SWAPI_BASE.replace(/\/$/, "");
const PROXY = import.meta.env.VITE_PROXY_URL;

const ENDPOINT = `${RAW_BASE}/vehicles/`;

function throughAllOrigins(url: string): string {
    return `${PROXY}/raw?url=${encodeURIComponent(url)}`;
}

function normalizeList<T>(raw: any): T[] {
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.results)) return raw.results;
    return [];
}

export async function fetchAllVehicles(): Promise<VehicleRecord[]> {
    try {
        const vehiclesText = await axios
            .get<string>(throughAllOrigins(ENDPOINT), { responseType: "text" })
            .then((r) => r.data);

        const rawVehicles = JSON.parse(vehiclesText);
        const vehiclesArray = normalizeList<any>(rawVehicles);

        return vehiclesArray.map((r) => ({
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
            vehicle_class: r.vehicle_class ?? "unknown",
            pilots: Array.isArray(r.pilots) ? r.pilots : [],
            films: Array.isArray(r.films) ? r.films : [],
            created: r.created ?? "",
            edited: r.edited ?? "",
            url: r.url ?? "",
        }));
    } catch (err) {
        logError(err, "Failed to fetch vehicles");
        infoLog("Using empty data for vehicles");
        return [];
    }
}