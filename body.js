"use strict";

const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, makeInMemoryStore } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const conf = require("./config");
require("dotenv").config({ path: "./config.env" });

// Logger
const logger = pino({ level: "silent" });
const store = makeInMemoryStore({ logger });

// Session Setup
async function authentification() {
    try {
        const sessionPath = __dirname + "/Session/creds.json";
        if (!fs.existsSync(sessionPath) && conf.session !== "zokk") {
            const [header, b64data] = conf.session.split(';;;');
            if (header === "BWM-XMD" && b64data) {
                let decompressedData = Buffer.from(b64data.replace('...', ''), "base64");
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

// Start WhatsApp Connection
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

    // Store user interaction history in memory
    const userMemory = new Map();

    // Service categories
    const services = {
        1: "Bot Deployment",
        2: "Bot Development",
        3: "Website Development",
        4: "Heroku Account",
        5: "Heroku Team",
        6: "Teaching in Deployments",
        7: "Teaching in Bot Deployment"
    };

    const prices = {
        Kenya: "100 KES",
        Tanzania: "3000 TZS",
        Uganda: "4000 UGX"
    };

    // Listen for new messages
    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        if (!message.message || message.key.remoteJid.includes("@g.us")) return; // Ignore groups

        const from = message.key.remoteJid;
        const senderName = message.pushName || "User";
        const messageText = message.message.conversation?.trim() || message.message.extendedTextMessage?.text?.trim();

        // Prevent spam by checking recent interactions
        if (userMemory.has(from) && Date.now() - userMemory.get(from) < 5 * 60 * 60 * 1000) return;
        userMemory.set(from, Date.now());

        // **Reply Listener for Continuation of Conversations**
        if (message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo) {
            const responseText = messageText;
            const contextMessageId = message.message.extendedTextMessage.contextInfo.stanzaId;

            if (userMemory.get(`${from}-context`) === contextMessageId) {
                handleResponse(from, responseText);
                return;
            }
        }

        // Start conversation if not in any step
        if (!userMemory.has(`${from}-step`)) {
            await zk.sendMessage(from, {
                text: `Hello *${senderName}*, welcome to our service! Please select an option below:\n\n` +
                    `1️⃣ ${services[1]}\n2️⃣ ${services[2]}\n3️⃣ ${services[3]}\n4️⃣ ${services[4]}\n5️⃣ ${services[5]}\n6️⃣ ${services[6]}\n7️⃣ ${services[7]}\n\n` +
                    `_Reply with the number of your choice._`
            });
            userMemory.set(`${from}-step`, "category");
            return;
        }
    });

    // Function to Handle Replies
    async function handleResponse(from, responseText) {
        const step = userMemory.get(`${from}-step`);

        if (step === "category") {
            const choice = parseInt(responseText);
            if (!services[choice]) {
                await zk.sendMessage(from, { text: "❌ Invalid selection. Please reply with a valid number." });
                return;
            }

            if (choice === 1) { // Bot Deployment
                await zk.sendMessage(from, {
                    text: "Please select your country:\n\n1️⃣ Kenya\n2️⃣ Tanzania\n3️⃣ Uganda\n\n_Reply with the number of your country._"
                });
                userMemory.set(`${from}-step`, "bot-deployment-country");
            } else {
                await zk.sendMessage(from, { text: "What is your budget?" });
                userMemory.set(`${from}-step`, "budget");
            }
            return;
        }

        if (step === "bot-deployment-country") {
            const countryMap = { 1: "Kenya", 2: "Tanzania", 3: "Uganda" };
            const selectedCountry = countryMap[parseInt(responseText)];

            if (!selectedCountry) {
                await zk.sendMessage(from, { text: "❌ Invalid selection. Please select a valid country." });
                return;
            }

            await zk.sendMessage(from, { text: `The bot price for ${selectedCountry} is *${prices[selectedCountry]}*.\n\nDo you want to proceed?\n✅ Reply *OK* to continue\n❌ Reply *I'll contact you later*` });
            userMemory.set(`${from}-step`, "confirm-purchase");
            return;
        }

        if (step === "confirm-purchase") {
            if (responseText.toLowerCase() === "ok") {
                await zk.sendMessage(from, {
                    text: "Please scan your session using this link:\n\n🔗 https://www.ibrahimadams.site/scanner\n\nAfter scanning, forward the session along with your settings.\n\n_If you don't know how to scan, reply with *1*._"
                });
                userMemory.set(`${from}-step`, "waiting-scan");
            } else if (responseText.toLowerCase() === "i'll contact you later") {
                await zk.sendMessage(from, { text: "OK, thanks for contacting us." });
                userMemory.delete(`${from}-step`);
            } else {
                await zk.sendMessage(from, { text: "❌ Invalid response. Please reply with *OK* or *I'll contact you later*." });
            }
            return;
        }

        if (step === "waiting-scan" && responseText === "1") {
            await zk.sendMessage(from, {
                text: "📖 *HOW TO GET BWM XMD SESSION:*\n\n1️⃣ Open link: https://www.ibrahimadams.site/scanner\n" +
                    "2️⃣ Enter your WhatsApp number (without +)\n" +
                    "3️⃣ Receive a code & enter it\n" +
                    "4️⃣ Wait for session & send it to us\n\n💻 *Powered by BWM XMD*"
            });
            userMemory.delete(`${from}-step`);
            return;
        }

        if (step === "budget") {
            await zk.sendMessage(from, { text: "Wait a moment while I connect you to available customer care." });
            userMemory.delete(`${from}-step`);
        }
    }

    console.log("✅ BWM XMD is now connected to WhatsApp!");
}

main();
