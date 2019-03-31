import Warspite from "./WarspiteClient";

export { Message, Collection } from "eris";

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
};

export interface HandlerOptions {
    settings: Settings;
    warspite: Warspite;
};

export interface CommandOptions {
    aliases: string[];
    description: string;
    usage: string;
    requiredArgs: number;
    hidden: boolean;
    ownerOnly: boolean;
    guildOnly: boolean;
};

interface Names {
    full: string | null;
    en: string | null;
    cn: string | null;
    jp: string | null;
}

interface Skins {
    title: string | null;
    image: string | null;
}

interface Stars {
    value: string | null;
    count: number;
}

interface Ship {
    id: string | null;
    names: Names;
    thumbnail: string;
    skins: Skins;
    buildTime: string | null;
    rarity: string | null;
    stars: Stars;
    class: string | null;
    nationality: string | null;
    hullType: string | null;
}

interface Construction {
    time: string;
    ships: string[];
}

interface BaseResponse {
    statusCode: number;
    statusMessage: string;
    message: string;
}

export interface ShipResponse extends BaseResponse {
    ship: Ship;
}

export interface BuildResponse extends BaseResponse {
    construction: Construction;
}

export interface ErrorResponse extends BaseResponse {
    error?: string | undefined;
}