import { join } from "path";
import { outputJson, readJson } from "fs-extra";

import { ConfigCommand } from "../util/config-command";
import { City } from "../model/city";

const CITY_DATA_FILE = "geonames-city-data.json";

export interface CityDataset {
    [key: string]: City[];
}

export function countCities(dataset: CityDataset) {
    return Object.values(dataset).reduce(
        (count, array) => count + array.length,
        0
    );
}

export async function cityDataExists(command: ConfigCommand) {
    try {
        const data = await loadCityData(command);
        const cities = countCities(data);
        return cities > 0;
    } catch (error) {
        return false;
    }
}

export function getCityDataPath(command: ConfigCommand) {
    return join(command.app.dataDir, CITY_DATA_FILE);
}

export async function loadCityData(
    command: ConfigCommand
): Promise<CityDataset> {
    const cityDataPath = getCityDataPath(command);
    try {
        const data = (await readJson(cityDataPath)) as CityDataset;
        return data;
    } catch (error) {
        throw new Error(
            `Unable to read ${cityDataPath}, did you run 'dealership-miner init'?`
        );
    }
}

export async function saveCityData(
    command: ConfigCommand,
    data: CityDataset,
    prettyPrint = false
) {
    await outputJson(getCityDataPath(command), data, {
        spaces: prettyPrint ? 2 : undefined,
    });
}
