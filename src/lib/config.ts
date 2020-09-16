import { readJSON, outputJson } from "fs-extra";
import { join } from "path";
import Command from "@oclif/command";

import { Country, DEFAULT_COUNTRY } from "./model/region";

const CONFIG_FILE = "config.json";

export interface Config {
    isInitialized: boolean;
    cacheDir: string;
    dataDir: string;
    country: Country;
    googleApiKey: string | undefined;
    previousPopulation: number | undefined;
}

export function defaultConfig(command: Command): Config {
    return {
        isInitialized: false,
        cacheDir: command.config.cacheDir,
        dataDir: command.config.dataDir,
        country: DEFAULT_COUNTRY,
        googleApiKey: undefined,
        previousPopulation: undefined,
    };
}

export async function loadConfigOrDefault(command: Command): Promise<Config> {
    try {
        const configPath = join(command.config.configDir, CONFIG_FILE);
        const config = (await readJSON(configPath)) as Config;
        return config;
    } catch (error) {
        return defaultConfig(command);
    }
}

export async function saveConfig(command: Command, config: Config) {
    const configPath = join(command.config.configDir, CONFIG_FILE);
    await outputJson(configPath, config, { spaces: 2 });
}
