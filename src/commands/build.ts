import Command from "../utils/Command";
import GrafSpee from "../utils/GrafSpeeClient";
import { Message } from "eris";
import { Settings } from "../utils/Interfaces";

export default class Build extends Command {
    public constructor() {
        super("build", {
            description: "Get ship names matching the construction time",
            usage: "build <time: string>",
            aliases: ["construction"],
            requiredArgs: 1
        })
    }

    public async run(message: Message, args: string[], settings: Settings, { azurlane, logger }: GrafSpee): Promise<void> {
        let time = args.join("");
        if (time.length === 6) {
            time = time.match(/.{1,2}/gui)!.join(":");
        }

        try {
            const data = await azurlane.getBuildInfo(time);
            await message.channel.createMessage(`All ships for the construction time **${data.time}**:\n${data.ships.join(", ")}`);
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
            logger.error("COMMAND:BUILD", error.message ? error.message : error.toString());
        }
    }
}
