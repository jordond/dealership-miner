import { flags } from "@oclif/command";
import { prompt } from "inquirer";
import { cli } from "cli-ux";

import { ConfigCommand } from "../lib/util/config-command";
import { loadCityData, CityDataset } from "../lib/geonames/city-data";
import {
    loadDealershipData,
    dataPointOrBlank,
    saveDealershipDataPoint,
    loadRegionDataOrBlank,
} from "../lib/places/dealership-data";
import { fetchPlaceIds } from "../lib/places/place-ids";
import { DealershipDataPoint } from "../lib/model/dealership-dataset";
import { fetchDealershipDetails } from "../lib/places/place-details";
import { regionAbrevToName } from "../lib/model/region";

export const DEFAULT_POPULATION_MIN = 5000;

export default class Fetch extends ConfigCommand {
    static description = "Fetch all the dealerships";

    static examples = [
        "$ dealership-miner fetch",
        "$ dealership-miner fetch --pretty",
        "$ dealership-miner fetch --workers 8",
        "$ dealership-miner fetch --force",
    ];

    static flags = {
        help: flags.help({ char: "h" }),
        region: flags.string({
            description: "Which region to fetch data for, example: MI",
        }),
        population: flags.integer({
            char: "p",
            description: "Minimum population required for city",
            default: undefined,
        }),
        workers: flags.integer({
            char: "w",
            description: "How many concurrent workers to use.",
        }),
        pretty: flags.boolean({
            description:
                "Print the dataset in a human readable format. NOTE: Will increase filesize",
        }),
        force: flags.boolean({
            char: "f",
            description: "Delete all previous data and start fresh",
            default: false,
        }),
    };

    private regionData?: DealershipDataPoint;

    async doWork() {
        const { force } = this.parse(Fetch).flags;
        const cityData = await loadCityData(this);

        // Get user input or values from flags
        const selectedRegion = await this.getRegion(cityData);
        const minPopulation = await this.getMinimumPopulation();
        this.app.previousPopulation = minPopulation;
        await this.save(false);

        // Load existing dealership data
        const dealershipData = await loadDealershipData(this, {
            throwOnNotFound: false,
        });

        // Check if data exists, and population value is the same
        this.regionData = dataPointOrBlank(dealershipData[selectedRegion]);

        // Check and get the Dealership Place IDs
        if (force || this.regionData.dealershipIds.length === 0) {
            await this.getPlaceIds(
                cityData,
                selectedRegion,
                minPopulation,
                force
            );
        } else {
            this.log(
                `Dealership Place IDs already exists for ${selectedRegion}`
            );
            const confirm = await this.confirm(
                "Would you like to update the existing data?",
                true
            );
            if (confirm) {
                await this.getPlaceIds(cityData, selectedRegion, minPopulation);
            }
        }

        // Check and get the Dealership Details
        if (force || this.regionData.dealerships.length === 0) {
            await this.getPlaceDetails(selectedRegion, force);
        } else {
            this.log(`Dealership data already exists for ${selectedRegion}`);
            const confirm = await this.confirm(
                "Would you like to update the existing data?",
                true
            );
            if (confirm) {
                await this.getPlaceDetails(selectedRegion);
            }
        }

        this.log("\nAll done!");
        this.log("Run 'dealership-miner generate' to generate your reports!");
    }

    private async getRegion(cityData: CityDataset): Promise<string> {
        const regions = Object.keys(cityData).sort();
        const region = this.parse(Fetch).flags.region?.toUpperCase();

        if (region !== undefined && regions.includes(region)) return region;

        const { choice } = await prompt({
            type: "list",
            name: "choice",
            message: "Which region?",
            choices: regions.map((region) => ({
                name: region,
                title: regionAbrevToName(region),
            })),
        });

        return choice;
    }

    private async getMinimumPopulation(): Promise<number> {
        const { population } = this.parse(Fetch).flags;
        if (population !== undefined && population >= 0) {
            return population;
        }

        const { minimumPopulation } = await prompt({
            message: "What is the minimum population required?",
            name: "minimumPopulation",
            type: "input",
            default: this.app.previousPopulation ?? DEFAULT_POPULATION_MIN,
            validate: (input) => {
                if (input >= 0) return true;
                return "Needs to be >= 0";
            },
        });

        return minimumPopulation;
    }

    private async getPlaceIds(
        cityData: CityDataset,
        selectedRegion: string,
        minimumPopulation: number,
        force = false
    ) {
        const { workers, pretty } = this.parse(Fetch).flags;

        // Fetch place ids and save
        const geonamesCities = cityData[selectedRegion];
        const regionData = await loadRegionDataOrBlank(this, selectedRegion);
        const result = await fetchPlaceIds(
            this,
            geonamesCities,
            regionData,
            minimumPopulation,
            {
                force,
                workers,
            }
        );

        cli.action.start("Saving Place IDs");
        this.regionData = result;
        await saveDealershipDataPoint(this, selectedRegion, result, {
            prettyPrint: pretty,
        });
        cli.action.stop();
    }

    private async getPlaceDetails(selectedRegion: string, force = false) {
        const { workers, pretty } = this.parse(Fetch).flags;

        const regionData = await loadRegionDataOrBlank(this, selectedRegion);
        const result = await fetchDealershipDetails(
            this,
            regionData,
            selectedRegion,
            {
                force,
                workers,
            }
        );

        cli.action.start("Saving Dealership data");
        this.regionData = result;
        await saveDealershipDataPoint(this, selectedRegion, result, {
            prettyPrint: pretty,
        });
        cli.action.stop();
    }
}
