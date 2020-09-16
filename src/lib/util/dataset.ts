import { join } from "path";
import { cli } from "cli-ux";
import { remove } from "fs-extra";
import * as ListR from "listr";

import { ConfigCommand } from "./config-command";
import { downloadData } from "../geonames/download";
import { unzipDataset } from "../geonames/unzip";
import { parseCities } from "../geonames/parse-geonames";
import {
    saveCityData,
    getCityDataPath,
    countCities,
    CityDataset,
} from "../geonames/city-data";

export const DATASET_NAME = "-dataset";

export function createDatasetPath(command: ConfigCommand) {
    const datasetName = `${command.app.country}${DATASET_NAME}.json`;
    return join(command.app.cacheDir, datasetName);
}

export async function fetchDataset(
    command: ConfigCommand,
    { datasetPath = createDatasetPath(command), prettyPrintData = false } = {}
) {
    // Download the dataset
    const downloadName = `${command.app.country}${DATASET_NAME}.zip`;
    const downloadPath = join(command.app.cacheDir, downloadName);
    const downloadBar = cli.progress();
    command.log(
        `Downloading the ${command.app.country} dataset to ${downloadPath}`
    );
    downloadBar.start();
    await downloadData(downloadPath, command.app.country, (progress) =>
        downloadBar.update(progress)
    );
    downloadBar.stop();

    // Unzip, parse, save, and clean up
    const tasks = new ListR([
        {
            title: "Unzipping",
            task: () =>
                unzipDataset(downloadPath, datasetPath, command.app.country),
        },
        {
            title: "Parsing cities",
            task: async (context) => {
                const parsed = await parseCities(datasetPath);
                const cityCount = countCities(parsed);
                if (cityCount === 0) {
                    throw new Error("Was unable to parse any cities!");
                }

                context.parsed = parsed;
            },
        },
        {
            title: "Save city data",
            task: (context) =>
                saveCityData(
                    command,
                    context.parsed as CityDataset,
                    prettyPrintData
                ),
        },
        {
            title: "Clean up",
            task: () =>
                Promise.all([remove(downloadPath), remove(datasetPath)]),
        },
    ]);

    const result = await tasks.run({});
    const cityCount = countCities(result.parsed);
    if (cityCount === 0) {
        command.error("Was unable to parse any cities!");
    }

    command.log(
        `Parsed ${cityCount} cities from ${command.app.country}${DATASET_NAME}.txt`
    );
    command.log(`Saved data to ${getCityDataPath(command)}`);
}
