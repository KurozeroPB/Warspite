import Warspite from "./WarspiteClient";
import { Settings, CommandOptions, Message } from "./Interfaces";

export default class Command {
    public id: string;
    public name: string;
    public options: CommandOptions;

    public constructor(name: string, options: CommandOptions) {
        this.id = name;
        this.name = name;
        this.options = options;
    }

    // @ts-ignore
    public async run(message: Message, args: string[], settings: Settings, client: Warspite): Promise<any>;
}
