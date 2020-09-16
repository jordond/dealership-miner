import { ConfigCommand } from "../lib/util/config-command";
import { fetchDataset } from "../lib/util/dataset";

export default class UpdateDataset extends ConfigCommand {
    static description = "Force an update of the dataset";

    static examples = ["$ dealership-miner update"];

    async doWork() {
        if (!this.isInitalized) {
            return this.error(
                "App has not been initialized, call `dealership-dataminer init`"
            );
        }

        this.log(`Forcing an update of the ${this.app.country} dataset!\n`);
        await fetchDataset(this);
    }
}
