import Command from "../utils/Command";
import GrafSpee from "../utils/GrafSpeeClient";
import { Message } from "eris";
import { Settings } from "../utils/Interfaces";

export default class Shared extends Command {
    public constructor() {
        super("shared", {
            description: "Check for shared servers",
            usage: "shared"
        })
    }

    public async run(message: Message, _args: string[], settings: Settings, client: GrafSpee) {
        try {
            const guilds = client.guilds.filter((g) => g.members.has(message.author.id));
            await message.channel.createMessage(guilds.map((g) => `**${g.name}** (ID: ${g.id})`).join("\n"));
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
            client.logger.error("COMMAND:SHARED", error.message ? error.message : error.toString());
        }
    }
}
