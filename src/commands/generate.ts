import { flags } from "@oclif/command";
import { prompt } from "inquirer";

import { ConfigCommand } from "../lib/util/config-command";
import { resolve, dirname, extname } from "path";
import { DealershipDataset } from "../lib/model/dealership-dataset";
import {
    loadDealershipData,
    countDealerships,
} from "../lib/places/dealership-data";
import { regionAbrevToName } from "../lib/model/region";
import { generateHtmlReport } from "../lib/report/html";
import { generateXlsReport } from "../lib/report/xls";
import { cli } from "cli-ux";

const FORMAT_BOTH = "both";
const FORMAT_XLS = "excel";
const FORMAT_HTML = "html";

const VALID_FORMATS = [FORMAT_BOTH, FORMAT_XLS, FORMAT_HTML];

const DEFAULT_FORMAT = "excel";

export default class Generate extends ConfigCommand {
    static description = "Generate reports from the dealership dataset";

    static examples = [
        "$ dealership-miner generate",
        "$ dealership-miner generate --output /home/user/temp",
        `$ dealership-miner generate --format ${FORMAT_BOTH}`,
        `$ dealership-miner generate --format ${FORMAT_HTML}`,
    ];

    static flags = {
        help: flags.help({ char: "h" }),
        format: flags.string({
            char: "f",
            description: `Format for the report (${VALID_FORMATS.join("|")})`,
        }),
        output: flags.string({
            char: "o",
            description: "Path to save the generated report",
            default: "./",
        }),
        yes: flags.boolean({
            char: "y",
            description: "Ignore all confirmation checks",
            default: false,
        }),
    };

    private dataset?: DealershipDataset;

    private datasetInfo: { regions: number; dealerships: number } = {
        regions: 0,
        dealerships: 0,
    };

    async doWork() {
        const { format, output, yes } = this.parse(Generate).flags;
        this.dataset = await loadDealershipData(this, {
            throwOnNotFound: true,
        });
        this.datasetInfo = countDealerships(this.dataset!);

        if (this.datasetInfo.dealerships === 0) {
            this.error(
                "Dataset exists, but there is no data. Run 'dealership-miner fetch'"
            );
        }

        const selectedFormat = await this.getOutputFormat(format);
        const outputPath = await this.getOutputPath(output, yes);
        const selectedRegions = await this.askForRegions();

        const dataset = this.generateDataset(selectedRegions);
        const info = countDealerships(dataset);
        this.log(
            `Generating an ${printType(selectedFormat)} report for ${
                info.dealerships
            } in ${info.regions} regions.`
        );

        if (!yes) {
            const confirm = await this.confirm("Continue?", true);
            if (!confirm) this.exit();
        }

        // Generate reports
        cli.action.start("Generating report(s)");
        const reportPromises = this.getReportPromises(
            dataset,
            selectedFormat,
            outputPath
        );
        const filenames = await Promise.all(reportPromises);
        cli.action.stop();

        this.log("Report(s) can be found:");
        filenames.forEach((filename) => this.log(`\t-> ${filename}`));
    }

    private async getOutputFormat(value?: string): Promise<string> {
        if (value !== undefined && validateFormat(value)) {
            return value.toLowerCase();
        }

        const { format }: { format: string } = await prompt({
            message: "Which format would you like to output?",
            name: "format",
            type: "list",
            default: DEFAULT_FORMAT,
            choices: VALID_FORMATS,
        });

        return format;
    }

    private async getOutputPath(output: string, yes: boolean) {
        const outputPath = formatOutputPath(output);
        if (!yes) {
            const confirm = await this.confirm(
                `Output report to ${outputPath}?`,
                true
            );
            if (!confirm) return this.askForOutputPath();
        }

        return outputPath;
    }

    private async askForOutputPath(): Promise<string> {
        const { outputPath }: { outputPath: string } = await prompt({
            message: "Where would you like to output?",
            name: "outputPath",
            type: "input",
            default: formatOutputPath("./"),
            transformer: (value) => formatOutputPath(value),
        });

        return outputPath;
    }

    private async askForRegions() {
        const regions = Object.keys(this.dataset!);

        const { choices } = await prompt({
            type: "checkbox",
            name: "choices",
            message: "Which regions would you like to include?",
            choices: regions.map((region) => ({
                name: region,
                title: regionAbrevToName(region),
                checked: true,
            })),
        });

        if (choices.length === 0) {
            this.error("No regions were selected, exiting!");
        }

        return choices as string[];
    }

    private generateDataset(regions: string[]): DealershipDataset {
        return regions.reduce(
            (dataset, region) => ({
                ...dataset,
                [region]: this.dataset![region],
            }),
            {}
        );
    }

    private getReportPromises(
        dataset: DealershipDataset,
        selectedFormat: string,
        outputPath: string
    ): Promise<string>[] {
        if (selectedFormat === FORMAT_BOTH) {
            return [
                generateHtmlReport(dataset, outputPath),
                generateXlsReport(dataset, outputPath),
            ];
        }

        if (selectedFormat === FORMAT_HTML)
            return [generateHtmlReport(dataset, outputPath)];

        if (selectedFormat === FORMAT_XLS)
            return [generateXlsReport(dataset, outputPath)];

        this.error(
            `Format '${selectedFormat}' is not a supported format type!`
        );
    }
}

function validateFormat(value: string): boolean {
    return VALID_FORMATS.includes(value.toLowerCase());
}

function formatOutputPath(value: string) {
    const path = resolve(value);
    const extension = extname(path);

    if (extension) return dirname(path);

    return path;
}

function printType(value: string) {
    return value === FORMAT_BOTH ? `${FORMAT_XLS}, and ${FORMAT_HTML}` : value;
}
