import GrafSpee from "./GrafSpeeClient";
import { promises as fs } from "fs";
import { Settings, HandlerOptions } from "./Interfaces";
import { GuildChannel, Message } from "eris";
import Command from "./Command";

export default class CommandHandler {
    public settings: Settings;
    public client: GrafSpee;

    /**
     * Command handler constructor
     *
     * @param {HandlerOptions} options Options for the command handler
     */
    public constructor(options: HandlerOptions) {
        this.settings = options.settings;
        this.client = options.client;
    }

    /**
     * Handle all commands
     *
     * @param {Message} message The message send by the user
     * @param {boolean} dm Whether the command was used in a dm
     *
     * @returns {Promise<boolean>} Will be true if successful else false
     */
    public async handleCommand(message: Message, dm: boolean): Promise<boolean> {
        const parts = message.content.split(" ");
        const name = parts[0].slice(this.client.prefix.length);
        const args = parts.splice(1);

        const command = this.client.commands.find((cmd) => cmd.name === name || (cmd.options.aliases !== undefined && cmd.options.aliases.indexOf(name) !== -1));
        if (!command) return false; // Command doesn't exist

        if (command.options.guildOnly && dm) {
            await message.channel.createMessage(`The command \`${command}\` can only be run in a guild.`);
            return false;
        }

        if (command.options.ownerOnly && message.author.id !== this.settings.owner) {
            await message.channel.createMessage("Only the owner can execute this command.");
            return false;
        }

        const requiredArgs = command.options.requiredArgs;
        if (requiredArgs !== undefined && requiredArgs > args.length) {
            await message.channel.createMessage(`Invalid argument count, check \`${this.client.prefix}help ${command.name}\` to see how this command works.`);
            return false;
        }

        if (!dm && message.channel.type === 0) {
            const channel = message.channel as GuildChannel;
            const member = channel.guild.members.get(this.client.user.id);
            if (!member) return false;

            let missingPermissions: string[] = [];
            for (let i = 0; i < this.settings.requiredPermissions.length; i++) {
                const hasPermission = member.permission.has(this.settings.requiredPermissions[i]);
                if (hasPermission === false) {
                    missingPermissions.push(`**${this.settings.requiredPermissions[i]}**`);
                }
            }

            if (missingPermissions.length > 0) {
                await message.channel.createMessage(`The bot is missing these required permissions: ${missingPermissions.join(", ")}`);
                return false;
            }
        }

        try {
            await command.run(message, args, this.settings, this.client);
            return true;
        } catch (error) {
            message.channel.createMessage({
                content: "An error occured, please try again later.",
                embed: {
                    color: 0xDC143C,
                    description: error.message ? error.message : error.toString(),
                    footer: {
                        text: "join the support server for more help https://discord.gg/p895czC"
                    }
                }
            }).catch(() => null);
            return false;
        }
    }

    /**
     * Load all commands
     *
     * @param {string} commandDir The directory with all the commands
     *
     * @returns {Promise<void>}
     */
    public async loadCommands(commandDir: string): Promise<void> {
        const files = await fs.readdir(commandDir);

        for (const file of files) {
            // ts when testing, js when compiled
            if (file.endsWith(".ts") || file.endsWith(".js")) {
                await this._add(`${commandDir}/${file}`);
            }
        }
    }

    private async _add(commandPath: string): Promise<void> {
        try {
            const cmd = await import(commandPath);
            const command: Command = new cmd.default();

            if (this.client.commands.has(command.name)) {
                this.client.logger.warn("CommandHandler", `A command with the name ${command.name} already exists and has been skipped`);
            } else {
                this.client.commands.set(command.name, command);
            }
        } catch (e) {
            this.client.logger.warn("CommandHandler", `${commandPath} - ${e.stack ? e.stack : e.toString()}`);
        }
    }
}
