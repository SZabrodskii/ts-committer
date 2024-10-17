import * as fs from "fs";
import * as path from "path";

export type WeekendConfig = {
    minCommits: number;
    maxCommits: number;
};

export type Config = {
    minCommits: number;
    maxCommits: number;
    days: number;
    includeWeekends: boolean;
    weekendCommits?: WeekendConfig;
    repoUrl: string;
    commitTemplate: string;
};

function validateConfig(config: Config): void {
    if (typeof config.minCommits !== 'number' || config.minCommits < 1) {
        throw new Error('Invalid minCommits: should be a number and >= 1');
    }
    if (typeof config.maxCommits !== 'number' || config.maxCommits < config.minCommits) {
        throw new Error('Invalid maxCommits: should be a number and >= minCommits');
    }
    if (typeof config.days !== 'number' || config.days < 1) {
        throw new Error('Invalid days: should be a number and >= 1');
    }
    if (typeof config.includeWeekends !== 'boolean') {
        throw new Error('Invalid includeWeekends: should be a boolean');
    }
    if (config.includeWeekends && config.weekendCommits) {
        const { minCommits, maxCommits } = config.weekendCommits;
        if (typeof minCommits !== 'number' || minCommits < 1) {
            throw new Error('Invalid weekend minCommits: should be a number and >= 1');
        }
        if (typeof maxCommits !== 'number' || maxCommits < minCommits) {
            throw new Error('Invalid weekend maxCommits: should be a number and >= minCommits');
        }
    }
    if (typeof config.repoUrl !== 'string' || !config.repoUrl.startsWith('http')) {
        throw new Error('Invalid repoUrl: should be a valid URL string');
    }
    if (typeof config.commitTemplate !== 'string') {
        throw new Error('Invalid commitTemplate: should be a string');
    }
}


export function LoadConfig(): Config {
    try {
        const rawConfig = fs.readFileSync(path.resolve(__dirname, 'config.json'), 'utf-8');
        const parsedConfig = JSON.parse(rawConfig);
        validateConfig(parsedConfig);
        return parsedConfig;
    } catch (error) {
        throw new Error(`Failed to load config: ${error}`);
    }
}