import { flags } from "@oclif/command";
import cli from "cli-ux";
import { pathExists } from "fs-extra";
import { resolve } from "path";

import { ConfigCommand } from "../lib/util/config-command";
import { fetchDataset, createDatasetPath } from "../lib/util/dataset";

export default class Init extends ConfigCommand {
    static description = "Initial config of the dataminer";

    static examples = [
        "$ dealership-miner init",
        "$ dealership-miner init --data /home/foo/data",
        "$ dealership-miner init --force",
    ];

    static flags = {
        help: flags.help({ char: "h" }),
        data: flags.string({
            char: "d",
            description: "Directory to save required files.",
        }),
        cache: flags.string({
            char: "c",
            description: "Directory to save temporary files.",
        }),
        force: flags.boolean({
            char: "f",
            description: "Force setup",
            default: false,
        }),
    };

    async doWork() {
        const { flags } = this.parse(Init);

        // Get and create the folders
        this.app.cacheDir = await this.getCacheDir();
        this.app.dataDir = await this.getDataDir();
        await this.ensureConfigDirectories();

        // Check for existing dataset
        const datasetPath = createDatasetPath(this);
        const datasetExists = await pathExists(datasetPath);
        if (flags.force || !datasetExists) {
            await fetchDataset(this, datasetPath);
        } else if (!flags.force && datasetExists) {
            this.log(
                `Dataset for ${this.app.country} already exists, confirm or pass '--force'.`
            );
            const confirm = await this.confirm("Update it?");
            if (confirm) await fetchDataset(this, datasetPath);
        }

        // Get the Google API key
        if (this.app.googleApiKey) {
            this.log(
                `Google API key is already set to: ${this.app.googleApiKey}`
            );
            const confirm = await this.confirm("Update it?");
            if (confirm) await this.getGoogleApiKey();
        } else {
            await this.getGoogleApiKey();
        }

        // Save config
        await this.save();

        this.log("Finished the setup, you can run");
    }

    private async getCacheDir() {
        const cacheFlag = this.parse(Init).flags.cache;
        if (cacheFlag) return resolve(cacheFlag);

        const defaultCache = this.app.cacheDir;
        const cacheDir = await cli.prompt(
            "Where should I store temporary files?",
            { default: defaultCache }
        );
        return resolve(cacheDir);
    }

    private async getDataDir() {
        const dataFlag = this.parse(Init).flags.data;
        if (dataFlag) return resolve(dataFlag);

        const defaultData = this.app.dataDir;
        const dataDir = await cli.prompt("Where should I store data files?", {
            default: defaultData,
        });
        return resolve(dataDir);
    }

    private async getGoogleApiKey() {
        const currentKey = this.app.googleApiKey;
        const result = await cli.prompt("What is your Places API key?", {
            default: currentKey,
        });
        this.app.googleApiKey = result;
    }
}
