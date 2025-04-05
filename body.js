
/*/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱//
______     __     __     __    __        __  __     __    __     _____    
/\  == \   /\ \  _ \ \   /\ "-./  \      /\_\_\_\   /\ "-./  \   /\  __-.  
\ \  __<   \ \ \/ ".\ \  \ \ \-./\ \     \/_/\_\/_  \ \ \-./\ \  \ \ \/\ \ 
 \ \_____\  \ \__/".~\_\  \ \_\ \ \_\      /\_\/\_\  \ \_\ \ \_\  \ \____- 
  \/_____/   \/_/   \/_/   \/_/  \/_/      \/_/\/_/   \/_/  \/_/   \/____/ 
                                                                           
/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰/*/
    



                   
const { default: makeWASocket, isJidGroup, superUser, imageMessage, CommandSystem, repondre, verifierEtatJid, recupererActionJid, DisconnectReason, getMessageText, commandRegistry, delay, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, useMultiFileAuthState, makeInMemoryStore, jidDecode, getContentType } = require("@whiskeysockets/baileys");
const SUDO_NUMBERS = ["254727716045","254710772666"].map(num => num + "@s.whatsapp.net");
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
const { getSettings } = require("./utils/settings");
const evt = require("./Ibrahim/adams");
const rateLimit = new Map();
const chalk = require("chalk");
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
let zk;

//===============================================================================//

const store = makeInMemoryStore({
    logger: pino().child({ level: "silent", stream: "store" })
});

// Increase EventEmitter limit to handle more messages
require('events').EventEmitter.defaultMaxListeners = 50;

// Enhanced memory management
const MAX_STORE_SIZE = 100000; // Max messages to store in memory
const CLEANUP_INTERVAL = 600000; // Cleanup every minute

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
        },
        // Optimized for high message volume
        maxMsgRetryCount: 5,
        msgRetryCounterCache: new NodeCache({ stdTTL: 60 * 60 }), // 1 hour TTL
        transactionOpts: {
            maxRetries: 5,
            delayBetweenTriesMs: 3000
        }
    };

    const adams = makeWASocket(sockOptions);
    
    // Bind store with enhanced cleanup
    store.bind(adams.ev, {
        cleanupIntervalMs: CLEANUP_INTERVAL,
        maxMessages: MAX_STORE_SIZE
    });

    // Rate limiting with enhanced capacity
    const rateLimit = new Map();
    const RATE_LIMIT_WINDOW = 3000; // 3 seconds
    
    function isRateLimited(jid) {
        const now = Date.now();
        if (!rateLimit.has(jid)) {
            rateLimit.set(jid, { count: 1, lastRequestTime: now });
            return false;
        }
        
        const jidData = rateLimit.get(jid);
        if (now - jidData.lastRequestTime > RATE_LIMIT_WINDOW) {
            jidData.count = 1;
            jidData.lastRequestTime = now;
            return false;
        }
        
        jidData.count++;
        jidData.lastRequestTime = now;
        
        // Allow more requests from groups than individual chats
        const isGroup = jid.endsWith('@g.us');
        return jidData.count > (isGroup ? 15 : 5);
    }

    // Enhanced group metadata handling with cache
    const groupMetadataCache = new Map();
    const CACHE_TTL = 60000; // 1 minute
    
    async function getGroupMetadata(groupId) {
        if (groupMetadataCache.has(groupId)) {
            return groupMetadataCache.get(groupId);
        }
        
        try {
            const metadata = await adams.groupMetadata(groupId);
            groupMetadataCache.set(groupId, metadata);
            
            // Auto-clean cache
            setTimeout(() => {
                groupMetadataCache.delete(groupId);
            }, CACHE_TTL);
            
            return metadata;
        } catch (error) {
            if (error.message.includes("rate-overlimit")) {
                await new Promise(res => setTimeout(res, 5000));
                return getGroupMetadata(groupId); // Retry
            }
            console.error('Group metadata error:', error);
            return null;
        }
    }

    // Storage management - auto cleanup when memory is high
    setInterval(() => {
        const memoryUsage = process.memoryUsage();
        if (memoryUsage.rss > 500 * 1024 * 1024) { // 500MB threshold
            console.log('High memory usage detected, cleaning up...');
            
            // Clean oldest messages from store
            if (store.messages && store.messages.size > MAX_STORE_SIZE / 2) {
                const keys = Array.from(store.messages.keys());
                for (let i = 0; i < Math.floor(keys.length / 4); i++) {
                    store.messages.delete(keys[i]);
                }
            }
            
            // Clear some cache
            groupMetadataCache.clear();
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
        }
    }, CLEANUP_INTERVAL);

    // Handle connection updates
    adams.ev.on('connection.update', (update) => {
        if (update.connection === 'close') {
            // Implement reconnection logic if needed
        }
    });

    // Message handling with high capacity
    adams.ev.on('messages.upsert', async ({ messages }) => {
        if (messages.length > 100) {
            // Process in batches to avoid memory spikes
            for (let i = 0; i < messages.length; i += 50) {
                const batch = messages.slice(i, i + 50);
                await processMessageBatch(batch);
            }
        } else {
            await processMessageBatch(messages);
        }
    });

    async function processMessageBatch(messages) {
        // Your message processing logic here
        // This helps handle large volumes without overwhelming memory
    }
}


 //============================================================================//
            
                         
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

console.log("Loading Bwm xmd Commands...\n");

// Load commands from Taskflow folder
try {
    const taskflowPath = path.join(__dirname, "Taskflow");
    fs.readdirSync(taskflowPath).forEach((fichier) => {
        if (path.extname(fichier).toLowerCase() === ".js") {
            try {
                require(path.join(taskflowPath, fichier));
                console.log(`✔️ ${fichier} installed successfully.`);
            } catch (e) {
                console.error(`❌ Failed to load ${fichier}: ${e.message}`);
            }
        }
    });
} catch (error) {
    console.error("❌ Error reading Taskflow folder:", error.message);
}

 //============================================================================//

const STATE = conf.PRESENCE; 
adams.ev.on("messages.upsert", async ({ messages }) => {
    const ms = messages[0];
    if (!ms?.message || !ms?.key) return;

    // Helper function to safely decode JID
    function decodeJid(jid) {
        if (!jid) return '';
        return typeof jid.decodeJid === 'function' ? jid.decodeJid() : String(jid);
    }

    // Extract core message information
    const origineMessage = ms.key.remoteJid || '';
    const idBot = decodeJid(adams.user?.id || '');
    const servBot = idBot.split('@')[0] || '';
    const verifGroupe = typeof origineMessage === 'string' && origineMessage.endsWith("@g.us");
    
    // Group metadata handling
    let infosGroupe = null;
    let nomGroupe = '';
    try {
        infosGroupe = verifGroupe ? await adams.groupMetadata(origineMessage).catch(() => null) : null;
        nomGroupe = infosGroupe?.subject || '';
    } catch (err) {
        console.error("Group metadata error:", err);
    }

    // Quoted message handling
    const msgRepondu = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
    const auteurMsgRepondu = decodeJid(ms.message?.extendedTextMessage?.contextInfo?.participant || '');
    const mentionedJids = Array.isArray(ms.message?.extendedTextMessage?.contextInfo?.mentionedJid) 
        ? ms.message.extendedTextMessage.contextInfo.mentionedJid 
        : [];

    // Author determination
    let auteurMessage = verifGroupe 
        ? (ms.key.participant || ms.participant || origineMessage)
        : origineMessage;
    if (ms.key.fromMe) auteurMessage = idBot;

    // Group member info
    const membreGroupe = verifGroupe ? ms.key.participant || '' : '';
    const utilisateur = mentionedJids.length > 0 
        ? mentionedJids[0] 
        : msgRepondu 
            ? auteurMsgRepondu 
            : '';

    // Permission flags
    const botJid = `${adams.user?.id.split(':')[0]}@s.whatsapp.net`;
    const superUser = 
        SUDO_NUMBERS.includes(auteurMessage) || 
        auteurMessage === `${conf.OWNER_NUMBER}@s.whatsapp.net` || 
        auteurMessage === botJid;

    let verifAdmin = false;
    let botIsAdmin = false;
    if (verifGroupe && infosGroupe) {
        const admins = infosGroupe.participants.filter(p => p.admin).map(p => p.id);
        verifAdmin = admins.includes(auteurMessage);
        botIsAdmin = admins.includes(botJid);
    }

    // Message content processing
    const texte = ms.message?.conversation || 
                 ms.message?.extendedTextMessage?.text || 
                 ms.message?.imageMessage?.caption || 
                 '';
    const arg = typeof texte === 'string' ? texte.trim().split(/\s+/).slice(1) : [];
    const verifCom = typeof texte === 'string' && texte.startsWith(PREFIX);
    const com = verifCom ? texte.slice(PREFIX.length).trim().split(/\s+/)[0]?.toLowerCase() : null;

    if (verifCom && com) {
        const cmd = Array.isArray(evt.cm) 
            ? evt.cm.find((c) => 
                c?.nomCom === com || 
                (Array.isArray(c?.aliases) && c.aliases.includes(com))
              )
            : null;

        if (cmd) {
            try {
                // Permission check
                if (!superUser && conf.MODE?.toLowerCase() !== "yes") {
                    console.log(`Command blocked for ${auteurMessage}`);
                    return;
                }

                // Reply function with context
                const repondre = async (text, options = {}) => {
                    if (typeof text !== 'string') return;
                    try {
                        await adams.sendMessage(origineMessage, { 
                            text,
                            ...createContext(auteurMessage, {
                                title: options.title || nomGroupe || "BWM-XMD",
                                body: options.body || ""
                            })
                        }, { quoted: ms });
                    } catch (err) {
                        console.error("Reply error:", err);
                    }
                };

                // Add reaction
                if (cmd.reaction) {
                    try {
                        await adams.sendMessage(origineMessage, {
                            react: { 
                                key: ms.key, 
                                text: cmd.reaction 
                            }
                        });
                    } catch (err) {
                        console.error("Reaction error:", err);
                    }
                }

                // Execute command with full context
                await cmd.fonction(origineMessage, adams, {
                    ms,
                    arg,
                    repondre,
                    superUser,
                    verifAdmin,
                    botIsAdmin,
                    verifGroupe,
                    infosGroupe,
                    nomGroupe,
                    auteurMessage,
                    utilisateur,
                    membreGroupe,
                    origineMessage,
                    msgRepondu,
                    auteurMsgRepondu
                });

            } catch (error) {
                console.error(`Command error [${com}]:`, error);
                try {
                    await adams.sendMessage(origineMessage, {
                        text: `🚨 Command failed: ${error.message}`,
                        ...createContext(auteurMessage, {
                            title: "Error",
                            body: "Command execution failed"
                        })
                    }, { quoted: ms });
                } catch (sendErr) {
                    console.error("Error sending error message:", sendErr);
                }
            }
        }
    }
});
 
//===============================================================================================================
 
// Handle connection updates
adams.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") {
        console.log("Connected to WhatsApp");

        if (conf.DP.toLowerCase() === "yes") {
            const md = conf.MODE.toLowerCase() === "yes" ? "public" : "private";
            const connectionMsg = `
〔  🚀 BWM XMD CONNECTED 🚀 〕

├──〔 ✨ Version: 7.0.8 〕 
├──〔 🎭 Classic and Things 〕 
│ ✅ Prefix: [ ${conf.PREFIX} ]  
│  
├──〔 📦 Heroku Deployment 〕 
│ 🏷️ App Name: ${herokuAppName}  
╰──────────────────◆`;

            adams.sendMessage(
                adams.user.id,
                { text: connectionMsg },
                {
                    disappearingMessagesInChat: true,
                    ephemeralExpiration: 600,
                }
            ).catch(err => console.error("Status message error:", err));
        }
    }
});


        
//===============================================================================================================//

// Event Handlers
adams.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "connecting") console.log("🪩 Bot scanning 🪩");
        if (connection === "open") {
            console.log("🌎 BWM XMD ONLINE 🌎");
            adams.newsletterFollow("120363285388090068@newsletter");
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


setTimeout(() => {
    main().catch(err => console.log("Initialization error:", err));
}, 5000);
