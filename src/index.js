const Eris = require("eris");
const path = require("path");
const tsubaki = require("tsubaki");
const fs = tsubaki.promisifyAll(require("fs"));

const Command = require("./Command");
const settings = require("../settings");
const utils = require("./utils");

const baseUrl = "https://azurlane.koumakan.jp";
const urlRegex = /[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/giu;
const prefix = settings.env === "production" ? settings.prefix.production : settings.prefix.development;
const token = settings.env === "production" ? settings.tokens.productions : settings.tokens.development;

let ready = false;
let commands = new Eris.Collection(Command);

// Create the main client
const client = new Eris.Client(token, {
    getAllUsers: true,
    defaultImageFormat: "png",
    defaultImageSize: 1024
});

const initCommands = async () => {
    const cmdDir = await fs.readdirAsync(path.join(__dirname, "commands"));
    for (let i = 0; i < cmdDir.length; i++) {
        const file = cmdDir[i];
        if (file.endsWith(".js")) {
            const command = new (require(`./commands/${file}`))();
            commands.add(command);
        }
    }
};

/**
 * Main function to handle all commands
 * @param {Eris.Message} msg
 * @param {boolean} dm
 */
const handleCommand = async (msg, dm) => {
    const parts = msg.content.split(" ");
    const name = parts[0].slice(prefix.length);

    const command = commands.find((cmd) => cmd.name === name || cmd.aliases.indexOf(name) !== -1);
    if (!command) return false; // Command doesn't exist

    const args = parts.splice(1);
    const context = {
        settings,
        prefix,
        baseUrl,
        commands
    };

    // Let the user know the command can only be run in a guild
    if (command.guildOnly && dm) {
        try {
            await msg.channel.createMessage(`The command \`${command}\` can only be run in a guild.`);
        } catch (e) { return false; }
        return false;
    }

    // Check command args count
    if (command.requiredArgs > args.length) {
        try {
            await msg.channel.createMessage(`This command requires atleast ${command.requiredArgs} arguments`);
        } catch (e) { return false; }
        return false;
    }

    // Check if command is owner only
    if (command.ownerOnly && msg.author.id !== settings.owner) {
        try {
            await msg.channel.createMessage("Only the owner can execute this command.");
        } catch (e) { return false; }
        return false;
    }

    // Only check for permission if the command is used in a guild
    if (msg.channel.guild) {
        const botPermissions = command.botPermissions;
        if (botPermissions.length > 0) {
            const member = msg.channel.guild.members.get(client.user.id);
            let missingPermissions = [];
            for (let i = 0; i < botPermissions.length; i++) {
                const hasPermission = member.permission.has(botPermissions[i]);
                if (hasPermission === false) {
                    missingPermissions.push(`**${botPermissions[i]}**`);
                }
            }

            if (missingPermissions.length > 0) {
                try {
                    await msg.channel.createMessage(`The bot is missing these required permissions: ${missingPermissions.join(", ")}`);
                } catch (e) { return false; }
                return false;
            }
        }

        const userPermissions = command.userPermissions;
        if (userPermissions.length > 0) {
            const member = msg.channel.guild.members.get(msg.author.id);
            let missingPermissions = [];
            for (let i = 0; i < userPermissions.length; i++) {
                const hasPermission = member.permission.has(userPermissions[i]);
                if (hasPermission === false) {
                    missingPermissions.push(`**${userPermissions[i]}**`);
                }
            }

            if (missingPermissions.length > 0) {
                await msg.channel.createMessage(`You are missing these required permissions: ${missingPermissions.join(", ")}`);
                return false;
            }
        }
    }

    try {
        await command.run(msg, args, client, context);
        return true;
    } catch (error) {
        try {
            await msg.channel.createMessage({
                embed: {
                    color: 0xDC143C,
                    description: error.toString()
                }
            });
        } catch (e) { return false; }
        return false;
    }
};

client.on("messageCreate", async (msg) => {
    if (!ready) return; // Bot not ready yet
    if (!msg.author) return; // Probably system message
    if (msg.author.discriminator === "0000") return; // Probably a webhook

    if (msg.content.startsWith(prefix)) {
        if (!msg.channel.guild && msg.author.id !== client.user.id) {
            await handleCommand(msg, true);
        } else if (msg.channel.guild) {
            await handleCommand(msg, false);
        }
    }
});

/* Specific for my own guild */
client.on("guildMemberAdd", async (guild, member) => {
    try {
        if (guild.id === "240059867744698368") {
            const hasUrlUsername = member.username.match(urlRegex);
            if (hasUrlUsername) {
                await member.ban(7, "[auto detected] Advertisement in username");
                await utils.sleep(1000);
                const channel = guild.channels.get("257307075460202497");
                const messages = await channel.getMessages();
                const lastMessage = messages.find((message) => message.id === channel.lastMessageID);
                await lastMessage.delete("[auto detected] Advertisement in username");
            } else {
                await member.addRole("304266397947789322", "New member");
            }
        }
    } catch (e) {
        console.warn("Oopsie an error was thrown, but who gives a shit.");
    }
});

client
    .on("error", console.error)
    .on("warn", console.warn)
    .on("ready", async () => {
        try {
            await initCommands();
            console.log("Finished initializing commands");
        } catch (error) {
            console.error(`Failed to initialize commands\n${error.stack}`);
            process.exit(0);
            return null;
        }
        console.log(`Logged in as: ${client.user.username}`);
        ready = true;
    });

process.on("uncaughtException", (e) => console.error(e));
process.on("unhandledRejection", (e) => console.error(e));

process.on("SIGINT", () => {
    client.disconnect({ reconnect: false });
    process.exit(0);
    setTimeout(() => process.exit(0), 5000);
});

// Connect to the Discord websocket
client.connect().catch(console.error);
