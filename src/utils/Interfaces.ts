import GrafSpee from "./GrafSpeeClient";

interface Tokens {
    production: string;
    development: string;
}

interface Prefix {
    production: string;
    development: string;
}

interface Colors {
    default: number;
    error: number;
}

export interface Settings {
    version: string;
    env: string,
    tokens: Tokens;
    owner: string;
    prefix: Prefix;
    baseUrl: string;
    colors: Colors;
    requiredPermissions: string[];
}

export interface HandlerOptions {
    settings: Settings;
    client: GrafSpee;
}

export interface CommandOptions {
    description: string;
    usage: string;
    aliases?: string[];
    requiredArgs?: number;
    hidden?: boolean;
    ownerOnly?: boolean;
    guildOnly?: boolean;
}
