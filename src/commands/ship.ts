import Command from "../utils/Command";
import GrafSpee from "../utils/GrafSpeeClient";
import { Settings } from "../utils/Interfaces";
import { Message, PrivateChannel } from "eris";

export default class Ship extends Command {
    public constructor() {
        super("ship", {
            description: "Get info about a ship",
            usage: "ship <name: string>",
            aliases: ["waifu"],
            requiredArgs: 1
        });
    }

    public async run(message: Message, args: string[], settings: Settings, client: GrafSpee) {
        const name = args.join(" ");
        try {
            const data = await client.azurlane.ship(name);
            await message.channel.createMessage({
                embed: {
                    title: data.names.full || "Unkown",
                    color: client.embedColor((message.channel instanceof PrivateChannel) ? undefined : message.channel.guild),
                    thumbnail: { url: data.thumbnail },
                    fields: [
                        { name: "Construction time", value: data.buildTime || "Unkown", inline: true },
                        { name: "Rarity", value: data.rarity || "Unkown", inline: true },
                        { name: "Stars", value: data.stars.value || "Unkown", inline: true },
                        { name: "Class", value: data.class || "Unkown", inline: true },
                        { name: "Nationality", value: data.nationality || "Unkown", inline: true },
                        { name: "Hull type", value: data.hullType || "Unkown", inline: true }
                    ],
                    footer: {
                        text: `Version: ${settings.version}, ID: ${data.id || "Unkown"}`
                    }
                }
            });
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
            client.logger.error("COMMAND:SHIP", error.message ? error.message : error.toString());
        }
    }
}
