import ts from "typescript";
import util from "util";
import Command from "../utils/Command";
import GrafSpee from "../utils/GrafSpeeClient";
import * as helpers from "../utils/Helpers";
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

    public async run(msg: Message, args: string[], settings: Settings, client: GrafSpee) {
        const prefix = settings.env === "production" ? settings.prefix.production : settings.prefix.development;
        let isTypescript = false;
        let content = msg.content
            .replace(`${prefix}eval`, "")
            .replace(/^\s+/, "")
            .replace(/\s*$/, "");
        
        if (content.startsWith("```") && content.endsWith("```")) {
            content = content.substring(3, content.length - 3);
            if (content.startsWith("ts")) {
                isTypescript = true;
                content = content.substr(2);
            } else if (content.startsWith("js")) {
                content = content.substr(2);
            }
        }

        const utils = helpers;
        const console: any = {
            _lines: [],
            _logger(...things: any[]) {
                this._lines.push(...things.join(" ").split("\n"));
            },
            _formatLines() {
                return this._lines.map((line: any) => line && `//> ${line}\n`).join("");
            },
        };
        console.log = console.error = console.warn = console.info = console._logger.bind(console);
        const compilerOptions: ts.CompilerOptions = {
            "baseUrl": ".",
            "module": ts.ModuleKind.CommonJS,
            "strict": false,
            "esModuleInterop": true,
            "target": ts.ScriptTarget.ESNext,
            "noImplicitAny": true,
            "moduleResolution": ts.ModuleResolutionKind.NodeJs,
            "sourceMap": false,
            "noImplicitReturns": false,
            "resolveJsonModule": true,
            "declaration": false,
            "outDir": "build",
            "typeRoots": [
                "src/@types"
            ]
        };

        let result;
        try {
            if (isTypescript) {
                content = ts.transpile(content, compilerOptions);
            }
            result = eval(content);
        } catch (error) {
            result = error;
        }
        const message = `\`\`\`js\n${console._formatLines()}${util.inspect(result, { depth: 1 })}\n\`\`\``;

        let outputMsg;
        try {
            outputMsg = await msg.channel.createMessage(message);
        } catch (error) {
            msg.channel.createMessage(`\`\`\`diff\n- ${error}\`\`\``).catch(() => {});
            return;
        }

        if (result && typeof result.then === "function") {
            let value;
            try {
                value = util.inspect(await result, { depth: 1 });
            } catch (err) {
                value = err;
            }
            
            const newContent = outputMsg.content.split('\n');
            newContent.splice(-1, 0, "// Resolved to:", value);
            try {
                await outputMsg.edit(newContent.join('\n'));
            } catch (_) {
                newContent.splice(-2, 1, "(content too long)");
                outputMsg.edit(newContent.join('\n')).catch(() => {});
            }
        }
    }
}
