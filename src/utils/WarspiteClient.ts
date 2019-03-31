import { Client, ClientOptions, Collection } from "eris";
import Command from "./Command";
import Logger from "./Logger";
import settings from "../../settings";

export default class Warspite extends Client {
    public commands: Collection<Command> = new Collection(Command);
    public logger: Logger;
    public prefix: string;

    public constructor(token: string, options?: ClientOptions) {
        super(token, options);

        this.logger = new Logger();
        this.prefix = settings.env === "production" ? settings.prefix.production : settings.prefix.development
    }
}