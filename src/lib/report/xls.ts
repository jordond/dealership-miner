import { join } from "path";
import * as json2xls from "json2xls";
import * as XLSX from "xlsx";

import { delay } from "../util/misc";
import { DealershipDataset } from "../model/dealership-dataset";
import { regionAbrevToName } from "../model/region";

export async function generateXlsReport(
    data: DealershipDataset,
    outputPath: string
): Promise<string> {
    const dealerships = Object.values(data)
        .map((datapoint) =>
            datapoint.dealerships.sort((left, right) =>
                left.city.localeCompare(right.city)
            )
        )
        .flat()
        .sort((left, right) => left.region.localeCompare(right.region))
        .map((dealership) => ({
            region: dealership.region,
            city: dealership.city,
            name: dealership.name,
            address: dealership.address,
            postal: dealership.postal,
            phone: dealership.phone,
            website: dealership.website,
            url: dealership.url,
        }));

    const mappedData: XLSX.WorkSheet = Object.keys(data)
        .sort()
        .reduce((dataset, region) => {
            const dealerships = data[region].dealerships
                .map(({ placeId, region, ...rest }) => rest)
                .sort((left, right) => left.city.localeCompare(right.city));

            return {
                ...dataset,
                [regionAbrevToName(region)]: XLSX.utils.json_to_sheet(
                    dealerships
                ),
            };
        }, {});

    const book: XLSX.WorkBook = {
        Sheets: mappedData,
        SheetNames: Object.keys(mappedData),
    };

    const filename = `dealership-report-${new Date().getTime()}.xlsx`;
    const outputFilename = join(outputPath, filename);

    XLSX.writeFile(book, outputFilename, {
        Props: {
            Title: "Dealership report",
            Author: "jordond/dealership-miner",
            Subject: "https://github.com/jordond/dealership-miner",
        },
    });

    return outputFilename;
}
