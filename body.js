"use strict";

const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, makeInMemoryStore } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const conf = require("./config");
const zlib = require("zlib");
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

    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];

        // Skip if the message is from the bot itself
        if (message.key.fromMe) return;

        if (!message.message || message.key.remoteJid.includes("@g.us")) return;

        const from = message.key.remoteJid;
        const sender = message.pushName;
        const messageText = message.message.conversation || message.message.extendedTextMessage?.text || "";

        if (sessionStore.has(sender) && Date.now() - sessionStore.get(sender) < 5 * 60 * 60 * 1000) return;

        sessionStore.set(sender, Date.now());

        let greeting = `Hello *${sender}*!\nPlease reply an option with it's number\n\n`;
        greeting += "1️⃣ Bot Deployment\n";
        greeting += "2️⃣ Bot Development\n";
        greeting += "3️⃣ Website Development\n";
        greeting += "4️⃣ Heroku Account\n";
        greeting += "5️⃣ Heroku Team\n";
        greeting += "6️⃣ Teaching in Deployments\n";
        greeting += "7️⃣ Teaching in Bot Deployment\n";

        const sentMessage = await zk.sendMessage(from, { text: greeting });

        zk.ev.on("messages.upsert", async (responseUpdate) => {
            const response = responseUpdate.messages[0];

            // Skip if the response is from the bot itself
            if (response.key.fromMe) return;

            if (!response.message || !response.message.extendedTextMessage) return;

            const responseText = response.message.extendedTextMessage.text.trim();
            if (response.message.extendedTextMessage.contextInfo &&
                response.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id) {

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

                    zk.ev.on("messages.upsert", async (countryUpdate) => {
                        const countryResponse = countryUpdate.messages[0];

                        // Skip if the response is from the bot itself
                        if (countryResponse.key.fromMe) return;

                        if (!countryResponse.message || !countryResponse.message.extendedTextMessage) return;

                        const countryText = countryResponse.message.extendedTextMessage.text.trim();
                        if (countryResponse.message.extendedTextMessage.contextInfo &&
                            countryResponse.message.extendedTextMessage.contextInfo.stanzaId === countryMessage.key.id) {

                            const countryIndex = parseInt(countryText);
                            let priceMsg = "";
                            if (countryIndex === 1) priceMsg = "✅ *Kenya Bot Price: 100 KES*";
                            else if (countryIndex === 2) priceMsg = "✅ *Tanzania Bot Price: 3000 TZS*";
                            else if (countryIndex === 3) priceMsg = "✅ *Uganda Bot Price: 4000 UGX*";
                            else priceMsg = "❌ *Service Not Available in Your Country*";

                            const priceMessage = await zk.sendMessage(from, { text: priceMsg });

                            if (countryIndex >= 1 && countryIndex <= 3) {
                                let confirmMsg = "Would you like to proceed?\n\n1️⃣ OK\n2️⃣ I'll contact you later";
                                const confirmMessage = await zk.sendMessage(from, { text: confirmMsg });

                                zk.ev.on("messages.upsert", async (confirmUpdate) => {
                                    const confirmResponse = confirmUpdate.messages[0];

                                    // Skip if the response is from the bot itself
                                    if (confirmResponse.key.fromMe) return;

                                    if (!confirmResponse.message || !confirmResponse.message.extendedTextMessage) return;

                                    const confirmText = confirmResponse.message.extendedTextMessage.text.trim();
                                    if (confirmResponse.message.extendedTextMessage.contextInfo &&
                                        confirmResponse.message.extendedTextMessage.contextInfo.stanzaId === confirmMessage.key.id) {

                                        const confirmIndex = parseInt(confirmText);
                                        if (confirmIndex === 1) {
                                            const sessionInstructions = `Please scan the session from the link below and send it to us along with your phone number and the settings you need:
Scan Here
> https://www.ibrahimadams.site/scanner

If you're unsure how to get the session ID, refer to the explanation below.
\n⊷━─────────────────────━⊷\n\n
*📖 HOW TO GET BWM XMD SESSION:*\n\n` +
                                                `1️⃣ **Open the link below**\n\n> https://www.ibrahimadams.site/scanner\n\n` +
                                                `2️⃣ **Enter Your WhatsApp Number**\n\n` +
                                                `👉 Type your WhatsApp number with your country code without (+) (e.g., 254xxxxxxxx) and tap **Submit**.\n\n` +
                                                `3️⃣ **Receive a Code**\n\n` +
                                                `👉 Ibrahim Tech will send a short code, Copy it to your keyboard.\n\n` +
                                                `4️⃣ **Check WhatsApp Notification**\n\n` +
                                                `👉 WhatsApp will notify you. Tap on the notification and enter the code sent by Ibrahim Tech.\n\n` +
                                                `5️⃣ **Wait for the Session**\n\n` +
                                                `👉 After loading, it will link then Ibrahim Tech will send a session to your WhatsApp number.\n\n` +
                                                `6️⃣ **Copy and Share the Session**\n\n` +
                                                `👉 Copy the long session and send it to me.\n\n` +
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
                                    }
                                });
                            }
                        }
                    });
                } else {
                    // Handle other services
                    let serviceMsg = "Please reply with your budget for this service.";
                    const serviceMessage = await zk.sendMessage(from, { text: serviceMsg });

                    zk.ev.on("messages.upsert", async (serviceUpdate) => {
                        const serviceResponse = serviceUpdate.messages[0];

                        // Skip if the response is from the bot itself
                        if (serviceResponse.key.fromMe) return;

                        if (!serviceResponse.message || !serviceResponse.message.extendedTextMessage) return;

                        const serviceText = serviceResponse.message.extendedTextMessage.text.trim();
                        if (serviceResponse.message.extendedTextMessage.contextInfo &&
                            serviceResponse.message.extendedTextMessage.contextInfo.stanzaId === serviceMessage.key.id) {

                            zk.sendMessage(from, { text: "🌎 Please wait a minute while we connect you to an available customer care representative.✅" });
                        }
                    });
                }
            }
        });
    });
}

main();
