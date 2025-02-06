const util = require('util');
const fs = require('fs-extra');
const { adams } = require(__dirname + "/../Ibrahim/adams");
const { format } = require(__dirname + "/../Ibrahim/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../config");

adams({ nomCom: "menu2", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim//adams");
    var coms = {};
    var mode = s.MODE.toLowerCase() !== "yes" ? "private" : "public";

    cm.map(async (com) => {
        if (!coms[com.categorie]) coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });

    moment.tz.setDefault("Africa/Nairobi");
    const temps = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');

    // Generate greeting based on time of day
    const hour = moment().hour();
    let greeting = "Good Morning ☀️";
    if (hour >= 12 && hour < 18) {
        greeting = "Good Afternoon 🌤️";
    } else if (hour >= 18) {
        greeting = "Good Evening 🌙";
    } else if (hour >= 22 || hour < 5) {
        greeting = "Good Night 🌌";
    }

    // Generate commands list
    let commandList = "\n\nAvailable Commands";
    for (let category in coms) {
        commandList += `\n\n*${category}*\n`;
        commandList += coms[category].map((cmd) => `- ${prefixe}${cmd}`).join("\n");
    }

    let infoMsg = `
╭══════════════⊷❍
┇❍▸ ʙᴏᴛ ɴᴀᴍᴇ: *ᴅᴜʟʟᴀʜ-xᴍᴅ v²*
┇❍▸ ʙᴏᴛ ᴜsᴇʀ: *${nomAuteurMessage}*
┇❍▸ ᴍᴏᴅᴇ: *${mode}*
┇❍▸ ᴘʀᴇғɪx: *[ ${prefixe} ]*
┇❍▸ ᴘʟᴀᴛғᴏʀᴍ: *${os.platform()}*
┇❍▸ ᴅᴀᴛᴇ: *${date}*
┇❍▸ ᴛɪᴍᴇ: *${temps}*
┇❍▸ ᴄᴏᴍᴍᴀɴᴅs: *${cm.length}*
┇❍▸ ᴄᴀᴘᴀᴄɪᴛʏ: ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
╰══════════════⊷❍

🌟 *${greeting}* 🌟
${commandList}`;

    // Two sets of images to display randomly
    const extraImages1 = [
        "https://files.catbox.moe/a33gc4.jpg",
        "https://files.catbox.moe/ljsln1.jpeg",
        "https://files.catbox.moe/p6sqz3.jpeg"
    ];

    const extraImages2 = [
        "https://files.catbox.moe/362jo2.jpeg",
        "https://files.catbox.moe/60hwdx.jpeg",
        "https://files.catbox.moe/kh6yyt.jpeg"
    ];

    // Randomly select which menu to show
    const isOriginalMenu = Math.random() > 0.5; // 50% chance for either menu

    let mediaUrl, thumbnail, renderType;
    if (isOriginalMenu) {
        mediaUrl = mybotpic(); // Use bot’s original picture
        thumbnail = extraImages1[Math.floor(Math.random() * extraImages1.length)];
        renderType = "renderLargerThumbnail";
    } else {
        mediaUrl = extraImages2[Math.floor(Math.random() * extraImages2.length)];
        thumbnail = mediaUrl; // Use the same image as media
        renderType = "renderSmallThumbnail";
    }

    try {
        if (mediaUrl.match(/\.(mp4|gif)$/i)) {
            await zk.sendMessage(dest, {
                video: { url: mediaUrl },
                caption: infoMsg,
                footer: "*Dullah MD*, developed by Ibrahim Adams",
                gifPlayback: true,
                contextInfo: {
                    externalAdReply: {
                        title: "ᴅᴜʟʟᴀʜ-xᴍᴅ v²",
                        body: "Tap here to Join our official channel!",
                        mediaType: 1,
                        thumbnailUrl: thumbnail,
                        sourceUrl: "https://chat.whatsapp.com/IdRXU9UcO8K50GPelOyhxh",
                        showAdAttribution: true,
                        [renderType]: true, // Apply correct thumbnail size
                    },
                },
            }, { quoted: ms });
        } else {
            await zk.sendMessage(dest, {
                image: { url: mediaUrl },
                caption: infoMsg,
                footer: "*Dullah MD*, developed by Ibrahim Adams",
                contextInfo: {
                    externalAdReply: {
                        title: "ᴅᴜʟʟᴀʜ-xᴍᴅ",
                        body: "Tap here to Join our official channel!",
                        mediaType: 1,
                        thumbnailUrl: thumbnail,
                        sourceUrl: "https://chat.whatsapp.com/IdRXU9UcO8K50GPelOyhxh",
                        showAdAttribution: true,
                        [renderType]: true, // Apply correct thumbnail size
                    },
                },
            }, { quoted: ms });
        }
    } catch (e) {
        console.log("🥵🥵 Error sending menu: " + e);
        repondre("🥵🥵 Error sending menu: " + e);
    }

    // List of audio URLs
    const audioUrls = [
        "https://files.catbox.moe/wsyxi0.mp3",
        "https://files.catbox.moe/w2k8g2.mp3",
        "https://files.catbox.moe/cpjbnl.mp3",
        "https://files.catbox.moe/y6fph9.mp3",
        "https://files.catbox.moe/newsong.mp3" // New song added
    ];

    // Select a random audio file
    const randomAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];

    try {
        await zk.sendMessage(dest, {
            audio: { url: randomAudioUrl },
            mimetype: 'audio/mpeg',
            ptt: true, // Send as a voice note
        }, { quoted: ms });
    } catch (e) {
        console.log("🥵🥵 Error sending audio: " + e);
        repondre("🥵🥵 Error sending audio: " + e);
    }
});
