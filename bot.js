const Discord = require('discord.js');
require('dotenv').config();

const client = new Discord.Client();

const reactPrefix = "!react";

const clearPrefix = "!clear";

const authorizedUsers = [process.env.ZEKE_ID, process.env.NICK_ID, client.id];

var emojisSaved = new Map();

function authorized(ID, authorizedIDS) {
    for (var i = 0; i < authorizedIDS.length; i ++) {
        if (ID == authorizedIDS[i]) {
            return true;
        }
    }
    return false;
}

function addtoMap(id, reaction) {
    if (emojisSaved.has(id)) {
        emojisSaved.get(id).push(reaction);
    } else {
        emojisSaved.set(id, [reaction]);
    }
}
function removefromMap(id, reaction) {
    if (emojisSaved.has(id)) {
        emojisSaved.get(id).splice(emojisSaved.get(id).indexOf(reaction), 1)
    }
}

function makeReactions(msg, id) {
    const emojis = emojisSaved.get(id);
    orderedReact(msg, emojis, 0);
}
async function orderedReact(msg, emojis, i) {
    if (i == emojis.length) {
        return;
    }
    await msg.react(emojis[i])
    orderedReact(msg, emojis, i + 1)
}
function removeReacts(id, msg) {
    if (emojisSaved.delete(id)) {
        msg.reply("Successfully deleted.");
    } else {
        msg.reply("No reacts saved for that user.");
    }
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    const content = msg.content;
    if (!msg.channel.guild) {
        return;
    }
    if (content.startsWith(reactPrefix)) {
        if (!authorized(msg.author.id, authorizedUsers)) {
            msg.reply("You don't have permission to do that, asshole.");
        } else {
            const mentions = msg.mentions.members.array();
            const mentionsLen = mentions.length
            if (mentionsLen < 1) {
                msg.reply("No users mentioned");
            } else if (mentionsLen > 1) {
                msg.reply("Too many users mentioned");
            } else {
                msg.reply("React to your message with the emoji.")
                }
            }
        } else if (content.startsWith(clearPrefix)) {
        if (!authorized(msg.author.id, authorizedUsers)) {
            msg.reply("You don't have permission to do that, asshole.");
        } else {
            const mentions = msg.mentions.members.array();
            const mentionsLen = mentions.length
            if (mentionsLen < 1) {
                msg.reply("No users mentioned");
            } else if (mentionsLen > 1) {
                msg.reply("Too many users mentioned");
            } else {
                removeReacts(mentions[0].id, msg);
            }
        }
    } else if (emojisSaved.has(msg.author.id)) {
        makeReactions(msg, msg.author.id);
    } 
}
);
client.on("messageReactionAdd", (messageReaction, user) => {
    if (messageReaction.message.content.startsWith(reactPrefix)) {
        if (!authorized(user.id, authorizedUsers)) {
        } else {
            const mentions = messageReaction.message.mentions.members.array();
            if (mentions.length == 1 && authorized(messageReaction.message.author.id, authorizedUsers)) {
                addtoMap(mentions[0].id, messageReaction.emoji);
            }
        }
    }
});

client.on("messageReactionRemove", (messageReaction, user) => {
    if (messageReaction.message.content.startsWith(clearPrefix)) {
        if (!authorized(user.id, authorizedUsers)) {
        } else {
            const mentions = messageReaction.message.mentions.members.array();
            if (mentions.length == 1 && authorized(messageReaction.message.author.id, authorizedUsers)) {
                removefromMap(mentions[0].id, messageReaction.emoji);
            }
        }
    }
});

client.login(process.env.BOT_TOKEN);