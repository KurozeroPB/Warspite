import Command from "../utils/Command";
import { Message } from "../utils/Interfaces";

export default class Ping extends Command {
    public constructor() {
        super("ping", {
            aliases: ["pong"],
            description: "Testing the bot",
            usage: "ping",
            requiredArgs: 0,
            hidden: false,
            ownerOnly: false,
            guildOnly: false
        })
    }

    public async run(message: Message) {
        await message.channel.createMessage("Pong!");
    }
}