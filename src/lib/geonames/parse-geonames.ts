import { pathExists } from "fs-extra";
import pull = require("pull-stream");

import { Regions, ALL_REGIONS, mapToRegion } from "../model/region";
import { City } from "../model/city";
import {
    readGeonames,
    GeonamesItem,
    FEATURE_CODE_CITY as FEATURE_CLASS_CITY,
} from "../geonames/parser";

export const DEFAULT_POPUALTION_MIN = 1;

export interface ParseCitiesConfig {
    datasetPath: string;
    regions: Regions[];
}

export async function parseCities({
    datasetPath,
    regions = ALL_REGIONS,
}: ParseCitiesConfig): Promise<City[]> {
    const datasetExists = await pathExists(datasetPath);
    if (!datasetExists) {
        throw new Error(`Dataset does not exist at ${datasetPath}`);
    }

    const filterCity = filterCityFunc(regions);

    return new Promise((resolve, reject) => {
        pull(
            readGeonames(datasetPath),
            pull.filter(filterCity),
            pull.map(parseToCity),
            pull.filter((city) => city !== undefined),
            pull.collect((error, results) => {
                if (error) {
                    return reject(error);
                }

                resolve(results as City[]);
            })
        );
    });
}

function filterCityFunc(regions: Regions[]) {
    return (item: GeonamesItem): boolean => {
        const region = mapToRegion(item.adminCode);
        return (
            item.featureClass === FEATURE_CLASS_CITY &&
            regions.includes(region as any)
        );
    };
}

function parseToCity(item: GeonamesItem): City | undefined {
    const region = mapToRegion(item.adminCode);
    if (!region) return undefined;

    return {
        region,
        name: item.name,
        population: item.population,
        location: {
            latitude: item.lat,
            longitude: item.lon,
            timezone: item.timezone,
        },
    };
}
