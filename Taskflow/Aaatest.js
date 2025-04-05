const { adams } = require('../Ibrahim/adams');
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');
const conf = require(__dirname + "/../config");
const PREFIX = conf.PREFIX;

adams({ 
    nomCom: "menu", 
    categorie: "General",
    reaction: "📱",
    nomFichier: __filename 
}, async (dest, zk, { ms, repondre }) => {
    try {
        // Create the interactive message with rows
        const msg = generateWAMessageFromContent(dest, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `╭─────═━┈┈━═──━┈⊷
│ ʙᴏᴛ ɴᴀᴍᴇ: *ʙᴡᴍ-ᴍᴅ*
│ ᴠᴇʀꜱɪᴏɴ: *6.0.3*
│ ᴏᴡɴᴇʀ: *sɪʀ ɪʙʀᴀʜɪᴍ*
╰─────═━┈┈━═──━┈⊷`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: "Powered by BWM-XMD"
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "BWM-XMD COMMAND MENU",
                                    sections: [{
                                        title: "MAIN CATEGORIES",
                                        rows: [
                                            {
                                                title: "📜 COMMAND LIST",
                                                description: "View all commands",
                                                id: "commands"
                                            },
                                            {
                                                title: "⏳ PING BOT",
                                                description: "Check bot response",
                                                id: "ping"
                                            },
                                            {
                                                title: "🎵 MEDIA TOOLS",
                                                description: "Downloaders & editors",
                                                id: "media"
                                            },
                                            {
                                                title: "👥 GROUP TOOLS",
                                                description: "Group management",
                                                id: "group"
                                            }
                                        ]
                                    }]
                                })
                            }]
                        })
                    })
                }
            }
        }, {});

        // Send the message
        await zk.relayMessage(dest, msg.message, { messageId: msg.key.id });

        // Handle responses
        zk.ev.on("messages.upsert", async ({ messages }) => {
            const message = messages[0];
            
            // Handle list selection
            if (message?.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
                const params = JSON.parse(message.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
                const selectedId = params.id;
                
                let response = "";
                switch(selectedId) {
                    case "commands":
                        response = `📜 *Command List*\n\n${PREFIX}play\n${PREFIX}ytdl\n${PREFIX}igdl`;
                        break;
                    case "ping":
                        response = `🏓 Pong! Bot is alive`;
                        break;
                    case "media":
                        response = `🎵 *Media Tools*\n\n${PREFIX}play\n${PREFIX}ytmp3\n${PREFIX}ytmp4`;
                        break;
                    case "group":
                        response = `👥 *Group Tools*\n\n${PREFIX}add\n${PREFIX}kick\n${PREFIX}promote`;
                        break;
                }
                
                if (response) {
                    await repondre(response);
                }
            }
        });

    } catch (error) {
        console.error("Menu Error:", error);
        repondre("❌ Failed to load menu. Please try again.");
    }
});
