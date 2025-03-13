"use strict";

// Import Dependencies
const {
    default: makeWASocket,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    makeInMemoryStore
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const conf = require("./config");
const axios = require("axios");
const zlib = require("zlib");
const boom = require("@hapi/boom");
const moment = require("moment-timezone");
const { exec } = require("child_process");
require("dotenv").config({ path: "./config.env" });

// Logger
const logger = pino({ level: "silent" });

// Initialize Session
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
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        getMessage: async (key) => store.loadMessage(key.remoteJid, key.id).then(msg => msg?.message)
    });

    store.bind(zk.ev);

    // Load Commands
    const commands = new Map();
    const commandsPath = path.join(__dirname, "scs");

    function loadCommands() {
        fs.readdirSync(commandsPath).forEach((file) => {
            if (file.endsWith(".js")) {
                const command = require(path.join(commandsPath, file));
                commands.set(command.name, command);
            }
        });
        console.log(`✅ Loaded ${commands.size} commands from scs/ folder.`);
    }
    loadCommands();

    // Event Listeners

    // Message Handler
    zk.ev.on("messages.upsert", async (m) => {
        for (const ms of m.messages) {
            if (!ms.message) return;
            const from = ms.key.remoteJid;
            const text = ms.message.conversation || ms.message.extendedTextMessage?.text || "";

            // Rate Limit
            if (!rateLimitCheck(from)) return;

            // Command Handling
            if (text.startsWith(conf.PREFIXE)) {
                const args = text.slice(conf.PREFIXE.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();
                if (commands.has(commandName)) {
                    commands.get(commandName).execute(zk, ms, args);
                }
            }

            // Anti-Link System
            if (conf.ANTILINK_GROUP === "yes" && from.endsWith("@g.us") && /\bhttps?:\/\/\S+/i.test(text)) {
                await zk.sendMessage(from, { delete: ms.key });
                await zk.groupParticipantsUpdate(from, [ms.key.participant], "remove");
            }
        }
    });

    // Group Updates
    zk.ev.on("groups.update", async (updates) => {
        for (const update of updates) {
            const metadata = await getGroupMetadata(zk, update.id);
            console.log(`Updated group: ${metadata?.subject || "Unknown"}`);
        }
    });

    // Call Blocking
    zk.ev.on("call", async (callData) => {
        if (conf.ANTICALL === "yes") {
            const callerId = callData[0].from;
            await zk.rejectCall(callData[0].id, callerId);
            setTimeout(async () => {
                await zk.sendMessage(callerId, { text: "🚫 Calls are not allowed. Please send a message instead." });
            }, 1000);
        }
    });

    // Reactions
    zk.ev.on("messages.upsert", async (m) => {
        for (const ms of m.messages) {
            if (!ms.message?.conversation) return;
            await zk.sendMessage(ms.key.remoteJid, {
                react: { text: getReaction(ms.message.conversation), key: ms.key }
            });
        }
    });

    console.log("✅ Bot is running and connected to WhatsApp!");
}

// Utility Functions

const rateLimit = new Map();
function rateLimitCheck(jid) {
    const now = Date.now();
    if (rateLimit.has(jid) && now - rateLimit.get(jid) < 3000) return false;
    rateLimit.set(jid, now);
    return true;
}

const emojiMap = { hello: ["👋", "😊"], bye: ["👋", "😢"] };
function getReaction(text) {
    return emojiMap[text.toLowerCase()]?.[Math.floor(Math.random() * emojiMap[text.toLowerCase()].length)] || "🙂";
}

async function getGroupMetadata(zk, groupId) {
    const cache = new Map();
    if (cache.has(groupId)) return cache.get(groupId);
    try {
        const metadata = await zk.groupMetadata(groupId);
        cache.set(groupId, metadata);
        setTimeout(() => cache.delete(groupId), 60000);
        return metadata;
    } catch {
        return null;
    }
}

// Start the Bot
main();
