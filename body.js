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
    console.log("✅ SKY-MD is now connected to WhatsApp!");

    // Handle incoming messages
    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        if (!message.message || message.key.remoteJid.endsWith("@g.us")) return; // Ignore groups and status

        const sender = message.key.remoteJid;
        const messageText = message.message.conversation || message.message.extendedTextMessage?.text || "";
        const senderName = message.pushName || "User";

        // Prevent repeated responses within 5 hours
        if (userMemory[sender] && Date.now() - userMemory[sender].lastReply < 5 * 60 * 60 * 1000) {
            return;
        }

        // Greet the user and present options
        const categories = [
            "🤖 1. Bot Deployment",
            "👨‍💻 2. Bot Development",
            "🌐 3. Website Development",
            "💳 4. Heroku Account",
            "👥 5. Heroku Team",
            "📚 6. Teaching in Deployments",
            "🎓 7. Teaching in Bot Deployment"
        ];

        const optionsText = categories.join("\n");
        const botReply = `👋 *Hello ${senderName}*,\n\n📌 Please select an option:\n\n${optionsText}`;

        const sentMessage = await zk.sendMessage(sender, { text: botReply });

        // Save user state
        userMemory[sender] = {
            waitingForReply: true,
            lastReply: Date.now(),
            lastMessageId: sentMessage.key.id
        };
    });

    // Handle user responses
    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        if (!message.message || message.key.remoteJid.endsWith("@g.us")) return;

        const sender = message.key.remoteJid;
        const responseText = message.message.conversation || message.message.extendedTextMessage?.text || "";

        // If user is selecting a category
        if (userMemory[sender]?.waitingForReply) {
            const selectedIndex = parseInt(responseText);

            if (selectedIndex === 1) {
                const sentMsg = await zk.sendMessage(sender, { text: "🌍 *Select a country from East Africa:*\n\n🇰🇪 1. Kenya\n🇹🇿 2. Tanzania\n🇺🇬 3. Uganda\n\n🔙 0. Go Back" });

                userMemory[sender] = {
                    waitingForCountry: true,
                    lastReply: Date.now(),
                    lastMessageId: sentMsg.key.id
                };
            } else {
                await zk.sendMessage(sender, { text: "⏳ Connecting you to customer care..." });
                delete userMemory[sender];
            }
            return;
        }

        // If user is selecting a country
        if (userMemory[sender]?.waitingForCountry) {
            const countryResponse = parseInt(responseText);
            let priceMessage = "";

            if (countryResponse === 1) priceMessage = "🇰🇪 *Kenya*: The bot costs *100 KES*.";
            if (countryResponse === 2) priceMessage = "🇹🇿 *Tanzania*: The bot costs *3000 TZS*.";
            if (countryResponse === 3) priceMessage = "🇺🇬 *Uganda*: The bot costs *4000 UGX*.";

            if (!priceMessage) {
                return;
            }

            const sentMsg = await zk.sendMessage(sender, { text: `${priceMessage}\n\n✅ Would you like to proceed?\n\n✔️ 1. OK\n❌ 2. I'll contact you later` });

            userMemory[sender] = {
                waitingForConfirmation: true,
                lastReply: Date.now(),
                lastMessageId: sentMsg.key.id
            };
            return;
        }

        // If user is confirming their decision
        if (userMemory[sender]?.waitingForConfirmation) {
            if (responseText === "1") {
                await zk.sendMessage(sender, { text: "🎉 Great! You will be connected to customer care shortly. Please wait..." });
            } else {
                await zk.sendMessage(sender, { text: "👍 No problem! Feel free to reach out whenever you're ready." });
            }
            delete userMemory[sender];
            return;
        }
    });
}

// Start bot
main();
