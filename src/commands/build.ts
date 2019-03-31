import axios, { AxiosResponse } from "axios";
import { Message, Settings, BuildResponse, ErrorResponse } from "../utils/Interfaces";
import Command from "../utils/Command";

export default class Build extends Command {
    public constructor() {
        super("build", {
            aliases: ["construction"],
            description: "Get ship names matching the construction time",
            usage: "build <time: string>",
            requiredArgs: 1,
            hidden: false,
            ownerOnly: false,
            guildOnly: false
        })
    }

    public async run(message: Message, args: string[], settings: Settings) {
        let time = args.join("");

        if (time.length === 6) {
            time = time.match(/.{1,2}/gui)!.join(":");
        }

        let response: AxiosResponse;
        try {
            response = await axios.get(`${settings.baseUrl}/build?time=${time}`);
        } catch (error) {
            const data: ErrorResponse = error.response.data;
            if (data.statusCode === 500) {
                return await message.channel.createMessage(data.error ? data.error : data.message);
            } else {
                return await message.channel.createMessage(data.message);
            }
        }

        const data: BuildResponse = response.data;
        return await message.channel.createMessage(`All ships for the construction time **${data.construction.time}**:\n${data.construction.ships.join(", ")}`);
    }
}