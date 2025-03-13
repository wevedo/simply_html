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

    // Load Commands
    console.log("Loading Bwm xmd Commands ...\n");
    let commands = [];
    fs.readdirSync(__dirname + "/scs").forEach((file) => {
        if (path.extname(file).toLowerCase() === ".js") {
            try {
                let cmd = require(__dirname + "/scs/" + file);
                commands.push(cmd);
                console.log(file + " Installed Successfully✔️");
            } catch (e) {
                console.log(`${file} could not be installed due to: ${e}`);
            }
        }
    });

    // Command Execution Function
    async function executeCommand(ms, from, sender, messageText) {
        const prefix = conf.PREFIXE || "!";  // Default to "!" if PREFIXE is not set
        if (!messageText.startsWith(prefix)) return;

        const args = messageText.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = commands.find(cmd => cmd.nomCom === commandName);
        if (command) {
            try {
                if (conf.MODE.toLowerCase() !== 'yes' && sender !== conf.NUMERO_OWNER) {
                    return;
                }

                await command.execute(zk, ms, args, sender);
            } catch (error) {
                console.log(`Error executing ${commandName}: ${error}`);
                await zk.sendMessage(from, { text: "⚠️ Command execution failed!" });
            }
        }
    }

    // Rate Limiting
    const rateLimit = new Map();
    function isRateLimited(jid) {
        const now = Date.now();
        if (rateLimit.has(jid) && now - rateLimit.get(jid) < 3000) return true;
        rateLimit.set(jid, now);
        return false;
    }

    // Message Listener
    zk.ev.on("messages.upsert", async (m) => {
        for (const ms of m.messages) {
            if (!ms.message) return;
            const from = ms.key.remoteJid;
            const sender = ms.key.participant || ms.key.remoteJid;
            if (isRateLimited(from)) return;

            const messageType = Object.keys(ms.message)[0];
            const messageText = ms.message.conversation || ms.message.extendedTextMessage?.text || "";

            // Execute Commands
            await executeCommand(ms, from, sender, messageText);

            // Anti-Link Feature
            if (conf.ANTILINK_GROUP === "yes" && from.endsWith("@g.us") && /\bhttps?:\/\/\S+/i.test(messageText)) {
                await zk.sendMessage(from, { delete: ms.key });
                await zk.groupParticipantsUpdate(from, [sender], "remove");
            }

            // Auto-Reply to Messages
            if (conf.CHATBOT === "yes") {
                const botReply = await getChatbotResponse(messageText);
                if (botReply) {
                    await zk.sendMessage(from, { text: botReply }, { quoted: ms });
                }
            }
        }
    });

    // Function to Fetch Chatbot Response
    async function getChatbotResponse(query) {
        try {
            const res = await axios.get(`https://api.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(query)}`);
            return res.data.result || null;
        } catch {
            return null;
        }
    }

    // Group Update Listener
    zk.ev.on("groups.update", async (updates) => {
        for (const update of updates) {
            console.log(`Updated group: ${update.id}`);
        }
    });

    // Call Blocking Feature
    zk.ev.on("call", async (callData) => {
        if (conf.ANTICALL === "yes") {
            const callerId = callData[0].from;
            await zk.rejectCall(callData[0].id, callerId);
            setTimeout(async () => {
                await zk.sendMessage(callerId, { text: "🚫 Calls are not allowed. Please send a message instead." });
            }, 1000);
        }
    });

    // Auto-Reactions
    const emojiMap = { hello: ["👋", "😊"], bye: ["👋", "😢"] };
    function getReaction(text) {
        return emojiMap[text.toLowerCase()]?.[Math.floor(Math.random() * emojiMap[text.toLowerCase()].length)] || "🙂";
    }
    zk.ev.on("messages.upsert", async (m) => {
        for (const ms of m.messages) {
            if (!ms.message?.conversation) return;
            await zk.sendMessage(ms.key.remoteJid, { react: { text: getReaction(ms.message.conversation), key: ms.key } });
        }
    });

    console.log("✅ Bwm XMD is now connected to WhatsApp!");
}
main();
