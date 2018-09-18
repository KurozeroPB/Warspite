const Eris = require('eris');
const cheerio = require('cheerio');
const axios = require('axios');
const toml = require('toml');
const fs = require('fs');
require('./utils');

const settings = toml.parse(fs.readFileSync('./settings.toml'));

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
client.registerCommand('ship', async (msg, args) => {
    // Return if no ship names were given
    if (args.length === 0)
        return await msg.channel.createMessage('Please tell me which ship to search for.');

    // Ship names need to be capitalized for the url
    args.forEach((str, i) => args[i] = str.capitalize());

    // Get the ship's html page and parse the data
    const { data } = await axios.get(`https://azurlane.koumakan.jp/${args.join('_')}`);
    const $ = cheerio.load(data);
    const image = 'https://azurlane.koumakan.jp' + $('.image img')[0].attribs.src;
    const buildTime = $('tbody tr td')[0].children[0].data;
    const stars = $('tbody tr td')[1].children[0].next.data;

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
    await msg.channel.createMessage({
        embed: {
            title: args.join(' '),
            color: 0xE576AA,
            thumbnail: { url: image },
            fields: [
                { name: "Build time", value: buildTime.replace('\n', '').replace('(', ''), inline: true },
                { name: "Rarity", value: rarity, inline: true },
                { name: "Stars", value: stars.replace('\n', '') }
            ],
            footer: { text: 'Version: ' + settings.version }
        }
    });
}, {
    description: 'Get info about a certain ship'
});

// Log on ready
client.on('ready', () => console.log('Ready!'));

// Connect to the Discord websocket
client.connect();
