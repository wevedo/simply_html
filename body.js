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

        // Check if user is waiting for a reply
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

    // Function to handle user reply
    async function handleUserReply(zk, message, sender) {
        const responseText = message.message.conversation || message.message.extendedTextMessage?.text || "";

        // Ensure response matches the last sent message
        if (
            message.message.extendedTextMessage &&
            message.message.extendedTextMessage.contextInfo &&
            message.message.extendedTextMessage.contextInfo.stanzaId !== userMemory[sender].lastMessageId
        ) {
            return;
        }

        const selectedIndex = parseInt(responseText);

        const selectedCategory = [
                "Bot Deployment",
                "Bot Development",
                "Website Development",
                "Heroku Account",
                "Heroku Team",
                "Teaching in Deployments",
                "Teaching in Bot Deployment"
            ][selectedIndex - 1];

            if (selectedCategory === "Bot Deployment") {
                await zk.sendMessage(sender, { text: "🌍 *Select a country from East Africa:*\n\n🇰🇪 1. Kenya\n🇹🇿 2. Tanzania\n🇺🇬 3. Uganda\n\n🔙 0. Go Back" });

                userMemory[sender] = {
                    waitingForCountry: true,
                    lastReply: Date.now(),
                    lastMessageId: message.key.id
                };
            } else {
                await zk.sendMessage(sender, { text: "⏳ Connecting you to customer care..." });
                delete userMemory[sender];
            }
        } else if (userMemory[sender].waitingForCountry) {
            const countryResponse = parseInt(responseText);

            if (countryResponse === 0) {
                return await zk.sendMessage(sender, { text: "🔙 Going back..." }).then(() => {
                    delete userMemory[sender];
                    return main();
                });
            }

            let priceMessage = "";
            if (countryResponse === 1) priceMessage = "🇰🇪 *Kenya*: The bot costs *100 KES*.";
            if (countryResponse === 2) priceMessage = "🇹🇿 *Tanzania*: The bot costs *3000 TZS*.";
            if (countryResponse === 3) priceMessage = "🇺🇬 *Uganda*: The bot costs *4000 UGX*.";

            if (priceMessage) {
                await zk.sendMessage(sender, { text: `${priceMessage}\n\n✅ Would you like to proceed?\n\n✔️ 1. OK\n❌ 2. I'll contact you later\n\n🔙 0. Go Back` });

                userMemory[sender] = {
                    waitingForConfirmation: true,
                    lastReply: Date.now(),
                    lastMessageId: message.key.id
                };
            }
        } else if (userMemory[sender].waitingForConfirmation) {
            const confirmationResponse = parseInt(responseText);

            if (confirmationResponse === 0) {
                return await zk.sendMessage(sender, { text: "🔙 Going back..." }).then(() => {
                    delete userMemory[sender];
                    return main();
                });
            }

            if (confirmationResponse === 1) {
                await zk.sendMessage(sender, { text: "🎉 *Thank you for choosing us! You will be connected to customer care shortly. 🤝*" });
            } else {
                await zk.sendMessage(sender, { text: "✅ *No problem! You can contact us anytime.*" });
            }

            delete userMemory[sender];
        }
    }
}

// Start bot
main();
