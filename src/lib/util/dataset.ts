import { join } from "path";
import { cli } from "cli-ux";
import { remove } from "fs-extra";
import * as ListR from "listr";

import { ConfigCommand } from "./config-command";
import { downloadData } from "../download";
import { unzipDataset } from "../unzip";
import { parseCities } from "../geonames/parse-geonames";
import { City } from "../model/city";
import { saveCityData, getCityDataPath } from "../city-data";

export const DATASET_NAME = "-dataset";

export function createDatasetPath(command: ConfigCommand) {
    const datasetName = `${command.app.country}${DATASET_NAME}.txt`;
    return join(command.app.cacheDir, datasetName);
}

export async function fetchDataset(
    command: ConfigCommand,
    datasetPath: string = createDatasetPath(command)
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
                const parsed = await parseCities({
                    datasetPath,
                    regions: command.app.regions,
                });
                context.parsed = parsed;
            },
        },
        {
            title: "Save city data",
            task: (context) => saveCityData(command, context.parsed as City[]),
        },
        {
            title: "Clean up",
            task: () =>
                Promise.all([remove(downloadPath), remove(datasetPath)]),
        },
    ]);

    const result = await tasks.run({});
    const cityData = result.parsed as City[];
    if (cityData.length === 0) {
        command.error("Was unable to parse any cities!");
    }

    command.log(
        `Parsed ${cityData.length} cities from ${command.app.country}${DATASET_NAME}.txt`
    );
    command.log(`Saved data to ${getCityDataPath(command)}`);
}
