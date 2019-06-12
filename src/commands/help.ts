import Command from "../utils/Command";
import GrafSpee from "../utils/GrafSpeeClient";
import { Message } from "eris";
import { Settings } from "../utils/Interfaces";
import { capitalize } from "../utils/Helpers";

export default class Help extends Command {
    public constructor() {
        super("help", {
            description: "Show help about commands",
            usage: "help [command: string]"
        });
    }

    public async run(message: Message, args: string[], settings: Settings, client: GrafSpee) {
        try {
            if (args.length === 0) {
                let messageQueue: string[] = [];
                let currentMessage = `\n# Here's a list of my commands. For more info do: ${client.prefix}help <command>\n# Prefix: ${client.prefix}\n`;
                client.commands.forEach((command) => {
                    if (command.options.hidden === true) return; // Command is hidden
                    if (command.options.ownerOnly && message.author.id !== settings.owner) return; // Command can only be viewed by the owner

                    let toAdd = `@${command.name}\n` +
                        `   "${command.options.description}"\n`;
                    if (currentMessage.length + toAdd.length >= 1900) { // If too long push to queue and reset it.
                        messageQueue.push(currentMessage);
                        currentMessage = "";
                    }
                    currentMessage += `\n${toAdd}`;
                });
                messageQueue.push(currentMessage);
                message.channel.addMessageReaction(message.id, "✅");
                const dm = await client.getDMChannel(message.author.id);
                let sendInOrder = setInterval(async () => {
                    if (messageQueue.length > 0) {
                        await dm.createMessage(`\`\`\`py${messageQueue.shift()}\`\`\``); // If still messages queued send the next one.
                    } else {
                        clearInterval(sendInOrder);
                    }
                }, 300);
            } else {
                const command = this.checkForMatch(args[0], client);
                if (!command) return await message.channel.createMessage(`No command found with the name or alias \`${args[0]}\``);
                if (command.options.hidden === true) return; // Command is hidden
                if (command.options.ownerOnly && message.author.id !== settings.owner)
                    return await message.channel.createMessage("This command can only be viewed and used by the owner.");


                const helpMessage = "```asciidoc\n" +
                    `[${capitalize(command.name)}]\n\n` +
                    `= ${command.options.description} =\n\n` +
                    `Aliases            ::  ${command.options.aliases!.join(", ")}\n` +
                    `Usage              ::  ${client.prefix}${command.options.usage}\n` +
                    `Guild Only         ::  ${command.options.guildOnly ? "yes" : "no"}\n` +
                    `Owner Only         ::  ${command.options.ownerOnly ? "yes" : "no"}\n` +
                    `Required Args      ::  ${command.options.requiredArgs}\n\n` +
                    "<> = required\n" +
                    "[] = optional\n" +
                    "```";
                await message.channel.createMessage(helpMessage);
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
            client.logger.error("COMMAND:HELP", error.message ? error.message : error.toString());
        }
    }

    checkForMatch(name: string, client: GrafSpee): Command | undefined {
        if (name.startsWith(client.prefix)) {
            name = name.substr(1);
        }
        return client.commands.find((cmd) => cmd.name === name || (cmd.options.aliases !== undefined && cmd.options.aliases.indexOf(name) !== -1));
    }
}
