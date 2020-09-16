import { flags } from "@oclif/command";

import { ConfigCommand } from "../lib/util/config-command";
import { fetchDataset } from "../lib/util/dataset";

export default class UpdateDataset extends ConfigCommand {
    static description = "Force an update of the dataset";

    static examples = [
        "$ dealership-miner update-dataset",
        "$ dealership-miner update-dataset --prety",
    ];

    static flags = {
        pretty: flags.boolean({
            description:
                "Output human readable city data. NOTE: This will increase filesize.",
            default: false,
        }),
    };

    async doWork() {
        if (!this.isInitalized) {
            return this.error(
                "App has not been initialized, call `dealership-dataminer init`"
            );
        }

        const { pretty } = this.parse(UpdateDataset).flags;

        this.log(`Forcing an update of the ${this.app.country} dataset!\n`);
        await fetchDataset(this, { prettyPrintData: pretty });
    }
}
