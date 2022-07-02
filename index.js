const { Client } = require('discord.js');
const express = require('express')
var cors = require('cors');
require('dotenv').config();

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const app = express()

const token = process.env.BOT_TOKEN;
const channelID = process.env.CHANNEL_ID;
const frontEndURL = process.env.FRONTEND_URL;
const port = process.env.PORT;

app.use(cors({
    origin: frontEndURL
}));

app.get('/changelog', (req, res) => {
    res.contentType("application/json");
    console.log("Request received.");
    const channel = client.channels.fetch(channelID).then(channel => {
        channel.messages.fetch({ limit: 100 }).then((messages) => {
            res.write("[");
            messages.forEach(message => {
                //res.write(JSON.stringify(message));
                let timestamp = message.createdTimestamp;
                let date = new Date(timestamp);
                let day = date.getDate();
                let month = date.getMonth() + 1;
                let year = date.getFullYear();
                let hours = date.getHours();
                let minutes = date.getMinutes();
                let seconds = date.getSeconds();

                let formattedTime = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
                let author = message.author.username;
                let authorAvatar = message.author.avatarURL() || "https://cdn.discordapp.com/embed/avatars/0.png";
                let content = message.content
                    .replace(/\n/g, "<br>")
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/<br>-<br>/g, "<br>")
                    .replace(/\"/g, "\\\"")
                    .replace(/@everyone/g, "<strong>@everyone</strong>")
                    .replace(/@here/g, "<strong>@here</strong>")
                    .replace(/<@\d+>/g, (mention) => {
                        let id = mention.replace(/<@|>/g, "");
                        let username = client.users.cache.get(id).username;
                        return "<strong>@" + username + "</strong>";
                    });

                let attachments = message.attachments.map(attachment => {
                    return attachment.url;
                });

                res.write(`{"date":"${formattedTime}","content":"${content}","attachments":${JSON.stringify(attachments)},"author":{"name":"${author}","avatar":"${authorAvatar}"}}`);
                if (message.id != messages.last().id) {
                    res.write(",");
                }
            });
            res.end("]");
        });
    }).catch(console.error);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(token);
