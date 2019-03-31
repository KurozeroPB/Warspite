import axios, { AxiosResponse } from "axios";
import { Message, Settings, ErrorResponse, ShipResponse } from "../utils/Interfaces";
import Command from "../utils/Command";

export default class Ship extends Command {
    public constructor() {
        super("ship", {
            aliases: ["waifu"],
            description: "Get info about a ship",
            usage: "ship <name: string>",
            requiredArgs: 1,
            hidden: false,
            ownerOnly: false,
            guildOnly: false
        });
    }

    public async run(message: Message, args: string[], settings: Settings) {
        const name = args.join(" ");

        let response: AxiosResponse;
        try {
            response = await axios.get(`${settings.baseUrl}/ship?name=${name}`);
        } catch (error) {
            const data: ErrorResponse = error.response.data;
            if (data.statusCode === 500) {
                return await message.channel.createMessage(data.error ? data.error : data.message);
            } else {
                return await message.channel.createMessage(data.message);
            }
        }

        const data: ShipResponse = response.data;
        return await message.channel.createMessage({
            embed: {
                title: data.ship.names.full || "Unkown",
                color: settings.colors.default,
                thumbnail: { url: data.ship.thumbnail },
                fields: [
                    { name: "Construction time", value: data.ship.buildTime || "Unkown", inline: true },
                    { name: "Rarity", value: data.ship.rarity || "Unkown", inline: true },
                    { name: "Stars", value: data.ship.stars.value || "Unkown", inline: true },
                    { name: "Class", value: data.ship.class || "Unkown", inline: true },
                    { name: "Nationality", value: data.ship.nationality || "Unkown", inline: true },
                    { name: "Hull type", value: data.ship.hullType || "Unkown", inline: true }
                ],
                footer: {
                    text: `Version: ${settings.version}, ID: ${data.ship.id || "Unkown"}`
                }
            }
        });
    }
}