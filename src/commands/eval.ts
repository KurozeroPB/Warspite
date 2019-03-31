import { Message, Settings } from "../utils/Interfaces";
import Command from "../utils/Command";
import Warspite from "../utils/WarspiteClient";

export default class Eval extends Command {
    public constructor() {
        super("eval", {
            aliases: [],
            description: "Evaluate javascript code",
            usage: "eval <code: string>",
            requiredArgs: 1,
            hidden: true,
            ownerOnly: true,
            guildOnly: false
        });
    }

    public async run(message: Message, _args: string[], settings: Settings, warspite: Warspite) {
        warspite.logger.info("EVAL", `${message.author.username}: ${message.content}`);

        let toEval = message.content.replace(`${warspite.prefix}eval`, "").trim();
        let result = "~eval failed~";
        try {
            result = await eval(toEval);
            result = result
                ? result.toString()
                    .replace(new RegExp(`${settings.tokens.production}`, "gui"), "<token-redacted>")
                    .replace(new RegExp(`${settings.tokens.development}`, "gui"), "<token-redacted>")
                : "Empty Result";
        } catch (error) {
            warspite.logger.error("EVAL FAILED", error.message ? error.message : error.toString());
            message.channel.createMessage(`\`\`\`diff\n- ${error}\`\`\``);
            return null;
        }

        if (result !== "~eval failed~") {
            warspite.logger.info("EVAL RESULT", result);
            message.channel.createMessage(`__**Result:**__ \n${result}`);
        }
    }
}