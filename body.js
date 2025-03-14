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




    store.bind(zk.ev);
    console.log("✅ SKY-MD is now connected to WhatsApp!");

    // Handle incoming messages
    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        if (!message.message || message.key.remoteJid.endsWith("@g.us")) return; // Ignore groups and status

        const sender = message.key.remoteJid;
        const messageText = message.message.conversation || message.message.extendedTextMessage?.text || "";
        const senderName = message.pushName || "User";

        // Check if user has received a previous message
        if (userMemory[sender] && userMemory[sender].waitingForReply) {
            handleUserReply(zk, message, sender);
            return;
        }

        // Prevent repeated responses within 5 hours
        if (userMemory[sender] && Date.now() - userMemory[sender].lastReply < 5 * 60 * 60 * 1000) {
            return;
        }

        // Greet the user and present options
        const categories = [
            "Bot Deployment",
            "Bot Development",
            "Website Development",
            "Heroku Account",
            "Heroku Team",
            "Teaching in Deployments",
            "Teaching in Bot Deployment"
        ];

        const optionsText = categories.map((item, index) => `${index + 1}. ${item}`).join("\n");
        const botReply = `👋 Hello *${senderName}*,\n\nPlease select an option:\n${optionsText}`;

        const sentMessage = await zk.sendMessage(sender, { text: botReply });

        // Save user state
        userMemory[sender] = {
            waitingForReply: true,
            lastReply: Date.now(),
            lastMessageId: sentMessage.key.id
        };
    });

    // Function to handle user reply
    async function handleUserReply(zk, message, sender) {
        const responseText = message.message.conversation || message.message.extendedTextMessage?.text || "";

        if (
            message.message.extendedTextMessage &&
            message.message.extendedTextMessage.contextInfo &&
            message.message.extendedTextMessage.contextInfo.stanzaId === userMemory[sender].lastMessageId
        ) {
            const selectedIndex = parseInt(responseText);
            const categories = [
                "Bot Deployment",
                "Bot Development",
                "Website Development",
                "Heroku Account",
                "Heroku Team",
                "Teaching in Deployments",
                "Teaching in Bot Deployment"
            ];

            if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > categories.length) {
                return zk.sendMessage(sender, { text: "*❌ Invalid number. Please select a valid option.*" }, { quoted: message });
            }

            const selectedCategory = categories[selectedIndex - 1];

            if (selectedCategory === "Bot Deployment") {
                await zk.sendMessage(sender, { text: "🌍 Please select a country from East Africa:\n1. Kenya\n2. Tanzania\n3. Uganda" });

                userMemory[sender] = {
                    waitingForCountry: true,
                    lastReply: Date.now(),
                    lastMessageId: message.key.id
                };
            } else {
                await zk.sendMessage(sender, { text: "⏳ Please wait while we connect you to customer care..." });
                delete userMemory[sender]; // Reset memory for future interactions
            }
        } else if (userMemory[sender].waitingForCountry) {
            const countryResponse = parseInt(responseText);

            if (isNaN(countryResponse) || countryResponse < 1 || countryResponse > 3) {
                return zk.sendMessage(sender, { text: "*❌ Invalid number. Please select a valid country.*" }, { quoted: message });
            }

            let priceMessage = "";
            if (countryResponse === 1) priceMessage = "🇰🇪 Kenya: The bot costs 100 KES.";
            if (countryResponse === 2) priceMessage = "🇹🇿 Tanzania: The bot costs 3000 TZS.";
            if (countryResponse === 3) priceMessage = "🇺🇬 Uganda: The bot costs 4000 UGX.";

            await zk.sendMessage(sender, { text: `${priceMessage}\n\nWould you like to proceed?\n1. OK\n2. I'll contact you later` });

            userMemory[sender] = {
                waitingForConfirmation: true,
                lastReply: Date.now(),
                lastMessageId: message.key.id
            };
        } else if (userMemory[sender].waitingForConfirmation) {
            const confirmationResponse = parseInt(responseText);

            if (isNaN(confirmationResponse) || confirmationResponse < 1 || confirmationResponse > 2) {
                return zk.sendMessage(sender, { text: "*❌ Invalid number. Please select a valid option.*" }, { quoted: message });
            }

            if (confirmationResponse === 1) {
                await zk.sendMessage(sender, { text: "⏳ Please wait while we connect you to available customer care..." });
            } else {
                await zk.sendMessage(sender, { text: "✅ No problem! You can contact us anytime." });
            }

            delete userMemory[sender]; // Reset memory after response
        }
    }
}

// Start bot
main();
