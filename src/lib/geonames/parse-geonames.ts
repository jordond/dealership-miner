import { pathExists } from "fs-extra";
import pull = require("pull-stream");

import { mapToRegion } from "../model/region";
import { City } from "../model/city";
import { CityDataset } from "../geonames/city-data";
import {
    readGeonames,
    GeonamesItem,
    FEATURE_CODE_CITY as FEATURE_CLASS_CITY,
} from "../geonames/parser";

export const DEFAULT_POPUALTION_MIN = 1;

export async function parseCities(datasetPath: string): Promise<CityDataset> {
    const datasetExists = await pathExists(datasetPath);
    if (!datasetExists) {
        throw new Error(`Dataset does not exist at ${datasetPath}`);
    }

    const filterCity = filterCityFunc();

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

                const mapped = mapToCityDataset(results as City[]);
                resolve(mapped);
            })
        );
    });
}

function filterCityFunc() {
    return (item: GeonamesItem): boolean => {
        return item.featureClass === FEATURE_CLASS_CITY;
    };
}

function parseToCity(item: GeonamesItem): City | undefined {
    const region = mapToRegion(item.adminCode);

    return {
        region: region ?? (item.adminCode as any),
        id: item.id,
        name: item.name,
        population: item.population,
        location: {
            latitude: item.lat,
            longitude: item.lon,
            timezone: item.timezone,
        },
    };
}

function mapToCityDataset(results: City[]): CityDataset {
    return results.reduce((dataset, city) => {
        const array = dataset[city.region] ?? [];
        return {
            ...dataset,
            [city.region]: [...array, city],
        };
    }, {} as CityDataset);
}
