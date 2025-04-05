const { adams } = require('../Ibrahim/adams');
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');

adams({ 
    nomCom: "menutest", 
    categorie: "General",
    reaction: "📱",
    nomFichier: __filename 
}, async (dest, zk, { ms, repondre }) => {
    try {
        // Create the interactive message
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
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "📜 COMMAND LIST",
                                        id: `${PREFIX}commands`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "⏳ PING BOT",
                                        id: `${PREFIX}ping`
                                    })
                                },
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "⭐ GITHUB REPO",
                                        url: "https://github.com/devibraah/BWM-XMD"
                                    })
                                }
                            ]
                        })
                    })
                }
            }
        }, {});

        // Send the message
        await zk.relayMessage(dest, msg.message, { messageId: msg.key.id });

        // Button response handler
        zk.ev.on("messages.upsert", async ({ messages }) => {
            const message = messages[0];
            
            // Handle template button replies
            if (message?.message?.templateButtonReplyMessage) {
                const selectedId = message.message.templateButtonReplyMessage.selectedId;
                repondre(`You selected: ${selectedId}`);
            }
            
            // Handle native flow responses
            if (message?.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
                const params = JSON.parse(message.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
                repondre(`You clicked: ${params.display_text}`);
            }
        });

    } catch (error) {
        console.error("Menu Error:", error);
        repondre("❌ Failed to load menu. Please try again.");
    }
});
