import { join } from "path";
import { outputJson, readJson } from "fs-extra";

import { ConfigCommand } from "../util/config-command";
import {
    DealershipDataset,
    DealershipDataPoint,
} from "../model/dealership-dataset";

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
    dataPoint: DealershipDataPoint,
    { prettyPrint = false } = {}
) {
    const existing = await loadDealershipData(command, {
        throwOnNotFound: false,
    });
    await saveDealershipData(
        command,
        {
            ...existing,
            [region]: dataPoint,
        },
        prettyPrint
    );
}

export function dataPointOrBlank(
    data: DealershipDataPoint | undefined,
    minimumPopulation: number
): DealershipDataPoint {
    if (data) return { ...data, minimumPopulation };

    return {
        minimumPopulation,
        cityIds: [],
        dealershipIds: [],
        dealerships: [],
    };
}
