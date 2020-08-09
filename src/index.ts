import GrafSpee from "./utils/GrafSpeeClient";
import CommandHandler from "./utils/CommandHandler";
import settings from "../settings";
import { Message, TextChannel, Guild } from "eris";
import { sleep } from "./utils/Helpers";

let ready = false;

const client = new GrafSpee(settings.env === "production" ? settings.tokens.production : settings.tokens.development, {
    getAllUsers: true,
    defaultImageFormat: "png",
    defaultImageSize: 1024
});
const commandHandler = new CommandHandler({ settings, client });
const logger = client.logger;
const urlRegex = /[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gui;

function updateMemberCount(guild: Guild) {
    const channel = guild.channels.get("741461211526463510");
    if (channel) {
        channel.edit({
            name: `members: ${guild.memberCount}`
        });
    }
}

client.on("messageCreate", async (message: Message) => {
    if (!ready) return; // Bot is not ready yet
    if (!message.author) return; // System message
    if (message.author.discriminator === "0000") return; // Webhook message

    if (message.content.startsWith(client.prefix)) {
        try {
            if (message.channel.type === 1 && message.author.id !== client.user.id) {
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
client.on("guildMemberAdd", async (guild, member) => {
    try {
        if (guild.id === settings.guild) {
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
                updateMemberCount(guild)
                await member.addRole("304266397947789322", "New member");
            }
        }
    } catch (e) {
        logger.error("guildMemberAdd", "Oopsie an error was thrown, but who gives a shit.");
    }
});

client.on("guildMemberRemove", (guild) => {
    if (guild.id === settings.guild) {
        updateMemberCount(guild)
    }
});

client.on("ready", async () => {
    if (!ready) {
        await commandHandler.loadCommands(`${__dirname}/commands`);

        logger.ready(`Logged in as ${client.user.username}`);
        logger.ready(`Loaded [${client.commands.size}] commands`);

        client.editStatus("online", { name: "Azur Lane", type: 0 });

        const guild = client.guilds.get(settings.guild);
        if (guild) {
            updateMemberCount(guild);
        }

        ready = true;
    }
});

/**
 * Sometimes when a shard goes down for a moment and comes back up is loses it's status
 * so we re-add it here
 */
client.on("shardResume", (id: number) => {
    const shard = client.shards.get(id);
    if (shard) {
        shard.editStatus("online", { name: "Azur Lane", type: 0 });
    }
});

process.on("SIGINT", () => {
    client.disconnect({ reconnect: false });
    process.exit(0);
});

client.connect().catch((e) => logger.error("CONNECT", e));
