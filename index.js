const { Client } = require('discord.js');
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const http = require("http");
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const channelID = process.env.CHANNEL_ID;

const host = 'localhost';
const port = 8000;

const requestListener = function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    const channel = client.channels.fetch(channelID).then(channel => {
        channel.messages.fetch({ limit: 100 }).then((messages) => {
            res.write("[");
            messages.forEach(message => {
                res.write(JSON.stringify(message));
                if (message.id != messages.last().id) {
                    res.write(",");
                }
            });
            res.end("]");
        });
    }).catch(console.error);
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(token);