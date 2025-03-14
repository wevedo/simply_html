"use strict";

// Import Required Modules
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, makeInMemoryStore } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const conf = require("./config");
const axios = require("axios");
const zlib = require("zlib");
require("dotenv").config({ path: "./config.env" });

// Logger
const logger = pino({ level: "silent" });

// Initialize WhatsApp Session
async function authentification() {
    try {
        const sessionPath = __dirname + "/Session/creds.json";
        if (!fs.existsSync(sessionPath) && conf.session !== "zokk") {
            console.log("Initializing session...");
            const [header, b64data] = conf.session.split(';;;');
            if (header === "BWM-XMD" && b64data) {
                let decompressedData = zlib.gunzipSync(Buffer.from(b64data.replace('...', ''), "base64"));
                fs.writeFileSync(sessionPath, decompressedData, "utf8");
            } else {
                throw new Error("Invalid session format");
            }
        }
    } catch (e) {
        console.log("Session Invalid: " + e.message);
    }
}
authentification();

// Setup Store & Socket
const store = makeInMemoryStore({ logger: pino().child({ level: "silent" }) });

async function main() {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/Session");
    const zk = makeWASocket({
        version,
        logger,
        browser: ["BWM-XMD", "Safari", "1.0.0"],
        printQRInTerminal: true,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
        getMessage: async (key) => store.loadMessage(key.remoteJid, key.id).then(msg => msg?.message),
    });

    store.bind(zk.ev);

    console.log("✅ Bwm XMD is now connected to WhatsApp!");

    // Memory store for user interactions
    const userMemory = new Map();

    // Message Listener
    zk.ev.on("messages.upsert", async (m) => {
        for (const ms of m.messages) {
            if (!ms.message || ms.key.remoteJid.endsWith("@g.us") || ms.key.remoteJid.includes("status")) return;

            const from = ms.key.remoteJid;
            const sender = ms.key.participant || ms.key.remoteJid;
            const messageText = ms.message.conversation || ms.message.extendedTextMessage?.text || "";

            if (userMemory.has(sender) && Date.now() - userMemory.get(sender) < 5 * 60 * 60 * 1000) {
                return; // Ignore messages from users who already interacted within 5 hours
            }

            userMemory.set(sender, Date.now());

            // First interaction message
            const menuMessage = `Hello *${sender.split('@')[0]}* 👋, Welcome to BWM XMD Bot Services.  
            
Please select a service by replying with the corresponding number:

1️⃣ Bot Deployment  
2️⃣ Bot Development  
3️⃣ Website Development  
4️⃣ Heroku Account  
5️⃣ Heroku Team  
6️⃣ Teaching in Deployments  
7️⃣ Teaching in Bot Deployment  

Please reply with a number to proceed.`;

            await zk.sendMessage(from, { text: menuMessage });

            // Listen for user replies
            zk.ev.on("messages.upsert", async (update) => {
                const replyMessage = update.messages[0];
                if (!replyMessage.message || !replyMessage.message.extendedTextMessage) return;

                const responseText = replyMessage.message.extendedTextMessage.text.trim();
                const selectedIndex = parseInt(responseText);

                if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > 7) {
                    return zk.sendMessage(from, { text: "❌ *Invalid number. Please select a valid option.*" });
                }

                if (selectedIndex === 1) {
                    // Bot Deployment selected
                    const countryMessage = `🌍 Please select your country:  
                    
1️⃣ Kenya 🇰🇪  
2️⃣ Tanzania 🇹🇿  
3️⃣ Uganda 🇺🇬  

Reply with the number corresponding to your country.`;
                    await zk.sendMessage(from, { text: countryMessage });

                    zk.ev.on("messages.upsert", async (update) => {
                        const countryReply = update.messages[0];
                        if (!countryReply.message || !countryReply.message.extendedTextMessage) return;

                        const countryResponse = countryReply.message.extendedTextMessage.text.trim();
                        const countryIndex = parseInt(countryResponse);

                        let priceMessage = "";
                        if (countryIndex === 1) priceMessage = "💰 The bot deployment cost in *Kenya* is *100 KES*.";
                        else if (countryIndex === 2) priceMessage = "💰 The bot deployment cost in *Tanzania* is *3000 TZS*.";
                        else if (countryIndex === 3) priceMessage = "💰 The bot deployment cost in *Uganda* is *4000 UGX*.";
                        else return zk.sendMessage(from, { text: "❌ *Invalid selection. Please select a valid country.*" });

                        await zk.sendMessage(from, { text: `${priceMessage}\n\nReply with *OK* to proceed or *I'll contact you later*.` });

                        zk.ev.on("messages.upsert", async (finalUpdate) => {
                            const finalReply = finalUpdate.messages[0];
                            if (!finalReply.message || !finalReply.message.extendedTextMessage) return;

                            const finalResponse = finalReply.message.extendedTextMessage.text.trim().toLowerCase();

                            if (finalResponse === "i'll contact you later") {
                                return zk.sendMessage(from, { text: "OK, thanks for contacting us." });
                            }

                            if (finalResponse === "ok") {
                                const scanSessionMessage = `📖 *HOW TO GET BWM XMD SESSION:*

1️⃣ **Open the link below**  
> https://www.ibrahimadams.site/scanner  

2️⃣ **Enter Your WhatsApp Number**  
👉 Type your WhatsApp number with your country code without (+) (e.g., 254xxxxxxxx) and tap **Submit**.  

3️⃣ **Receive a Code**  
👉 Ibrahim Tech will send a short code, Copy it to your keyboard.  

4️⃣ **Check WhatsApp Notification**  
👉 WhatsApp will notify you. Tap on the notification and enter the code sent by Ibrahim Tech.  

5️⃣ **Wait for the Session**  
👉 After loading, it will link then Ibrahim Tech will send a session to your WhatsApp number.  

6️⃣ **Copy and Share the Session**  
👉 Copy the long session and send it to me.  

*💻 Powered by bwm xmd* 

╭────────────━⊷  
🌐 ᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ ʙᴇʟᴏᴡ ᴛᴏ ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ  
> https://shorturl.at/z3b8v  
🌐 ғᴏʀ ᴍᴏʀᴇ ɪɴғᴏ, ᴠɪsɪᴛ  
> https://ibrahimadamscenter.us.kg  
╰────────────━⊷  
> Made by Ibrahim Adams`;

                                await zk.sendMessage(from, { text: scanSessionMessage });

                                await zk.sendMessage(from, { text: "If you don't know how to scan, reply *1*. If you know, ignore and scan." });
                            }
                        });
                    });
                } else {
                    // If another category is selected
                    await zk.sendMessage(from, { text: "Please provide your budget." });

                    zk.ev.on("messages.upsert", async (budgetUpdate) => {
                        const budgetReply = budgetUpdate.messages[0];
                        if (!budgetReply.message || !budgetReply.message.extendedTextMessage) return;

                        await zk.sendMessage(from, { text: "🔄 Connecting you to customer care... Please wait a moment." });
                    });
                }
            });
        }
    });
}
main();
