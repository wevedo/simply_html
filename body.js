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
const userMemory = new Map();


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



    function shouldRespond(user) {
        return !userMemory[user] || (Date.now() - userMemory[user].lastInteraction) >= 5 * 60 * 60 * 1000;
    }

    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        if (!message.message || message.key.remoteJid.includes("@g.us")) return;

        const sender = message.key.remoteJid;
        const text = message.message.conversation || message.message.extendedTextMessage?.text || "";

        if (!userMemory[sender] || userMemory[sender].waitingForReply) {
            if (!shouldRespond(sender)) return;

            userMemory[sender] = { lastInteraction: Date.now(), waitingForReply: true };

            const replyMessage = `Hello *${sender.split("@")[0]}* 👋, please select an option:\n\n` +
                `1️⃣ Bot Deployment\n` +
                `2️⃣ Bot Development\n` +
                `3️⃣ Website Development\n` +
                `4️⃣ Heroku Account\n` +
                `5️⃣ Heroku Team\n` +
                `6️⃣ Teaching in Deployments\n` +
                `7️⃣ Teaching in Bot Deployment\n\n` +
                `*Reply with a number (1-7) to continue.*`;

            await zk.sendMessage(sender, { text: replyMessage }, { quoted: message });
        } else {
            const selectedIndex = parseInt(text);
            const options = [
                "Bot Deployment", "Bot Development", "Website Development",
                "Heroku Account", "Heroku Team", "Teaching in Deployments", "Teaching in Bot Deployment"
            ];

            if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > options.length) {
                return zk.sendMessage(sender, { text: "❌ Invalid number. Please select a valid option." }, { quoted: message });
            }

            if (selectedIndex === 1) {
                userMemory[sender].waitingForCountry = true;
                return zk.sendMessage(sender, { text: "Select your country:\n1️⃣ Kenya\n2️⃣ Tanzania\n3️⃣ Uganda\n\n*Reply with a number (1-3).*" }, { quoted: message });
            }

            userMemory[sender] = { lastInteraction: Date.now(), waitingForReply: false };
            return zk.sendMessage(sender, { text: "Please wait a moment, connecting you to customer care..." }, { quoted: message });
        }

        if (userMemory[sender].waitingForCountry) {
            const countrySelection = parseInt(text);
            if (countrySelection === 1) {
                return zk.sendMessage(sender, { text: "Bot deployment in Kenya costs *100 KES*. Reply 'OK' to proceed or 'I'll contact you later'." }, { quoted: message });
            } else if (countrySelection === 2) {
                return zk.sendMessage(sender, { text: "Bot deployment in Tanzania costs *3000 TZS*. Reply 'OK' to proceed or 'I'll contact you later'." }, { quoted: message });
            } else if (countrySelection === 3) {
                return zk.sendMessage(sender, { text: "Bot deployment in Uganda costs *4000 UGX*. Reply 'OK' to proceed or 'I'll contact you later'." }, { quoted: message });
            } else {
                return zk.sendMessage(sender, { text: "❌ Invalid number. Please select a valid country." }, { quoted: message });
            }
        }

        if (text.toLowerCase() === "ok") {
            userMemory[sender] = { lastInteraction: Date.now(), waitingForReply: false };
            return zk.sendMessage(sender, { text: "Please wait a moment, connecting you to customer care..." }, { quoted: message });
        }
    });

    console.log("✅ Bot is running!");
}

main();
