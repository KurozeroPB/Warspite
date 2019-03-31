import { Message, TextChannel, GuildChannel, TextableChannel } from "eris";
import { sleep } from "./utils/Helpers";
import Warspite from "./utils/WarspiteClient";
import CommandHandler from "./utils/CommandHandler";
import settings from "../settings";

let ready = false;

const warspite = new Warspite(settings.env === "production" ? settings.tokens.production : settings.tokens.development, {
    getAllUsers: true,
    defaultImageFormat: "png",
    defaultImageSize: 1024
});
const commandHandler = new CommandHandler({ settings, warspite });
const logger = warspite.logger;
const urlRegex = /[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gui;

warspite.on("messageCreate", async (message: Message) => {
    if (!ready) return; // Bot is not ready yet
    if (!message.author) return; // System message
    if (message.author.discriminator === "0000") return; // Webhook message

    if (message.content.startsWith(warspite.prefix)) {
        try {
            if (message.channel.type === 1 && message.author.id !== warspite.user.id) {
                await commandHandler.handleCommand(message, true);
            } else if (message.channel.type !== 1) {
                await commandHandler.handleCommand(message, false);
            }
        } catch (error) {
            try {
                await message.channel.createMessage({
                    embed: {
                        color: 0xDC143C,
                        description: error.toString()
                    }
                });
            } catch(e) {
                return; // 99% sure missing the sendMessage or embedLinks permission
            }
        }
    }
});

/* Specific for my own guild */
warspite.on("guildMemberAdd", async (guild, member) => {
    try {
        if (guild.id === "240059867744698368") {
            const hasUrlUsername = member.username.match(urlRegex);
            if (hasUrlUsername) {
                await member.ban(7, "[auto detected] Advertisement in username");
                await sleep(1000);

                const channel = guild.channels.get("257307075460202497");
                if (!channel) return;
                if (channel.type === 0) {
                    const textChannel = channel as TextChannel;
                    const messages = await textChannel.getMessages();
                    const lastMessage = messages.find((message) => message.id === textChannel.lastMessageID);
                    if (lastMessage) {
                        await lastMessage.delete("[auto detected] Advertisement in username");
                    }
                }
            } else {
                await member.addRole("304266397947789322", "New member");
            }
        }
    } catch (e) {
        logger.error("guildMemberAdd", "Oopsie an error was thrown, but who gives a shit.");
    }
});

warspite.on("ready", async () => {
    if (!ready) {
        await commandHandler.loadCommands(`${__dirname}/commands`);

        logger.ready(`Logged in as ${warspite.user.username}`);
        logger.ready(`Loaded [${warspite.commands.size}] commands`);

        ready = true;
    }
});

process.on("SIGINT", () => {
    warspite.disconnect({ reconnect: false });
    process.exit(0);
});

warspite.connect().catch((e) => logger.error("CONNECT", e));
