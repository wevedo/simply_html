const { adams } = require("../Ibrahim/adams");
const axios = require('axios');
const yts = require('yt-search');
const conf = require(__dirname + "/../config");
const PREFIX = conf.PREFIX;
adams({ 
    nomCom: "playtest", 
    categorie: "Download",
    reaction: "🎵",
    nomFichier: __filename 
}, async (dest, zk, { ms, repondre, arg }) => {
    try {
        // Check if search query exists
        if (!arg || arg.length === 0) {
            return repondre("```[ 🌴 ] Please enter a search query\nExample: .playtest never gonna give you up```");
        }

        const searchText = arg.join(' ');
        const searchResults = await yts(searchText);

        if (!searchResults.all || searchResults.all.length === 0) {
            return repondre("No results found for your search");
        }

        const video = searchResults.all[0];
        const caption = `
╭─❖ YouTube Search ❖─╮
│
│ ≡ Title: ${video.title}
│ ≡ Views: ${video.views}
│ ≡ Duration: ${video.timestamp}
│ ≡ Uploaded: ${video.ago}
│ ≡ URL: ${video.url}
│
╰──────────────────╯
Choose download option:`;

        // Send interactive message
        await zk.sendMessage(dest, {
            image: { url: video.thumbnail },
            caption: caption,
            footer: "BWM-XMD Test",
            buttons: [
                {
                    buttonId: `${PREFIX}ytmp3 ${video.url}`,
                    buttonText: { displayText: "🎵 Audio" }
                },
                {
                    buttonId: `${PREFIX}ytmp4 ${video.url}`,
                    buttonText: { displayText: "🎥 Video" }
                }
            ],
            contextInfo: {
                mentionedJid: [ms.key.participant || ms.key.remoteJid],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: ms });

    } catch (error) {
        console.error("Playtest Error:", error);
        repondre(`❌ Error: ${error.message}`);
    }
});
