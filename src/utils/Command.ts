import GrafSpee from "./GrafSpeeClient";
import { Message } from "eris";
import { Settings, CommandOptions } from "./Interfaces";

export default abstract class Command {
    public name: string;
    public options: CommandOptions;

    public constructor(name: string, options: CommandOptions) {
        this.name = name;

        /** If optional options are not set give them a default value */
        options.aliases ? options.aliases : [];
        options.guildOnly ? options.guildOnly : false;
        options.hidden ? options.hidden : false;
        options.ownerOnly ? options.ownerOnly : false;
        options.requiredArgs ? options.requiredArgs : 0;

        this.options = options;
    };

    public abstract async run(message: Message, args: string[], settings: Settings, client: GrafSpee): Promise<any>;
}
