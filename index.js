const Eris = require("eris");
const cheerio = require("cheerio");
const axios = require("axios");
const toml = require("toml");
const fs = require("fs");

const { sleep } = require("./utils");
require("./utils");

const settings = toml.parse(fs.readFileSync("./settings.toml"));
const baseUrl = "https://azurlane.koumakan.jp";
const fullBaseUrl = "https://azurlane.koumakan.jp/";
const urlRegex = /[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/giu;

// Create the main client
const client = new Eris.CommandClient(settings.token, {
    getAllUsers: true,
    defaultImageFormat: "png",
    defaultImageSize: 1024
}, {
    description: "Azur Lane help bot",
    name: "Warspite",
    owner: "Kurozero#0001",
    prefix: "w!",
    defaultCommandOptions: {
        cooldown: 5000,
        cooldownExclusions: {
            userIDs: ["93973697643155456"]
        },
        cooldownMessage: "Please calm down commander, you're currently on cooldown",
        cooldownReturns: 1,
        invalidUsageMessage: "Commander you're doing it wrong! Please use `w!help ship` to see how to use this command"
    }
});

// Register a new command called 'ship'
client.registerCommand("ship", async (msg, args) => {
    // Return if no ship names were given
    if (args.length === 0)
        return await msg.channel.createMessage("Please tell me which ship to search for.");

    // Ship names need to be capitalized for the url
    args.forEach((str, i) => args[i] = str.capitalize());

    // Request the ship's html page
    let resp = {};
    try {
        resp = await axios.get(fullBaseUrl + args.join("_"));
    } catch (e) {
        return await msg.channel.createMessage(`Commander, there is no ship called **${args.join(" ")}**...`);
    }

    // Parse the html page and get the data
    const $ = cheerio.load(resp.data);
    const image = baseUrl + $(".image img")[0].attribs.src;
    const shipdata = $("tbody tr td");
    const name = $(".mw-parser-output span")[0].children[0].data;

    let buildTime = shipdata[0].children[0].children[0].data.replace("\n", "");
    if (buildTime.charAt(buildTime.length - 1) === "(")
        buildTime = buildTime.slice(0, -1);

    const stars = shipdata[1].children[0].next.data;
    const shipClass = shipdata[2].children[0].children[0].data;
    const shipID = shipdata[3].children[0].data;
    const nationality = shipdata[4].children[0].next.next.children[0].data;
    const hullType = shipdata[5].children[0].next.next.next.children[0].data;

    // Check which rarity it is and use the appropriate string
    let rarity = "";
    const str = $("tbody tr td")[1].children[0].attribs.src.toLowerCase();
    if (str.indexOf("normal") !== -1)
        rarity = "Common";
    else if (str.indexOf("elite") !== -1)
        rarity = "Elite";
    else if (str.indexOf("superrare") !== -1)
        rarity = "Super Rare";
    else if (str.indexOf("rare") !== -1)
        rarity = "Rare";
    else if (str.indexOf("legendary") !== -1)
        rarity = "Legendary";

    // Send the embed to Discord with the data
    await msg.channel.createMessage({
        embed: {
            title: name,
            url: fullBaseUrl + args.join("_"),
            color: 0xE576AA,
            thumbnail: {
                url: image
            },
            fields: [
                {
                    name: "Construction time",
                    value: buildTime,
                    inline: true
                },
                {
                    name: "Rarity",
                    value: rarity,
                    inline: true
                },
                {
                    name: "Stars",
                    value: stars.replace("\n", ""),
                    inline: true
                },
                {
                    name: "Class",
                    value: shipClass,
                    inline: true
                },
                {
                    name: "Nationality",
                    value: nationality,
                    inline: true
                },
                {
                    name: "Hull type",
                    value: hullType,
                    inline: true
                }
            ],
            footer: {
                text: `Version: ${settings.version}, ID: ${shipID.replace("\n", "")}`
            }
        }
    });
}, {
    aliases: [
        "boat",
        "shipgirl",
        "shipinfo",
        "info"
    ],
    argsRequired: true,
    description: "Get info about a certain ship",
    fullDescription: "Get some usefull information about the given ship as argument",
    usage: "<shipgirl_name> |> `w!ship warspite`"
});

client.registerCommand("build", async (msg, args) => {
    const argsTime = args.join(" ");

    let resp = {};
    try {
        resp = await axios.get(`${baseUrl}/Building`);
    } catch (e) {
        return await msg.channel.createMessage("Commander, it seems like I ran into an error, please try again later.");
    }
    const $ = cheerio.load(resp.data);

    const data = [];
    const filtered = $("table[style=\"text-align:left;margin:auto;font-weight:700;width:100%\"] tbody")[0].children.filter((obj) => obj.name === "tr");
    filtered.forEach((item) => {
        const val = item.children[0].children[0].data;
        if (val === "Construction Time") return;

        const names = [];
        item.children[1].children.filter((obj) => obj.name === "table").forEach((i) => {
            names.push(i.children[1].children[0].children[1].children[0].children[0].children[0].attribs.title);
        });

        data.push({
            time: val,
            ships: [...names]
        });
    });

    const result = data.find((obj) => obj.time === argsTime);
    if (!result) return await msg.channel.createMessage("Commander, this is an invalid construction time... *baka*");

    await msg.channel.createMessage(`All ships for the construction time **${result.time}**:\n${result.ships.join(", ")}`);
}, {
    aliases: [
        "times",
        "time",
        "construction"
    ],
    argsRequired: true,
    description: "Get the ships for a certain construction time",
    fullDescription: "Get the ships for a certain construction time",
    usage: "<construction_time> |> `w!build 00:23:00`"
});

client.on("error", console.error);
client.on("warn", console.warn);
client.on("ready", () => console.log("Ready!"));

/* Specific for my own guild */
client.on("guildMemberAdd", async (guild, member) => {
    try {
        if (guild.id === "240059867744698368") {
            const hasUrlUsername = member.username.match(urlRegex);
            if (hasUrlUsername) {
                await member.ban(7, "[auto detected] Advertisement in username");
                await sleep(1000);
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

process.on("uncaughtException", (e) => console.error(e));
process.on("unhandledRejection", (e) => console.error(e));

process.on("SIGINT", () => {
    client.disconnect({ reconnect: false });
    process.exit(0);
    setTimeout(() => process.exit(0), 5000);
});

// Connect to the Discord websocket
client.connect().catch(console.error);
