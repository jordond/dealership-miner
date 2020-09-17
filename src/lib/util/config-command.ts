import Command from "@oclif/command";
import * as mkdirp from "mkdirp";
import { cli } from "cli-ux";
import * as inquirer from "inquirer";

import {
    Config,
    defaultConfig,
    loadConfigOrDefault,
    saveConfig,
} from "../config";

export const DEFAULT_WORKERS = 6;

export abstract class ConfigCommand extends Command {
    app: Config = defaultConfig(this);

    get isInitalized(): boolean {
        return this.app.isInitialized && Boolean(this.app.googleApiKey);
    }

    get apiKey(): string {
        if (!this.app.googleApiKey) {
            throw new Error("Google Places API key doesn't exist!");
        }

        return this.app.googleApiKey;
    }

    async run() {
        this.app = await loadConfigOrDefault(this);
        await this.doWork();
        this.exit(0);
    }

    abstract doWork(): PromiseLike<any>;

    async save(log = true) {
        if (log) cli.action.start("Saving config!");
        await saveConfig(this, this.app);
        if (log) cli.action.stop();
    }

    async ensureConfigDirectories() {
        await Promise.all([
            mkdirp(this.app.cacheDir),
            mkdirp(this.app.dataDir),
        ]);
    }

    async confirm(message: string, defaultValue = false): Promise<boolean> {
        const { confirm } = await inquirer.prompt({
            message,
            default: defaultValue,
            type: "confirm",
            name: "confirm",
        });

        return confirm;
    }
}
