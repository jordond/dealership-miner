import { join } from "path";
import { outputJson, readJson } from "fs-extra";

import { ConfigCommand } from "../util/config-command";
import {
    DealershipDataset,
    DealershipDataPoint,
} from "../model/dealership-dataset";
import { uniqueArray } from "../util/misc";

const DEALERSHIP_DATA_FILE = "dealership-dataset.json";

export function getDealershipDataPath(command: ConfigCommand) {
    return join(command.app.dataDir, DEALERSHIP_DATA_FILE);
}

export async function loadDealershipData(
    command: ConfigCommand,
    { throwOnNotFound = false } = {}
): Promise<DealershipDataset> {
    const dealershipDataPath = getDealershipDataPath(command);
    try {
        const data = (await readJson(dealershipDataPath)) as DealershipDataset;
        return data;
    } catch (error) {
        if (throwOnNotFound) {
            throw new Error(
                `Unable to read ${dealershipDataPath}, did you run 'dealership-miner fetch'?`
            );
        }

        return {};
    }
}

export function countDealerships(data: DealershipDataset) {
    const regions = Object.keys(data).length;
    const dealerships = Object.values(data).reduce(
        (count, point) => count + point.dealerships.length,
        0
    );

    return { regions, dealerships };
}

export async function loadRegionDataOrBlank(
    command: ConfigCommand,
    region: string
): Promise<DealershipDataPoint> {
    const result = await loadDealershipData(command, {
        throwOnNotFound: false,
    });
    return dataPointOrBlank(result[region]);
}

export async function saveDealershipData(
    command: ConfigCommand,
    data: DealershipDataset,
    prettyPrint = false
) {
    await outputJson(getDealershipDataPath(command), data, {
        spaces: prettyPrint ? 2 : undefined,
    });
}

export async function saveDealershipDataPoint(
    command: ConfigCommand,
    region: string,
    { cityIds, dealershipIds, dealerships }: DealershipDataPoint,
    { prettyPrint = false } = {}
) {
    const existing = await loadDealershipData(command, {
        throwOnNotFound: false,
    });

    // Merge the existing data with the new data
    const data = dataPointOrBlank(existing[region]);
    await saveDealershipData(
        command,
        {
            ...existing,
            [region]: {
                cityIds: uniqueArray([...data.cityIds, ...cityIds]),
                dealershipIds: uniqueArray([
                    ...data.dealershipIds,
                    ...dealershipIds,
                ]),
                dealerships: uniqueArray([...data.dealerships, ...dealerships]),
            },
        },
        prettyPrint
    );
}

export function dataPointOrBlank(
    data: DealershipDataPoint | undefined
): DealershipDataPoint {
    if (data) return { ...data };

    return {
        cityIds: [],
        dealershipIds: [],
        dealerships: [],
    };
}
