import { readJSON, outputJson } from "fs-extra";
import { join } from "path";
import Command from "@oclif/command";

import { Country, Regions, DEFAULT_COUNTRY, ALL_REGIONS } from "./model/region";

const CONFIG_FILE = "config.json";

export interface Config {
    isInitialized: boolean;
    cacheDir: string;
    dataDir: string;
    country: Country;
    regions: Regions[];
    googleApiKey: string | undefined;
}

export function defaultConfig(command: Command): Config {
    return {
        isInitialized: false,
        cacheDir: command.config.cacheDir,
        dataDir: command.config.dataDir,
        country: DEFAULT_COUNTRY,
        regions: ALL_REGIONS,
        googleApiKey: undefined,
    };
}

export async function loadConfigOrDefault(command: Command): Promise<Config> {
    try {
        const configPath = join(command.config.configDir, CONFIG_FILE);
        const config = (await readJSON(configPath)) as Config;
        config.isInitialized = true;
        return config;
    } catch (error) {
        return defaultConfig(command);
    }
}

export async function saveConfig(command: Command, config: Config) {
    const configPath = join(command.config.configDir, CONFIG_FILE);
    await outputJson(configPath, config, { spaces: 2 });
}
