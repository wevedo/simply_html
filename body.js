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

    zk.ev.on("messages.upsert", async (update) => {
        for (const message of update.messages) {
            if (!message.message || message.key.remoteJid.includes("@g.us")) return; // Ignore groups and status
            const from = message.key.remoteJid;
            const sender = message.pushName || "User";
            const messageText = message.message.conversation || message.message.extendedTextMessage?.text || "";

            // Check if user has already received a response in the last 5 hours
            if (userMemory.has(from) && Date.now() - userMemory.get(from) < 5 * 60 * 60 * 1000) {
                return;
            }

            userMemory.set(from, Date.now()); // Save user timestamp

            // Greet and provide selection
            const menu = `👋 Hello *${sender}*, welcome!\n\nPlease select an option:\n\n` +
                `1️⃣ Bot Deployment\n` +
                `2️⃣ Bot Development\n` +
                `3️⃣ Website Development\n` +
                `4️⃣ Heroku Account\n` +
                `5️⃣ Heroku Team\n` +
                `6️⃣ Teaching in Deployments\n` +
                `7️⃣ Teaching in Bot Deployment\n\n` +
                `📌 Reply with the number of your choice.`;

            await zk.sendMessage(from, { text: menu });

            zk.ev.on("messages.upsert", async (newUpdate) => {
                const newMessage = newUpdate.messages[0];
                if (!newMessage.message || newMessage.key.remoteJid !== from) return;

                const responseText = newMessage.message.conversation || newMessage.message.extendedTextMessage?.text || "";
                const selectedIndex = parseInt(responseText);

                if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > 7) {
                    return zk.sendMessage(from, { text: "❌ Invalid number. Please select a valid option." });
                }

                if (selectedIndex === 1) { // Bot Deployment
                    const countryMenu = `🌍 Please select your country:\n\n` +
                        `1️⃣ Kenya 🇰🇪\n` +
                        `2️⃣ Tanzania 🇹🇿\n` +
                        `3️⃣ Uganda 🇺🇬\n\n` +
                        `📌 Reply with the number of your country.`;

                    await zk.sendMessage(from, { text: countryMenu });

                    zk.ev.on("messages.upsert", async (countryUpdate) => {
                        const countryMessage = countryUpdate.messages[0];
                        if (!countryMessage.message || countryMessage.key.remoteJid !== from) return;

                        const countryResponse = countryMessage.message.conversation || countryMessage.message.extendedTextMessage?.text || "";
                        const countryIndex = parseInt(countryResponse);

                        let priceMessage;
                        if (countryIndex === 1) {
                            priceMessage = "✅ Bot deployment in *Kenya* costs *100 KES*.";
                        } else if (countryIndex === 2) {
                            priceMessage = "✅ Bot deployment in *Tanzania* costs *3000 TZS*.";
                        } else if (countryIndex === 3) {
                            priceMessage = "✅ Bot deployment in *Uganda* costs *4000 UGX*.";
                        } else {
                            return zk.sendMessage(from, { text: "❌ Sorry, bot deployment is only available in East Africa." });
                        }

                        const confirmationMessage = `${priceMessage}\n\nWould you like to proceed?\n\n✅ *OK* - Connect to customer care\n❌ *I'll contact you later*`;

                        await zk.sendMessage(from, { text: confirmationMessage });

                        zk.ev.on("messages.upsert", async (finalUpdate) => {
                            const finalMessage = finalUpdate.messages[0];
                            if (!finalMessage.message || finalMessage.key.remoteJid !== from) return;

                            const finalResponse = finalMessage.message.conversation || finalMessage.message.extendedTextMessage?.text || "";

                            if (finalResponse.toLowerCase() === "ok") {
                                await zk.sendMessage(from, { text: "⏳ Please wait a moment. Connecting you to customer care..." });
                            } else {
                                await zk.sendMessage(from, { text: "✅ No worries! Feel free to reach out whenever you're ready." });
                            }
                        });
                    });

                } else {
                    await zk.sendMessage(from, { text: "⏳ Please wait a moment. Connecting you to customer care..." });
                }
            });
        }
    });

    console.log("✅ SKY-MD is now active!");
}

main();
