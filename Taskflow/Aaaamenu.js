const { adams } = require("../Ibrahim/adams");
const { PREFIX } = require(__dirname + "/../config");
const axios = require('axios');

// Image URLs for each category
const menuImages = {
    media: [
        'https://bwm-xmd-files.vercel.app/bwmxmd_v4jirh.jpeg',
        'https://bwm-xmd-files.vercel.app/bwmxmd_v4jirh.jpeg'
    ],
    group: [
        'https://bwm-xmd-files.vercel.app/bwmxmd_v4jirh.jpeg',
        'https://bwm-xmd-files.vercel.app/bwmxmd_v4jirh.jpeg'  
    ],
    tools: [
        'https://bwm-xmd-files.vercel.app/bwmxmd_v4jirh.jpeg',
        'https://bwm-xmd-files.vercel.app/bwmxmd_v4jirh.jpeg'
    ],
    ai: [
        'https://bwm-xmd-files.vercel.app/bwmxmd_v4jirh.jpeg',
        'https://bwm-xmd-files.vercel.app/bwmxmd_v4jirh.jpeg'
    ]
};

adams({ nomCom: "pollmenu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    const { ms, nomAuteurMessage } = commandeOptions;

    // Create the poll menu
    const pollMessage = await zk.sendMessage(dest, {
        poll: {
            name: "📊 BWM-XMD COMMAND NAVIGATOR",
            values: ["Media Tools", "Group Tools", "Utilities", "AI Features"],
            selectableCount: 1
        },
        footer: "Vote to view commands in each category"
    });

    // Handle poll selection
    zk.ev.on("messages.upsert", async (update) => {
        const msg = update.messages[0];
        if (!msg.message?.pollUpdateMessage || msg.key.id !== pollMessage.key.id) return;

        const selection = msg.message.pollUpdateMessage.vote.selectedOptions[0];
        let category, commands, randomImage;

        switch(selection) {
            case 0: // Media
                category = "media";
                commands = `🎬 *Media Commands*\n\n` +
                          `${PREFIX}ytdl - Download YouTube videos\n` +
                          `${PREFIX}igdl - Instagram content downloader\n` +
                          `${PREFIX}sticker - Create stickers\n` +
                          `${PREFIX}tiktok - TikTok downloader`;
                break;
                
            case 1: // Group
                category = "group";
                commands = `👥 *Group Commands*\n\n` +
                          `${PREFIX}add - Add users\n` +
                          `${PREFIX}kick - Remove users\n` +
                          `${PREFIX}promote - Make admin\n` +
                          `${PREFIX}lock - Lock group settings`;
                break;
                
            case 2: // Tools
                category = "tools";
                commands = `🛠 *Utility Commands*\n\n` +
                          `${PREFIX}calc - Calculator\n` +
                          `${PREFIX}trt - Translator\n` +
                          `${PREFIX}tts - Text to speech\n` +
                          `${PREFIX}tempmail - Temporary email`;
                break;
                
            case 3: // AI
                category = "ai";
                commands = `🤖 *AI Commands*\n\n` +
                          `${PREFIX}gpt - ChatGPT\n` +
                          `${PREFIX}dalle - Image generation\n` +
                          `${PREFIX}gemini - Google AI\n` +
                          `${PREFIX}remini - Photo enhancement`;
                break;
        }

        // Select random image for category
        const images = menuImages[category];
        randomImage = images[Math.floor(Math.random() * images.length)];

        // Send category commands with image
        await zk.sendMessage(dest, {
            image: { url: randomImage },
            caption: commands,
            footer: "Reply 'back' to return to main menu"
        }, { quoted: ms });

        // Set up back navigation
        zk.ev.once("messages.upsert", async (backUpdate) => {
            const backMsg = backUpdate.messages[0];
            if (backMsg.key.remoteJid === dest && 
                backMsg.message?.conversation?.toLowerCase() === "back") {
                await zk.sendMessage(dest, {
                    text: "Returning to main menu...",
                    footer: "Please vote again"
                });
                // Resend original poll
                await zk.sendMessage(dest, {
                    poll: {
                        name: "📊 BWM-XMD COMMAND NAVIGATOR",
                        values: ["Media Tools", "Group Tools", "Utilities", "AI Features"],
                        selectableCount: 1
                    }
                });
            }
        });
    });
});
