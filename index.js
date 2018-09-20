const Eris = require('eris');
const cheerio = require('cheerio');
const axios = require('axios');
const toml = require('toml');
const fs = require('fs');
require('./utils');

const settings = toml.parse(fs.readFileSync('./settings.toml'));
const baseUrl = 'https://azurlane.koumakan.jp';

// Create the main client
const client = new Eris.CommandClient(settings.token, {
    getAllUsers: true,
    defaultImageFormat: 'png',
    defaultImageSize: 1024
}, {
    description: 'Azur Lane help bot',
    name: 'Warspite',
    owner: 'Kurozero#0001',
    prefix: 'w!'
});

// Register a new command called 'ship'
// ['ship', 'boat', 'shipgirl', 'shipinfo', 'info']
client.registerCommand('ship', async (msg, args) => {
    // Return if no ship names were given
    if (args.length === 0)
        return await msg.channel.createMessage('Please tell me which ship to search for.');

    // Ship names need to be capitalized for the url
    args.forEach((str, i) => args[i] = str.capitalize());

    // Request the ship's html page
    let resp = {};
    try {
        resp = await axios.get(baseUrl + '/' + args.join('_'));
    } catch (e) {
        console.error(e);
    }

    // Parse the html page and get the data
    const $ = cheerio.load(resp.data);
    const image = baseUrl + $('.image img')[0].attribs.src;
    const shipdata = $('tbody tr td');
    const name = $('.mw-parser-output span')[0].children[0].data;

    let buildTime = shipdata[0].children[0].children[0].data.replace('\n', '');
    if (buildTime.charAt(buildTime.length - 1) === '(')
        buildTime = buildTime.slice(0, -1);

    const stars = shipdata[1].children[0].next.data;
    const shipClass = shipdata[2].children[0].children[0].data;
    const shipID = shipdata[3].children[0].data;
    const nationality = shipdata[4].children[0].next.next.children[0].data;
    const hullType = shipdata[5].children[0].next.next.next.children[0].data;

    // Check which rarity it is and use the appropriate string
    let rarity = '';
    const str = $('tbody tr td')[1].children[0].attribs.src.toLowerCase();
    if (str.indexOf('normal') !== -1)
        rarity = 'Common';
    else if (str.indexOf('elite') !== -1)
        rarity = 'Elite';
    else if (str.indexOf('superrare') !== -1)
        rarity = 'Super Rare';
    else if (str.indexOf('rare') !== -1)
        rarity = 'Rare';

    // Send the embed to Discord with the data
    try {
        await msg.channel.createMessage({
            embed: {
                title: name,
                color: 0xE576AA,
                thumbnail: { url: image },
                fields: [
                    { name: 'Build time', value: buildTime, inline: true },
                    { name: 'Rarity', value: rarity, inline: true },
                    { name: 'Stars', value: stars.replace('\n', ''), inline: true },
                    { name: 'Class', value: shipClass, inline: true },
                    { name: 'Nationality', value: nationality, inline: true },
                    { name: 'Hull type', value: hullType, inline: true }
                ],
                footer: { text: `Version: ${settings.version}, ID: ${shipID.replace('\n', '')}` }
            }
        });
    } catch (e) {
        console.error(e);
    }
}, {
    description: 'Get info about a certain ship'
});

// Log important events
client.on('ready', () => console.log('Ready!'));
client.on('error', (e, _id) => console.error(e));
client.on('warn', (msg, _id) => console.warn(msg));

process.on('uncaughtException', (e) => console.error(e));
process.on('unhandledRejection', (e) => console.error(e));

process.on('SIGINT', () => {
    client.disconnect({ reconnect: false });
    process.exit(0);
    setTimeout(() =>  process.exit(0) , 5000);
});

// Connect to the Discord websocket
client.connect().catch(console.error);
