import Warspite from "./WarspiteClient";
import { promises as fs } from "fs";
import { Settings, HandlerOptions, Message } from "./Interfaces";
import { GuildChannel } from "eris";

export default class CommandHandler {
    public settings: Settings;
    public warspite: Warspite;

    /**
     * Command handler constructor
     * 
     * @param {HandlerOptions} options Options for the command handler
     */
    public constructor(options: HandlerOptions) {
        this.settings = options.settings;
        this.warspite = options.warspite;
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
        const name = parts[0].slice(this.warspite.prefix.length);
        const args = parts.splice(1);

        const command = this.warspite.commands.find((cmd) => cmd.name === name || cmd.options.aliases.indexOf(name) !== -1);
        if (!command) return false; // Command doesn't exist

        if (command.options.guildOnly && dm) {
            await message.channel.createMessage(`The command \`${command}\` can only be run in a guild.`);
            return false;
        }

        if (command.options.ownerOnly && message.author.id !== this.settings.owner) {
            await message.channel.createMessage("Only the owner can execute this command.");
            return false;
        }

        if (command.options.requiredArgs > args.length) {
            await message.channel.createMessage(`Invalid argument count, check \`${this.settings.prefix}help ${command.name}\` to see how this command works.`);
            return false;
        }

        if (!dm && message.channel.type === 0) {
            const channel = message.channel as GuildChannel;
            const member = channel.guild.members.get(this.warspite.user.id);
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
            await command.run(message, args, this.settings, this.warspite);
            return true;
        } catch (error) {
            await message.channel.createMessage({
                embed: {
                    color: 0xDC143C,
                    description: error.toString()
                }
            });
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
            const command = new cmd.default();

            if (this.warspite.commands.has(command.name)) {
                this.warspite.logger.warn("CommandHandler", `A command with the name ${command.name} already exists and has been skipped`);
            } else {
                this.warspite.commands.add(command);
            }
        } catch (e) {
            this.warspite.logger.warn("CommandHandler", `${commandPath} - ${e.stack ? e.stack : e.toString()}`);
        }
    }
}