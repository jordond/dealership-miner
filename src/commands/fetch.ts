import { flags } from "@oclif/command";
import { prompt } from "inquirer";

import { ConfigCommand } from "../lib/util/config-command";

export const DEFAULT_POPULATION_MIN = 500;

export default class Fetch extends ConfigCommand {
    static description = "Fetch all the dealerships";

    static examples = ["$ dealership-miner fetch"];

    static flags = {
        help: flags.help({ char: "h" }),
        population: flags.integer({
            char: "p",
            description: "Minimum population required for city",
            default: undefined,
        }),
        refresh: flags.boolean({
            char: "r",
            description: "Delete all previous data and start fresh",
            default: false,
        }),
    };

    async doWork() {
        const minimumPopulation = await this.getMinimumPopulation();
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
            default: DEFAULT_POPULATION_MIN,
            validate: (input) => {
                if (input >= 0) return true;
                return "Needs to be >= 0";
            },
        });

        return minimumPopulation;
    }
}
