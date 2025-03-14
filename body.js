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

// Memory for tracking replied users
const userMemory = new Map();

// Function to save user in memory with timestamp
function saveUserToMemory(user) {
    userMemory.set(user, Date.now());
}

// Function to check if the user was recently replied
function shouldReply(user) {
    if (!userMemory.has(user)) return true;
    const lastReplyTime = userMemory.get(user);
    return Date.now() - lastReplyTime > 5 * 60 * 60 * 1000; // 5 hours
}

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

    console.log("✅ BWM XMD is now connected to WhatsApp!");

    // Message Listener
    zk.ev.on("messages.upsert", async (m) => {
        for (const ms of m.messages) {
            if (!ms.message) return;
            const from = ms.key.remoteJid;
            const sender = ms.key.participant || ms.key.remoteJid;
            if (from.endsWith("@g.us") || !shouldReply(sender)) return; // Ignore groups and repeated users

            const messageText = ms.message.conversation || ms.message.extendedTextMessage?.text || "";

            // Greet the user and offer choices
            let response = `👋 Hello *${sender.split("@")[0]}*! Please select an option:\n\n`;
            response += "1️⃣ Bot Deployment\n";
            response += "2️⃣ Bot Development\n";
            response += "3️⃣ Website Development\n";
            response += "4️⃣ Heroku Account\n";
            response += "5️⃣ Heroku Team\n";
            response += "6️⃣ Teaching in Deployments\n";
            response += "7️⃣ Teaching in Bot Deployment\n\n";
            response += "_Reply with the corresponding number to proceed._";

            await zk.sendMessage(from, { text: response });

            // Save user in memory to prevent repeated replies
            saveUserToMemory(sender);
        }
    });

    // Response to User Selection
    zk.ev.on("messages.upsert", async (m) => {
        for (const ms of m.messages) {
            if (!ms.message) return;
            const from = ms.key.remoteJid;
            const sender = ms.key.participant || ms.key.remoteJid;
            const messageText = ms.message.conversation || ms.message.extendedTextMessage?.text || "";

            if (!["1", "2", "3", "4", "5", "6", "7"].includes(messageText.trim())) {
                await zk.sendMessage(from, { text: "⏳ Please wait while I connect you to customer care..." });
                return;
            }

            if (messageText.trim() === "1") {
                let countryMessage = `🌍 Please select a country from East Africa:\n\n`;
                countryMessage += "🇰🇪 1. Kenya\n";
                countryMessage += "🇹🇿 2. Tanzania\n";
                countryMessage += "🇺🇬 3. Uganda\n\n";
                countryMessage += "_Reply with the corresponding number._";

                await zk.sendMessage(from, { text: countryMessage });
                return;
            }

            if (["2", "3", "4", "5", "6", "7"].includes(messageText.trim())) {
                await zk.sendMessage(from, { text: "⏳ Please wait while I connect you to customer care..." });
                return;
            }

            // Handle Country Selection
            if (messageText.trim() === "1") {
                await zk.sendMessage(from, { text: "✅ The bot for Kenya costs *100 KES*." });
            } else if (messageText.trim() === "2") {
                await zk.sendMessage(from, { text: "✅ The bot for Tanzania costs *3000 TZS*." });
            } else if (messageText.trim() === "3") {
                await zk.sendMessage(from, { text: "✅ The bot for Uganda costs *4000 UGX*." });
            } else {
                await zk.sendMessage(from, { text: "❌ This service is not available outside East Africa." });
                return;
            }

            // Ask user to proceed
            let finalMessage = "Would you like to proceed?\n";
            finalMessage += "✔️ 1. OK\n";
            finalMessage += "❌ 2. I'll contact you later\n";
            finalMessage += "_Reply with 1 or 2._";

            await zk.sendMessage(from, { text: finalMessage });

            // Handle Final Confirmation
            zk.ev.on("messages.upsert", async (m) => {
                for (const ms of m.messages) {
                    if (!ms.message) return;
                    const finalResponse = ms.message.conversation || "";

                    if (finalResponse.trim() === "1") {
                        let sessionInfo = `📖 *HOW TO GET BWM XMD SESSION:*\n\n`;
                        sessionInfo += "1️⃣ **Open the link below**\n";
                        sessionInfo += "> https://www.ibrahimadams.site/scanner\n\n";
                        sessionInfo += "2️⃣ **Enter Your WhatsApp Number**\n";
                        sessionInfo += "👉 Type your WhatsApp number with country code (e.g., 254xxxxxxxx) and tap **Submit**.\n\n";
                        sessionInfo += "3️⃣ **Receive a Code**\n";
                        sessionInfo += "👉 Ibrahim Tech will send a short code. Copy it.\n\n";
                        sessionInfo += "4️⃣ **Check WhatsApp Notification**\n";
                        sessionInfo += "👉 Enter the code sent by Ibrahim Tech.\n\n";
                        sessionInfo += "5️⃣ **Copy and Share the Session**\n";
                        sessionInfo += "👉 Send me the session details.\n\n";
                        sessionInfo += "*💻 Powered by BWM XMD*";

                        await zk.sendMessage(from, { text: sessionInfo });
                    }
                }
            });
        }
    });
}
main();
