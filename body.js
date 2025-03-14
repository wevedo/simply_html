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

// User Interaction Memory
const userMemory = new Map();

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

    // Message Listener
    zk.ev.on("messages.upsert", async (m) => {
        for (const ms of m.messages) {
            if (!ms.message || ms.key.remoteJid.endsWith("@g.us") || ms.key.remoteJid === "status@broadcast") return;

            const from = ms.key.remoteJid;
            const sender = ms.key.participant || ms.key.remoteJid;
            const messageText = ms.message.conversation || ms.message.extendedTextMessage?.text || "";

            // Greet the user and list options
            if (!userMemory.has(sender)) {
                await zk.sendMessage(from, { text: `Hello @${sender.split("@")[0]}! Please select an option:\n\n1. Bot deployment\n2. Bot development\n3. Website development\n4. Heroku account\n5. Heroku team\n6. Teaching in deployments\n7. Teaching in bot deployment` });
                userMemory.set(sender, { step: "awaiting_option" });
            } else if (userMemory.get(sender).step === "awaiting_option") {
                const selectedOption = parseInt(messageText);
                if (isNaN(selectedOption) || selectedOption < 1 || selectedOption > 7) {
                    await zk.sendMessage(from, { text: "❌ Invalid option. Please select a valid option." });
                    return;
                }

                if (selectedOption === 1) {
                    await zk.sendMessage(from, { text: "Please select a country:\n\n1. Kenya\n2. Tanzania\n3. Uganda\n4. Other" });
                    userMemory.set(sender, { step: "awaiting_country" });
                } else {
                    await zk.sendMessage(from, { text: "Waiting a minute, I connect you to available customer care." });
                    userMemory.set(sender, { step: "connected_to_care" });
                }
            } else if (userMemory.get(sender).step === "awaiting_country") {
                const selectedCountry = parseInt(messageText);
                if (isNaN(selectedCountry) || selectedCountry < 1 || selectedCountry > 4) {
                    await zk.sendMessage(from, { text: "❌ Invalid country. Please select a valid option." });
                    return;
                }

                let price;
                switch (selectedCountry) {
                    case 1:
                        price = "100bob";
                        break;
                    case 2:
                        price = "3000k";
                        break;
                    case 3:
                        price = "4000k";
                        break;
                    default:
                        await zk.sendMessage(from, { text: "Not available for other countries." });
                        return;
                }

                await zk.sendMessage(from, { text: `The bot deployment cost for your selected country is ${price}. Please reply with:\n\n1. OK\n2. I'll contact you later` });
                userMemory.set(sender, { step: "awaiting_confirmation" });
            } else if (userMemory.get(sender).step === "awaiting_confirmation") {
                if (messageText.toLowerCase() === "ok") {
                    await zk.sendMessage(from, { text: "Waiting a minute, I connect you to available customer care. While waiting, scan the session here and forward it to us with your number along with the settings you need." });
                    await zk.sendMessage(from, { text: `📖 HOW TO GET BWM XMD SESSION:\n\n1️⃣ Open the link below\n\n> https://www.ibrahimadams.site/scanner\n\n2️⃣ Enter Your WhatsApp Number\n\n👉 Type your WhatsApp number with your country code without (+) (e.g., 254xxxxxxxx) and tap Submit.\n\n3️⃣ Receive a Code\n\n👉 Ibrahim Tech will send a short code, Copy it to your keyboard.\n\n4️⃣ Check WhatsApp Notification\n\n👉 WhatsApp will notify you. Tap on the notification and enter the code sent by Ibrahim Tech.\n\n5️⃣ Wait for the Session\n\n👉 After loading, it will link then Ibrahim Tech will send a session to your WhatsApp number.\n\n6️⃣ Copy and Share the Session\n\n👉 Copy the long session and send it to me.\n\n💻 Powered by bwm xmd\n\n╭────────────━⊷\n🌐 ᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ ʙᴇʟᴏᴡ ᴛᴏ ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ\n\n> https://shorturl.at/z3b8v\n🌐 ғᴏʀ ᴍᴏʀᴇ ɪɴғᴏ, ᴠɪsɪᴛ\nhttps://ibrahimadamscenter.us.kg\n╰────────────━⊷\nMade by Ibrahim Adams` });
                    userMemory.set(sender, { step: "awaiting_session" });
                } else {
                    await zk.sendMessage(from, { text: "Alright, feel free to contact us later." });
                    userMemory.delete(sender);
                }
            } else if (userMemory.get(sender).step === "awaiting_session") {
                // Handle session submission
                await zk.sendMessage(from, { text: "Thank you for submitting the session. Our customer care will contact you shortly." });
                userMemory.delete(sender);
            }
        }
    });

    // Listen for Reply
    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        if (!message.message || !message.message.extendedTextMessage) return;

        const responseText = message.message.extendedTextMessage.text.trim();
        if (
            message.message.extendedTextMessage.contextInfo &&
            message.message.extendedTextMessage.contextInfo.stanzaId ===
            sentMessage.key.id
        ) {
            const selectedIndex = parseInt(responseText);
            if (
                isNaN(selectedIndex) ||
                (selectedIndex < 1 && selectedIndex > chunkSize * 2 + 2)
            ) {
                return repondre(
                    "❌ *Invalid number. Please select a valid option.*"
                );
            }
        }
    });
}

main();
