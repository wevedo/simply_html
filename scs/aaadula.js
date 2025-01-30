const util = require('util');
const fs = require('fs-extra');
const { adams } = require(__dirname + "/../Ibrahim/adams");
const { format } = require(__dirname + "/../Ibrahim/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../config");

adams({ nomCom: "dullah", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;
    let { cm } = require(__dirname + "/../framework//zokou");
    var coms = {};
    var mode = "public";

    if ((s.MODE).toLocaleLowerCase() != "yes") {
        mode = "private";
    }

    cm.map(async (com, index) => {
        if (!coms[com.categorie]) coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });

    moment.tz.setDefault("Africa/Nairobi");

    const temps = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');

    // Generate commands list
    let commandList = "\n\nAvailable Commands:";
    for (let category in coms) {
        commandList += `\n\n*${category}*\n`;
        commandList += coms[category].map((cmd) => `- ${prefixe}${cmd}`).join("\n");
    }

    let infoMsg = `
╭══════════════⊷❍
┇❍▸ ʙᴏᴛ ɴᴀᴍᴇ: *ᴅᴜʟʟᴀʜ ᴍᴅ*
┇❍▸ ʙᴏᴛ ᴜsᴇʀ: *${nomAuteurMessage}*
┇❍▸ ᴍᴏᴅᴇ: *${mode}*
┇❍▸ ᴘʀᴇғɪx: *[ ${prefixe} ]*
┇❍▸ ᴘʟᴀᴛғᴏʀᴍ: *${os.platform()}*
┇❍▸ ᴅᴀᴛᴇ: *${date}*
┇❍▸ ᴛɪᴍᴇ: *${temps}*
┇❍▸ ᴄᴀᴘᴀᴄɪᴛʏ: ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
╰══════════════⊷❍ 
${commandList}`;

    const botPicUrl = mybotpic(); // This returns the bot picture URL

    // List of extra aid context images
    const extraImages = [
        "https://i.ibb.co/3mDjK2s/1000146208.jpg",
        "https://i.ibb.co/7tNWS99X/1000146199.jpg",
        "https://i.ibb.co/C5XMh6x/1000146185.jpg"
    ];
    
    // Select a random image
    const randomImage = extraImages[Math.floor(Math.random() * extraImages.length)];

    try {
        if (botPicUrl.match(/\.(mp4|gif)$/i)) {
            // If the bot picture is a video or GIF
            await zk.sendMessage(dest, {
                video: { url: botPicUrl },
                caption: infoMsg,
                footer: "*Dullah MD*, developed by Ibrahim Adams",
                gifPlayback: true,
                contextInfo: {
                    externalAdReply: {
                        title: "ᴅᴜʟʟᴀʜ-xᴍᴅ",
                        body: "Tap here to Join our official channel!",
                        thumbnailUrl: randomImage,
                        sourceUrl: "https://chat.whatsapp.com/IdRXU9UcO8K50GPelOyhxh",
                        showAdAttribution: true,
                        renderLargerThumbnail: false,
                    },
                },
            }, { quoted: ms });
        } else if (botPicUrl.match(/\.(jpeg|png|jpg)$/i)) {
            // If the bot picture is an image
            await zk.sendMessage(dest, {
                image: { url: botPicUrl },
                caption: infoMsg,
                footer: "*Dullah MD*, developed by Ibrahim Adams",
                contextInfo: {
                    externalAdReply: {
                        title: "ᴅᴜʟʟᴀʜ-xᴍᴅ",
                        body: "Tap here to Join our official channel!",
                        thumbnailUrl: randomImage,
                        sourceUrl: "https://chat.whatsapp.com/IdRXU9UcO8K50GPelOyhxh",
                        showAdAttribution: true,
                        renderLargerThumbnail: false,
                    },
                },
            }, { quoted: ms });
        } else {
            // Default text response if no media type matches
            repondre(infoMsg);
        }
    } catch (e) {
        console.log("🥵🥵 Error sending bot picture: " + e);
        repondre("🥵🥵 Error sending bot picture: " + e);
    }

    // List of audio URLs
    const audioUrls = [
        "https://files.catbox.moe/wsyxi0.mp3",
        "https://files.catbox.moe/y6fph9.mp3",
        "https://files.catbox.moe/w2k8g2.mp3"
    ];
    
    // Select a random audio file
    const randomAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];

    // Sending random audio as a voice note
    try {
        await zk.sendMessage(dest, {
            audio: { url: randomAudioUrl },
            mimetype: 'audio/mpeg',
            ptt: true, // Send as a voice note
        }, { quoted: ms });
    } catch (e) {
        console.log("🥵🥵 Error sending audio as voice note: " + e);
        repondre("🥵🥵 Error sending audio as voice note: " + e);
    }
});
