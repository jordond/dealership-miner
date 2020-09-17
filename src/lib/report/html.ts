import * as json2html from "json2html";
import { outputFile } from "fs-extra";
import { join } from "path";

import { DealershipDataset } from "../model/dealership-dataset";
import { regionAbrevToName } from "../model/region";

export async function generateHtmlReport(
    data: DealershipDataset,
    outputPath: string
): Promise<string> {
    /*
        Example:

        {
            Alaska: [Dealership, Dealership]
        }
    */
    const mappedData = Object.keys(data).reduce((dataset, region) => {
        const dealerships = data[region].dealerships
            .map(({ placeId, region, ...rest }) => rest)
            .sort((left, right) => left.city.localeCompare(right.city));

        return {
            ...dataset,
            [regionAbrevToName(region)]: dealerships,
        };
    }, {});

    const html = json2html.render(mappedData);
    const filename = `dealership-report-${new Date().getTime()}.html`;
    const outputFilename = join(outputPath, filename);
    await outputFile(outputFilename, html);

    return outputFilename;
}
