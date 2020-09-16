import { Country } from "../model/region";
import { parse } from "url";
import { createWriteStream } from "fs";
import { get } from "https";

export const BASE_DOWNLOAD_URL = "https://download.geonames.org/export/dump/";
export const DEFAULT_EXTENSION = ".zip";

export const DEFAULT_TIMEOUT = 1000 * 60 * 3; // 3 minutes

type ProgressCallback = (progress: number) => void;

export function downloadData(
    downloadPath: string,
    country: Country = Country.USA,
    progressCallback: ProgressCallback | undefined = undefined
) {
    const url = `${BASE_DOWNLOAD_URL}${country.toUpperCase()}${DEFAULT_EXTENSION}`;
    return download(url, downloadPath, DEFAULT_TIMEOUT, progressCallback);
}

function download(
    url: string,
    downloadPath: string,
    timeout: number,
    progressCallback: ProgressCallback | undefined
) {
    return new Promise((resolve, reject) => {
        const file = createWriteStream(downloadPath);
        const href = parse(url).href;
        if (!href) {
            reject(new Error(`Unable to parse ${url}`));
            return;
        }

        const request = get(href).on("response", (response: any) => {
            const length = parseInt(response.headers["content-length"], 10);
            let downloaded = 0;

            request.setTimeout(timeout, () => {
                request.abort();
                reject(new Error(`request timeout after ${timeout / 1000.0}s`));
            });

            response
                .on("data", (chunk: any) => {
                    file.write(chunk);
                    downloaded += chunk.length;

                    const percent = (100.0 * downloaded) / length;
                    if (progressCallback) progressCallback(Math.round(percent));
                })
                .on("end", () => {
                    file.end();
                    resolve();
                })
                .on("error", (cause: any) => reject(cause));
        });
    });
}
