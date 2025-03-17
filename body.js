"use strict";

const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, makeInMemoryStore } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const conf = require("./config");
const zlib = require("zlib");
const { default: axios } = require('axios');
require("dotenv").config({ path: "./config.env" });

const logger = pino({ level: "silent" });

const sessionStore = new Map();

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
    });

    store.bind(zk.ev);

    console.log("✅ Bwm XMD is now connected to WhatsApp!");

    zk.ev.on("messages.upsert", async (m) => {
    const { messages } = m;
    const ms = messages[0];

    if (!ms.message) return;

    const messageContent = ms.message.conversation || ms.message.extendedTextMessage?.text || '';
    const sender = ms.key.remoteJid;

    // Ensure the command is used in DM (not in groups)
    if (sender.endsWith("@g.us")) return;

    // Extract the prefix and command
    const prefixUsed = messageContent.charAt(0);
    const args = messageContent.slice(1).split(" ");
    const command = args.shift()?.toLowerCase();

    if (command === "pair") {
        // Ensure a phone number is provided
        if (args.length === 0 || isNaN(args[0])) {
            await zk.sendMessage(sender, { text: "Example Usage: .pair 254xxxxxxxx." });
            return;
        }

        const phoneNumber = encodeURIComponent(args[0]);
        const apiUrl = `https://bwm-xmd-scanner-s211.onrender.com/code?number=${phoneNumber}`;

        try {
            // Fetch pairing code from API
            const response = await axios.get(apiUrl);
            const result = response.data;

            if (result && result.code) {
                const pairingCode = result.code;

                // First message: Send the pairing code
                await zk.sendMessage(sender, { text: pairingCode });

                // Second message: Instructions for the user
                const instructionMessage = 
                    "After getting the code, WhatsApp will automatically send you a notification to enter it.\n " +
                    "Enter the code you received. After logging in, a session will be sent to your DM.\n " +
                    "Copy that session and forward it to me.";
                
                await zk.sendMessage(sender, { text: instructionMessage });
            } else {
                throw new Error("Invalid response from API.");
            }
        } catch (error) {
            console.error("Error fetching API response:", error.message);
            await zk.sendMessage(sender, { text: "Error retrieving pairing code. Please try again later." });
        }
    }
});

    
const responseStore = new Map(); // Store user responses

zk.ev.on("messages.upsert", async (update) => {
    const message = update.messages[0];

    // Skip if the message is from the bot itself
    if (message.key.fromMe) return;

    if (!message.message || message.key.remoteJid.includes("@g.us")) return;

    const from = message.key.remoteJid;
    const sender = message.pushName;
    const messageText = message.message.conversation || message.message.extendedTextMessage?.text || "";

    // Check if the user has an active session
    if (sessionStore.has(from)) {
        const session = sessionStore.get(from);

        // If the session is older than 24 hours, clear it
        if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
            sessionStore.delete(from);
            responseStore.delete(from);
            return;
        }

        // Handle responses based on the session state
        if (session.state === "awaitingOption") {
            const selectedIndex = parseInt(messageText);
            if (isNaN(selectedIndex) {
                // Allow free chat if the message is not a number
                return;
            }

            if (selectedIndex < 1 || selectedIndex > 7) {
                await zk.sendMessage(from, { text: "❌ Invalid option. Please select a valid number." });
                return;
            }

            if (selectedIndex === 1) {
                session.state = "awaitingCountry";
                sessionStore.set(from, session);

                let countryMsg = "Please select your country:\n";
                countryMsg += "1️⃣ Kenya\n";
                countryMsg += "2️⃣ Tanzania\n";
                countryMsg += "3️⃣ Uganda\n";
                countryMsg += "4️⃣ Other (Not Available)\n";

                await zk.sendMessage(from, { text: countryMsg });
                return;
            } else {
                session.state = "awaitingBudget";
                sessionStore.set(from, session);

                let serviceMsg = "💰 What is your budget for this service? 💡\nLet us know how much you can afford! Just reply with the amount (e.g., 300K, 1000K, 500K) 💵✨\nWe are here to help! 🚀😊";
                await zk.sendMessage(from, { text: serviceMsg });
                return;
            }
        }

        if (session.state === "awaitingCountry") {
            const countryIndex = parseInt(messageText);
            let priceMsg = "";
            if (countryIndex === 1) priceMsg = "✅ *Kenya Bot Price: 100 KES*";
            else if (countryIndex === 2) priceMsg = "✅ *Tanzania Bot Price: 3000 TZS*";
            else if (countryIndex === 3) priceMsg = "✅ *Uganda Bot Price: 4000 UGX*";
            else priceMsg = "❌ *Service Not Available in Your Country*";

            await zk.sendMessage(from, { text: priceMsg });

            if (countryIndex >= 1 && countryIndex <= 3) {
                session.state = "awaitingConfirmation";
                sessionStore.set(from, session);

                let confirmMsg = "Would you like to proceed?\n\n1️⃣ OK\n2️⃣ I'll contact you later";
                await zk.sendMessage(from, { text: confirmMsg });
                return;
            }
        }

        if (session.state === "awaitingConfirmation") {
            const confirmIndex = parseInt(messageText);
            if (confirmIndex === 1) {
                const sessionInstructions = `*⊷━─────────────────────━⊷*\n*Manual method*\n\nScan the session from the link below and send it to us along with your phone number and the settings you need\n
Scan Here
> https://www.ibrahimadams.site/scanner

\n*⊷━─────────────────────━⊷*\n*Or use automatic command*\n\nEg : .pair 254xxxxxxxxx\n\n*⊷━─────────────────────━⊷*\n\n` +
                    `*💻 Powered by bwm xmd* \n\n` +
                    `╭────────────━⊷\n` +
                    `🌐 ᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ ʙᴇʟᴏᴡ ᴛᴏ ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ\n` +
                    `> https://shorturl.at/z3b8v\n\n` +
                    `🌐 ғᴏʀ �ᴍᴏʀᴇ ɪɴғᴏ, ᴠɪsɪᴛ\n` +
                    `> https://ibrahimadamscenter.us.kg\n\n` +
                    `╰────────────━⊷\n` +
                    `> Made by Ibrahim Adams`;

                await zk.sendMessage(from, { text: sessionInstructions });
            } else if (confirmIndex === 2) {
                await zk.sendMessage(from, { text: "OK! 😊 Thanks for reaching out to us! 💬✨\n We truly appreciate your time and interest in our services. 🚀💡" });
            }

            sessionStore.delete(from);
            responseStore.delete(from);
            return;
        }

        if (session.state === "awaitingBudget") {
            await zk.sendMessage(from, { text: "🌎 Please wait a minute while we connect you to an available customer care representative.✅" });
            sessionStore.delete(from);
            responseStore.delete(from);
            return;
        }
    } else {
        // New user interaction
        sessionStore.set(from, { state: "awaitingOption", timestamp: Date.now() });

        let greeting = `Hello *${sender}*\n\n*PRIVATE BUSINESS BOT*\n\n`;
        greeting += "1️⃣ Bot Deployment\n";
        greeting += "2️⃣ Bot Development\n";
        greeting += "3️⃣ Website Development\n";
        greeting += "4️⃣ Heroku Account\n";
        greeting += "5️⃣ Heroku Team\n";
        greeting += "6️⃣ Teaching in Deployments\n";
        greeting += "7️⃣ Teaching in Bot Deployment\n\n*Please reply an option with it's number*\n\n*Made by Sir Ibrahim Adams*";

        // Send the image with the greeting as the caption
        const imageUrl = "https://files.catbox.moe/xfb4kl.jpg";
        await zk.sendMessage(from, {
            image: { url: imageUrl },
            caption: greeting,
            mimetype: "image/jpeg",
        });
    }
});
