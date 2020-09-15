import * as file from "pull-file";
import * as pull from "pull-stream";
import * as bits from "pull-tobits";

export interface GeonamesItem {
    id: number;
    name: string;
    asciiname: string;
    alternativeNames: string;
    lat: number;
    lon: number;
    featureClass: string;
    featureCode: string;
    country: string;
    altCountryCode: string;
    adminCode: string;
    countrySubdivision: string;
    municipality: string;
    municipalitySubdivision: string;
    population: number;
    elevation: number;
    dem: string;
    timezone: string;
    lastModified: string;
}

const fieldMappings = [
    "id",
    "name",
    "asciiname",
    "alternativeNames",
    "lat",
    "lon",
    "featureClass",
    "featureCode",
    "country",
    "altCountryCode",
    "adminCode",
    "countrySubdivision",
    "municipality",
    "municipalitySubdivision",
    "population",
    "elevation",
    "dem",
    "timezone",
    "lastModified",
];

const noTranslator = (value: any) => value;

const translators = [
    parseInt,
    null,
    null,
    null,
    // lat and lon
    parseFloat,
    parseFloat,
    // feature class and code
    null,
    null,
    // country codes
    null,
    null,
    // admin codes 1 - 4
    null,
    null,
    null,
    null,
    // population and elevation
    parseFloat,
    parseFloat,
    // dem
    null,
    // timezone
    null,
    // last modified
    null,
];

const fieldCount = fieldMappings.length;

export function readGeonames(datasetPath: string) {
    return pull(
        file(datasetPath),
        bits.split([0x0a]),
        pull.map((line: any) => {
            const records = line.toString().split("\t");
            const item = {} as any;

            for (let index = fieldCount; index--; ) {
                const fieldMapping = fieldMappings[index];
                const translator = translators[index] ?? noTranslator;
                if (fieldMapping) {
                    const value = translator(records[index]);
                    item[fieldMapping] = value;
                }
            }

            return item as GeonamesItem;
        })
    );
}
