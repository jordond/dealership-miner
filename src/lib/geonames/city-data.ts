import { join } from "path";
import { outputJson, readJson } from "fs-extra";

import { ConfigCommand } from "../util/config-command";
import { City } from "../model/city";

const CITY_DATA_FILE = "geonames-city-data.json";

export function getCityDataPath(command: ConfigCommand) {
    return join(command.app.dataDir, CITY_DATA_FILE);
}

export async function loadCityData(command: ConfigCommand): Promise<City[]> {
    const cityDataPath = getCityDataPath(command);
    try {
        const data = (await readJson(cityDataPath)) as City[];
        return data;
    } catch (error) {
        throw new Error(
            `Unable to read ${cityDataPath}, did you run 'dealership-miner init'?`
        );
    }
}

export async function saveCityData(command: ConfigCommand, data: City[]) {
    await outputJson(getCityDataPath(command), data);
}
