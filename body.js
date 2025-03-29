
/*/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱//
______     __     __     __    __        __  __     __    __     _____    
/\  == \   /\ \  _ \ \   /\ "-./  \      /\_\_\_\   /\ "-./  \   /\  __-.  
\ \  __<   \ \ \/ ".\ \  \ \ \-./\ \     \/_/\_\/_  \ \ \-./\ \  \ \ \/\ \ 
 \ \_____\  \ \__/".~\_\  \ \_\ \ \_\      /\_\/\_\  \ \_\ \ \_\  \ \____- 
  \/_____/   \/_/   \/_/   \/_/  \/_/      \/_/\/_/   \/_/  \/_/   \/____/ 
                                                                           
/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰/*/
    



                   
const { default: makeWASocket, isJidGroup, DisconnectReason, getMessageText, commandRegistry, delay, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, useMultiFileAuthState, makeInMemoryStore, jidDecode, getContentType } = require("@whiskeysockets/baileys");
const logger = require("@whiskeysockets/baileys/lib/Utils/logger").default.child({});
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const conf = require("./config");
const axios = require("axios");
const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");
const FileType = require("file-type");
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
const { verifierEtatJid, recupererActionJid } = require("./lib/antilien");
const { getSettings } = require("./utils/settings");
const evt = require("./Ibrahim/adams");
const rateLimit = new Map();
const chalk = require("chalk");
const { reagir } = require("./Ibrahim/app");
const express = require("express");
const { exec } = require("child_process");
const http = require("http");
const zlib = require('zlib');
const PREFIX = conf.PREFIX;
const more = String.fromCharCode(8206);
const herokuAppName = process.env.HEROKU_APP_NAME || "Unknown App Name";
const herokuAppLink = process.env.HEROKU_APP_LINK || `https://dashboard.heroku.com/apps/${herokuAppName}`;
const botOwner = process.env.NUMERO_OWNER || "Unknown Owner";
const PORT = process.env.PORT || 3000;
const app = express();
let adams;
require("dotenv").config({ path: "./config.env" });
logger.level = "silent";
app.use(express.static("public"));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.listen(PORT, () => console.log(`Bwm xmd is starting with a speed of ${PORT}ms🚀`));


//============================================================================//


function atbverifierEtatJid(jid) {
    if (!jid.endsWith('@s.whatsapp.net')) {
        console.error('Your verified by Sir Ibrahim Adams', jid);
        return false;
    }
    console.log('Welcome to bwm xmd', jid);
    return true;
}

async function authentification() {
    try {
        if (!fs.existsSync(__dirname + "/Session/creds.json")) {
            console.log("Bwm xmd session connected ✅");
            // Split the session strihhhhng into header and Base64 data
            const [header, b64data] = conf.session.split(';;;'); 

            // Validate the session format
            if (header === "BWM-XMD" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64'); // Decode and truncate
                let decompressedData = zlib.gunzipSync(compressedData); // Decompress session
                fs.writeFileSync(__dirname + "/Session/creds.json", decompressedData, "utf8"); // Save to file
            } else {
                throw new Error("Invalid session format");
            }
        } else if (fs.existsSync(__dirname + "/Session/creds.json") && conf.session !== "zokk") {
            console.log("Updating existing session...");
            const [header, b64data] = conf.session.split(';;;'); 

            if (header === "BWM-XMD" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                let decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(__dirname + "/Session/creds.json", decompressedData, "utf8");
            } else {
                throw new Error("Invalid session format");
            }
        }
    } catch (e) {
        console.log("Session Invalid: " + e.message);
        return;
    }
}
module.exports = { authentification };
authentification();


//===============================================================================//

const store = makeInMemoryStore({
    logger: pino().child({ level: "silent", stream: "store" })
});

let zk;

async function main() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/Session");
    
    const sockOptions = {
        version,
        logger: pino({ level: "silent" }),
        browser: ['BWM XMD', "safari", "1.0.0"],
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg.message || undefined;
            }
            return { conversation: 'Error occurred' };
        }
    };

    adams = makeWASocket(sockOptions);
    store.bind(adams.ev);

    // Silent Rate Limiting
    function isRateLimited(jid) {
        const now = Date.now();
        if (!rateLimit.has(jid)) {
            rateLimit.set(jid, now);
            return false;
        }
        const lastRequestTime = rateLimit.get(jid);
        if (now - lastRequestTime < 3000) return true;
        rateLimit.set(jid, now);
        return false;
    }

    // Group Metadata Handling
    const groupMetadataCache = new Map();
    async function getGroupMetadata(groupId) {
        if (groupMetadataCache.has(groupId)) {
            return groupMetadataCache.get(groupId);
        }
        try {
            const metadata = await zk.groupMetadata(groupId);
            groupMetadataCache.set(groupId, metadata);
            setTimeout(() => groupMetadataCache.delete(groupId), 60000);
            return metadata;
        } catch (error) {
            if (error.message.includes("rate-overlimit")) {
                await new Promise(res => setTimeout(res, 5000));
            }
            return null;
        }
    }

 //============================================================================//

// Modified message handler
adams.ev.on("messages.upsert", async ({ messages }) => {
    const message = messages[0];
    if (!message?.message || message.key.fromMe) return;

    const text = getMessageText(message.message);
    if (!text?.startsWith(conf.PREFIX)) return;

    const [cmd, ...args] = text.slice(conf.PREFIX.length).split(/\s+/);
    const command = commandRegistry.get(cmd.toLowerCase());

    if (command) {
        await command.execute({
            adams,
            message,
            args,
            store,
            listenerManager,
            commandRegistry,
            config: conf
        });
    }
});

 //==============================================================================//

// Listener Manager Class
class ListenerManager {
    constructor() {
        this.activeListeners = new Map();
    }

    async loadListeners(adams, store, commands) {
        const listenerDir = path.join(__dirname, 'bwmxmd');
        
        // Clear existing listeners first
        this.cleanupListeners();
        
        // Load new listeners
        const files = fs.readdirSync(listenerDir).filter(f => f.endsWith('.js'));
        
        for (const file of files) {
            try {
                const listenerPath = path.join(listenerDir, file);
                const { setup } = require(listenerPath);
                
                if (typeof setup === 'function') {
                    const cleanup = await setup(adams, { 
                        store,
                        commands,
                        logger,
                        config: conf
                    });
                    
                    this.activeListeners.set(file, cleanup);
                    console.log(`Loaded listener: ${file}`);
                }
            } catch (e) {
                console.error(`Error loading listener ${file}: ${e.message}`);
            }
        }
    }

    cleanupListeners() {
        for (const [name, cleanup] of this.activeListeners) {
            try {
                if (typeof cleanup === 'function') cleanup();
            } catch (e) {
                console.error(`Error cleaning up listener ${name}: ${e.message}`);
            }
        }
        this.activeListeners.clear();
    }
}

// Initialize listener manager
const listenerManager = new ListenerManager();

// Add to connection handler
adams.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') {
        // Load listeners when connected
        listenerManager.loadListeners(adams, store, commandRegistry)
            .then(() => console.log('All listeners initialized'))
            .catch(console.error);
    }
    
    if (connection === 'close') {
        // Cleanup listeners on disconnect
        listenerManager.cleanupListeners();
    }
});

// Optional: Hot reload listeners when files change
fs.watch(path.join(__dirname, 'bwmxmd'), (eventType, filename) => {
    if (eventType === 'change' && filename.endsWith('.js')) {
        console.log(`Reloading listener: ${filename}`);
        delete require.cache[require.resolve(path.join(__dirname, 'bwmxmd', filename))];
        listenerManager.loadListeners(adams, store, commandRegistry);
    }
});

 //============================================================================================================

const PRESENCE = conf.ETAT;
const BOT_OWNER = conf.NUMERO_OWNER;
const SUDO_NUMBERS = ['254710772666', '254710772666', '254710772666', '254710772666'];

// Core Utilities
const decodeJid = (jid) => {
    if (!jid) return jid;
    const decoded = jidDecode(jid);
    return decoded ? `${decoded.user}@${decoded.server}` : jid;
};


// Command System
class CommandHandler {
    constructor() {
        this.commands = new Map();
        this.loadCommands();
    }

    loadCommands() {
        console.log("Loading bwm xmd Commands ♻️\n");
        const cmdDir = path.join(__dirname, "commands");
        
        fs.readdirSync(cmdDir).forEach(file => {
            if (path.extname(file).toLowerCase() === ".js") {
                try {
                    const cmd = require(path.join(cmdDir, file));
                    this.commands.set(cmd.name.toLowerCase(), cmd);
                    console.log(`${file} loaded Successfully 🚀`);
                } catch (e) {
                    console.error(`${file} Failed: ${e.message}`);
                }
            }
        });
    }

    async handleMessage(msg) {
        const content = this.getMessageContent(msg);
        if (!content?.startsWith(PREFIX)) return;

        const [cmdName, ...args] = content.slice(PREFIX.length).trim().split(/ +/);
        const command = this.commands.get(cmdName.toLowerCase());

        if (command) {
            await this.executeCommand(command, msg, args);
        }
    }

    getMessageContent(msg) {
        const type = Object.keys(msg.message)[0];
        return {
            conversation: () => msg.message.conversation,
            imageMessage: () => msg.message.imageMessage?.caption,
            videoMessage: () => msg.message.videoMessage?.caption,
            extendedTextMessage: () => msg.message.extendedTextMessage?.text
        }[type]?.() || "";
    }

    async executeCommand(command, msg, args) {
        try {
            const context = this.createContext(msg);
            await command.execute({ adams, args, ...context });
        } catch (e) {
            console.error(`Command Error [${command.name}]: ${e.message}`);
        }
    }

    createContext(msg) {
        const sender = decodeJid(msg.key.participant || msg.key.remoteJid);
        const isOwner = [BOT_OWNER, ...SUDO_NUMBERS]
            .map(num => num.replace(/\D/g, "") + "@s.whatsapp.net")
            .includes(sender);

        return {
            sender,
            isOwner,
            isGroup: msg.key.remoteJid.endsWith("@g.us"),
            reply: (text) => adams.sendMessage(msg.key.remoteJid, { text }, { quoted: msg })
        };
    }
}

// Presence Manager
class PresenceManager {
    static states = {
        1: "available",
        2: "composing",
        3: "recording",
        default: "unavailable"
    };

    static async updateState(adams, jid) {
        await adams.sendPresenceUpdate(this.states[PRESENCE] || this.states.default, jid);
    }
}

// Main Execution Flow
(async () => {
    const cmdHandler = new CommandHandler();

    adams.ev.on("connection.update", async (update) => {
        if (update.connection === "open") {
            console.log("Bwm xmd online running 🌎");
            await PresenceManager.updateState(adams, "status@broadcast");
        }
    });

    adams.ev.on("messages.upsert", async ({ messages }) => {
        const [msg] = messages;
        if (msg.key.fromMe) return;

        await cmdHandler.handleMessage(msg);
        await PresenceManager.updateState(adams, msg.key.remoteJid);
    });
})();

 
//===============================================================================================================//


    // Event Handlers
    adams.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "connecting") console.log("Connecting...");
        if (connection === "open") {
            console.log("Connected successfully");
            // Initialize bot commands and status
        }
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Connection closed, reconnecting...");
            if (shouldReconnect) main();
        }
    });

    adams.ev.on("creds.update", saveCreds);

    // Message Handling
    adams.ev.on("messages.upsert", async ({ messages }) => {
        const ms = messages[0];
        if (!ms.message) return;
        
        // Message processing logic here
    });
}

setTimeout(() => {
    main().catch(err => console.log("Initialization error:", err));
}, 5000);


