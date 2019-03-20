const axios = require("axios");
const cheerio = require("cheerio");
const Command = require("../Command");

class Build extends Command {
    constructor() {
        super({
            name: "build",
            description: "Get the ships for a certain construction time",
            usage: "<time: string>",
            aliases: [
                "times",
                "time",
                "construction"
            ],
            requiredArgs: 1
        });
    }

    async run(msg, args, _client, { baseUrl }) {
        const argsTime = args.join(" ");

        let resp = {};
        try {
            resp = await axios.get(`${baseUrl}/Building`);
        } catch (e) {
            return await msg.channel.createMessage("Commander, it seems like I ran into an error, please try again later.");
        }

        try {
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
        } catch (error) {
            try {
                await msg.channel.createMessage(`\`\`\`diff\n- ${error.stack}\n\`\`\``);
            } catch (err) { return null; }
        }
    }
}

module.exports = Build;
