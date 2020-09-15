import { ConfigCommand } from "../lib/util/config-command";
import { flags } from "@oclif/command";

export const DEFAULT_POPULATION_MIN = 500;

export default class Fetch extends ConfigCommand {
    static description = "Fetch all the dealerships";

    static examples = ["$ dealership-miner fetch"];

    static flags = {
        help: flags.help({ char: "h" }),
        population: flags.integer({
            char: "p",
            description:
                "Only include cities which has at least this many people",
            default: DEFAULT_POPULATION_MIN,
        }),
        refresh: flags.boolean({
            char: "r",
            description: "Delete all previous data and start fresh",
            default: false,
        }),
    };

    async doWork() {}
}
