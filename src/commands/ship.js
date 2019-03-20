const axios = require("axios");
const cheerio = require("cheerio");
const Command = require("../Command");

class Ship extends Command {
    constructor() {
        super({
            name: "ship",
            description: "Get info about a certain ship",
            usage: "<name: string>",
            aliases: [
                "boat",
                "shipgirl",
                "shipinfo",
                "info"
            ],
            requiredArgs: 1
        });
    }

    async run(msg, args, _client, { settings, baseUrl }) {
        // Return if no ship names were given
        if (args.length === 0)
            return await msg.channel.createMessage("Please tell me which ship to search for.");

        // Ship names need to be capitalized for the url
        args.forEach((str, i) => args[i] = str.capitalize());

        // Request the ship's html page
        let resp = {};
        try {
            resp = await axios.get(`${baseUrl}/${args.join("_")}`);
        } catch (e) {
            return await msg.channel.createMessage(`Commander, there is no ship called **${args.join(" ")}**...`);
        }

        // Parse the html page and get the data
        try {
            const $ = cheerio.load(resp.data);
            const image = baseUrl + $(".image img")[0].attribs.src;
            const shipdata = $("tbody tr td");
            const name = $(".mw-parser-output span")[0].children[0].data;

            let buildTime = shipdata[0].children[1].children[0].data.replace("\n", "");
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
                    url: `${baseUrl}/${args.join("_")}`,
                    color: 0xE576AA,
                    thumbnail: { url: image },
                    fields: [
                        { name: "Construction time", value: buildTime, inline: true },
                        { name: "Rarity", value: rarity, inline: true },
                        { name: "Stars", value: stars.replace("\n", ""), inline: true },
                        { name: "Class", value: shipClass, inline: true },
                        { name: "Nationality", value: nationality, inline: true },
                        { name: "Hull type", value: hullType, inline: true }
                    ],
                    footer: {
                        text: `Version: ${settings.version}, ID: ${shipID.replace("\n", "")}`
                    }
                }
            });
        } catch (error) {
            try {
                await msg.channel.createMessage(`\`\`\`diff\n- ${error.stack}\n\`\`\``);
            } catch (err) { return null; }
        }
    }
}

module.exports = Ship;
