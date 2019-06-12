import Command from "../utils/Command";
import GrafSpee from "../utils/GrafSpeeClient";
import { Message } from "eris";
import { Settings } from "../utils/Interfaces";

export default class Eval extends Command {
    public constructor() {
        super("eval", {
            description: "Evaluate javascript code",
            usage: "eval <code: string>",
            requiredArgs: 1,
            hidden: true,
            ownerOnly: true
        });
    }

    public async run(message: Message, _args: string[], settings: Settings, { logger, prefix }: GrafSpee) {
        try {
            logger.info("EVAL", `${message.author.username}: ${message.content}`);

            let toEval = message.content.replace(`${prefix}eval`, "").trim();
            let result = "~eval failed~";
            try {
                result = await eval(toEval);
                result = result
                    ? result.toString()
                        .replace(new RegExp(`${settings.tokens.production}`, "gui"), "<token-redacted>")
                        .replace(new RegExp(`${settings.tokens.development}`, "gui"), "<token-redacted>")
                    : "Empty Result";
            } catch (error) {
                logger.error("EVAL FAILED", error.message ? error.message : error.toString());
                message.channel.createMessage(`\`\`\`diff\n- ${error}\`\`\``);
                return null;
            }

            if (result !== "~eval failed~") {
                logger.info("EVAL RESULT", result);
                message.channel.createMessage(`__**Result:**__ \n${result}`);
            }
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
            logger.error("COMMAND:EVAL", error.message ? error.message : error.toString());
        }
    }
}
