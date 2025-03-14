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

    // Store user responses to avoid repeated replies
    const userMemory = new Map();

    // Message Listener
    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        if (!message.message || message.key.remoteJid.includes("@g.us")) return; // Ignore groups and status messages

        const from = message.key.remoteJid;
        const sender = message.key.participant || from;
        const messageText = message.message.conversation || message.message.extendedTextMessage?.text || "";

        // Prevent spamming by checking last interaction
        const lastInteraction = userMemory.get(sender);
        const now = Date.now();
        if (lastInteraction && now - lastInteraction < 5 * 60 * 60 * 1000) return;

        userMemory.set(sender, now); // Store user's interaction time

        // If user hasn't started a session, greet and list options
        if (!userMemory.get(`${sender}_step`)) {
            await zk.sendMessage(from, { text: `Hello *${sender.split("@")[0]}*! 👋\n\nPlease select a service:\n\n1️⃣ Bot Deployment\n2️⃣ Bot Development\n3️⃣ Website Development\n4️⃣ Heroku Account\n5️⃣ Heroku Team\n6️⃣ Teaching in Deployments\n7️⃣ Teaching in Bot Deployment\n\nReply with the corresponding number to proceed.` });
            userMemory.set(`${sender}_step`, "main_menu");
            return;
        }

        // Process user responses
        const step = userMemory.get(`${sender}_step`);

        if (step === "main_menu") {
            if (messageText === "1") {
                await zk.sendMessage(from, { text: `Please select your country:\n\n1️⃣ Kenya\n2️⃣ Tanzania\n3️⃣ Uganda\n\nReply with the corresponding number.` });
                userMemory.set(`${sender}_step`, "select_country");
            } else if (["2", "3", "4", "5", "6", "7"].includes(messageText)) {
                await zk.sendMessage(from, { text: "Please reply with your budget in money amount." });
                userMemory.set(`${sender}_step`, "get_budget");
            } else {
                await zk.sendMessage(from, { text: "Invalid option. Please select from the menu." });
            }
            return;
        }

        if (step === "select_country") {
            let priceMessage = "";
            if (messageText === "1") {
                priceMessage = "The bot deployment cost for Kenya is *100 KES*.";
            } else if (messageText === "2") {
                priceMessage = "The bot deployment cost for Tanzania is *3000 TZS*.";
            } else if (messageText === "3") {
                priceMessage = "The bot deployment cost for Uganda is *4000 UGX*.";
            } else {
                await zk.sendMessage(from, { text: "Invalid selection. Please reply with a valid option." });
                return;
            }

            await zk.sendMessage(from, { text: `${priceMessage}\n\nReply with:\n✔️ *OK* to proceed\n✖️ *I'll contact later*` });
            userMemory.set(`${sender}_step`, "confirm_purchase");
            return;
        }

        if (step === "confirm_purchase") {
            if (messageText.toLowerCase() === "ok") {
                await zk.sendMessage(from, {
                    text: `*📖 HOW TO GET BWM XMD SESSION:*\n\n1️⃣ **Open the link below**\n> https://www.ibrahimadams.site/scanner\n\n2️⃣ **Enter Your WhatsApp Number**  \n👉 Type your WhatsApp number with your country code without (+) (e.g., 254xxxxxxxx) and tap **Submit**.  \n\n3️⃣ **Receive a Code**  \n👉 Ibrahim Tech will send a short code, Copy it to your keyboard.  \n\n4️⃣ **Check WhatsApp Notification**  \n👉 WhatsApp will notify you. Tap on the notification and enter the code sent by Ibrahim Tech.  \n\n5️⃣ **Wait for the Session**  \n👉 After loading, it will link then Ibrahim Tech will send a session to your WhatsApp number.  \n\n6️⃣ **Copy and Share the Session**  \n👉 Copy the long session and send it to me.\n\n💻 Powered by *BWM XMD*`
                });
                userMemory.set(`${sender}_step`, "session_instructions");
            } else if (messageText.toLowerCase() === "i'll contact later") {
                await zk.sendMessage(from, { text: "OK, thanks for contacting us." });
                userMemory.delete(`${sender}_step`);
            } else {
                await zk.sendMessage(from, { text: "Invalid response. Reply with 'OK' to proceed or 'I'll contact later' to exit." });
            }
            return;
        }

        if (step === "get_budget") {
            await zk.sendMessage(from, { text: "Please wait a minute while we connect you to an available customer care representative." });
            userMemory.delete(`${sender}_step`);
            return;
        }
    });

    console.log("✅ Bwm XMD is now connected to WhatsApp!");
}

main();
