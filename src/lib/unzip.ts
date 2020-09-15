import * as unzipper from "unzipper";

import { Country } from "./model/region";
import { createReadStream, createWriteStream } from "fs-extra";

export async function unzipDataset(
    zipPath: string,
    outputPath: string,
    country: Country
) {
    return new Promise((resolve, reject) => {
        const entryName = `${country}.txt`;
        createReadStream(zipPath)
            .pipe(unzipper.Parse())
            .on("error", (cause) => reject(cause))
            .on("close", resolve)
            .on("entry", (entry: unzipper.Entry) => {
                const filename = entry.path;
                if (filename !== entryName) entry.autodrain();
                else
                    entry
                        .pipe(createWriteStream(outputPath))
                        .on("error", reject)
                        .on("close", resolve);
            });
    });
}
