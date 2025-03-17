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
const messageQueue = new Map();

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

    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];

        // Skip if the message is from the bot itself
        if (message.key.fromMe) return;

        if (!message.message || message.key.remoteJid.includes("@g.us")) return;

        const from = message.key.remoteJid;
        const sender = message.pushName;
        const messageText = message.message.conversation || message.message.extendedTextMessage?.text || "";

        if (sessionStore.has(sender) && Date.now() - sessionStore.get(sender) < 24 * 60 * 60 * 1000) return;

        sessionStore.set(sender, Date.now());

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
        const sentMessage = await zk.sendMessage(from, {
            image: { url: imageUrl },
            caption: greeting,
            mimetype: "image/jpeg",
        });

        messageQueue.set(sentMessage.key.id, { from, sender, step: "initial" });

        zk.ev.on("messages.upsert", async (responseUpdate) => {
            const response = responseUpdate.messages[0];

            // Skip if the response is from the bot itself
            if (response.key.fromMe) return;

            if (!response.message || !response.message.extendedTextMessage) return;

            const responseText = response.message.extendedTextMessage.text.trim();
            const contextInfo = response.message.extendedTextMessage.contextInfo;
            if (contextInfo && messageQueue.has(contextInfo.stanzaId)) {
                const { from, sender, step } = messageQueue.get(contextInfo.stanzaId);

                if (step === "initial") {
                    const selectedIndex = parseInt(responseText);
                    if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > 7) {
                        return zk.sendMessage(from, { text: "❌ Invalid option. Please select a valid number." });
                    }

                    if (selectedIndex === 1) {
                        let countryMsg = "Please select your country:\n";
                        countryMsg += "1️⃣ Kenya\n";
                        countryMsg += "2️⃣ Tanzania\n";
                        countryMsg += "3️⃣ Uganda\n";
                        countryMsg += "4️⃣ Other (Not Available)\n";

                        const countryMessage = await zk.sendMessage(from, { text: countryMsg });
                        messageQueue.set(countryMessage.key.id, { from, sender, step: "country" });
                    } else {
                        let serviceMsg = "💰 What is your budget for this service? 💡\nLet us know how much you can afford! Just reply with the amount (e.g., 300K, 1000K, 500K) 💵✨\nWe are here to help! 🚀😊";
                        const serviceMessage = await zk.sendMessage(from, { text: serviceMsg });
                        messageQueue.set(serviceMessage.key.id, { from, sender, step: "service" });
                    }
                } else if (step === "country") {
                    const countryIndex = parseInt(responseText);
                    let priceMsg = "";
                    if (countryIndex === 1) priceMsg = "✅ *Kenya Bot Price: 100 KES*";
                    else if (countryIndex === 2) priceMsg = "✅ *Tanzania Bot Price: 3000 TZS*";
                    else if (countryIndex === 3) priceMsg = "✅ *Uganda Bot Price: 4000 UGX*";
                    else priceMsg = "❌ *Service Not Available in Your Country*";

                    const priceMessage = await zk.sendMessage(from, { text: priceMsg });

                    if (countryIndex >= 1 && countryIndex <= 3) {
                        let confirmMsg = "Would you like to proceed?\n\n1️⃣ OK\n2️⃣ I'll contact you later";
                        const confirmMessage = await zk.sendMessage(from, { text: confirmMsg });
                        messageQueue.set(confirmMessage.key.id, { from, sender, step: "confirm" });
                    }
                } else if (step === "confirm") {
                    const confirmIndex = parseInt(responseText);
                    if (confirmIndex === 1) {
                        const sessionInstructions = `*⊷━─────────────────────━⊷*\n*Manual method*\n\nScan the session from the link below and send it to us along with your phone number and the settings you need\n
Scan Here
> https://www.ibrahimadams.site/scanner

\n*⊷━─────────────────────━⊷*\n*Or use automatic command*\n\nEg : .pair 254xxxxxxxxx\n\n*⊷━─────────────────────━⊷*\n\n` +
                            `*💻 Powered by bwm xmd* \n\n` +
                            `╭────────────━⊷\n` +
                            `🌐 ᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ ʙᴇʟᴏᴡ ᴛᴏ ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ\n` +
                            `> https://shorturl.at/z3b8v\n\n` +
                            `🌐 ғᴏʀ ᴍᴏʀᴇ ɪɴғᴏ, ᴠɪsɪᴛ\n` +
                            `> https://ibrahimadamscenter.us.kg\n\n` +
                            `╰────────────━⊷\n` +
                            `> Made by Ibrahim Adams`;

                        zk.sendMessage(from, { text: sessionInstructions });
                    } else if (confirmIndex === 2) {
                        zk.sendMessage(from, { text: "OK! 😊 Thanks for reaching out to us! 💬✨\n We truly appreciate your time and interest in our services. 🚀💡" });
                    }
                } else if (step === "service") {
                    zk.sendMessage(from, { text: "🌎 Please wait a minute while we connect you to an available customer care representative.✅" });
                }
            }
        });
    });
}

main();
