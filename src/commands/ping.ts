import Command from "../utils/Command";
import GrafSpee from "../utils/GrafSpeeClient";
import { Message } from "eris";
import { Settings } from "../utils/Interfaces";

export default class Ping extends Command {
    public constructor() {
        super("ping", {
            description: "Testing the bot",
            usage: "ping",
            aliases: ["pong"]
        })
    }

    public async run(message: Message, _args: string[], settings: Settings, { logger }: GrafSpee) {
        try {
            await message.channel.createMessage("Pong!");
        } catch (error) {
            message.channel.createMessage({
                content: "An error occured, please try again later.",
                embed: {
                    color: settings.colors.error,
                    description: error.message ? error.message : error.toString(),
                    footer: {
                        text: "join the support server for more help https://discord.gg/p895czC"
                    }
                }
            }).catch(() => null);
            logger.error("COMMAND:PING", error.message ? error.message : error.toString());
        }
    }
}
