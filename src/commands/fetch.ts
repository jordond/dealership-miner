import { flags } from "@oclif/command";
import { prompt } from "inquirer";

import { ConfigCommand } from "../lib/util/config-command";
import { loadCityData, CityDataset } from "../lib/geonames/city-data";
import {
    loadDealershipData,
    dataPointOrBlank,
    saveDealershipDataPoint,
} from "../lib/places/dealership-data";
import { fetchPlaceIds } from "../lib/places/place-ids";
import { DealershipDataPoint } from "../lib/model/dealership-dataset";

export const DEFAULT_POPULATION_MIN = 500;

export default class Fetch extends ConfigCommand {
    static description = "Fetch all the dealerships";

    static examples = ["$ dealership-miner fetch"];

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
        force: flags.boolean({
            char: "f",
            description: "Delete all previous data and start fresh",
            default: false,
        }),
    };

    async doWork() {
        const { force } = this.parse(Fetch).flags;
        const cityData = await loadCityData(this);

        // Get user input or values from flags
        const selectedRegion = await this.getRegion(cityData);
        const minPopulation = await this.getMinimumPopulation();
        this.app.previousPopulation = minPopulation;
        await this.save();

        // Load existing dealership data
        const dealershipData = await loadDealershipData(this, {
            throwOnNotFound: false,
        });

        // Check if data exists, and population value is the same
        const regionData = dataPointOrBlank(
            dealershipData[selectedRegion],
            minPopulation
        );

        if (force || regionData.dealershipIds.length === 0) {
            await this.getPlaceIds(cityData, selectedRegion, regionData, force);
        } else {
            this.log(
                `Dealership data already exists for ${selectedRegion}, pass '--refresh' to disable this check`
            );
            const confirm = await this.confirm("Fetch data anyways?");
            if (confirm) {
                await this.getPlaceIds(
                    cityData,
                    selectedRegion,
                    regionData,
                    true
                );
            }
        }
    }

    private async getRegion(cityData: CityDataset): Promise<string> {
        const regions = Object.keys(cityData).sort();
        const region = this.parse(Fetch).flags.region?.toUpperCase();

        if (region !== undefined && regions.includes(region)) return region;

        const { choice } = await prompt({
            type: "list",
            name: "choice",
            message: "Which region?",
            choices: regions,
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
        regionData: DealershipDataPoint,
        force = false
    ) {
        // Fetch place ids and save
        const geonamesCities = cityData[selectedRegion];
        const citiesWithIds = await fetchPlaceIds(
            this,
            geonamesCities,
            regionData,
            { force }
        );
        await saveDealershipDataPoint(this, selectedRegion, citiesWithIds);

        // TODO: Remove
        this.log("Just saved the data...");
    }
}
