
/*/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱//
______     __     __     __    __        __  __     __    __     _____    
/\  == \   /\ \  _ \ \   /\ "-./  \      /\_\_\_\   /\ "-./  \   /\  __-.  
\ \  __<   \ \ \/ ".\ \  \ \ \-./\ \     \/_/\_\/_  \ \ \-./\ \  \ \ \/\ \ 
 \ \_____\  \ \__/".~\_\  \ \_\ \ \_\      /\_\/\_\  \ \_\ \ \_\  \ \____- 
  \/_____/   \/_/   \/_/   \/_/  \/_/      \/_/\/_/   \/_/  \/_/   \/____/ 
                                                                           
/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰/*/


const { default: makeWASocket, isJidGroup, downloadAndSaveMediaMessage, superUser, imageMessage, CommandSystem, repondre,  verifierEtatJid, recupererActionJid, DisconnectReason, getMessageText, commandRegistry, delay, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, useMultiFileAuthState, makeInMemoryStore, jidDecode, proto, getContentType } = require("@whiskeysockets/baileys");
const SUDO_NUMBERS = ["254727716045","254710772666"].map(num => num + "@s.whatsapp.net");
const { createContext } = require("./utils/helper");
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
require("dotenv").config({ path: "./config.env" });
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

// Initialize store
const store = makeInMemoryStore({ 
    logger: pino().child({ level: "silent", stream: "store" })
});

// Listener Manager Class
class ListenerManager {
    constructor() {
        this.activeListeners = new Map();
    }

    async loadListeners(adams, store, commands) {
        const listenerDir = path.join(__dirname, 'bwmxmd');
        
        try {
            // Clear existing listeners first
            this.cleanupListeners();
            
            // Load new listeners
            const files = fs.readdirSync(listenerDir).filter(f => f.endsWith('.js'));
            
            for (const file of files) {
                try {
                    const listenerPath = path.join(listenerDir, file);
                    delete require.cache[require.resolve(listenerPath)]; // Ensure fresh require
                    const { setup } = require(listenerPath);
                    
                    if (typeof setup === 'function') {
                        const cleanup = await setup(adams, { 
                            store,
                            commands,
                            logger: pino({ level: "debug" }),
                            config: {}
                        });
                        
                        this.activeListeners.set(file, cleanup);
                        console.log(`✅ Loaded listener: ${file}`);
                    }
                } catch (e) {
                    console.error(`❌ Error loading listener ${file}:`, e.message);
                }
            }
        } catch (e) {
            console.error('⚠️ Listener loading failed:', e);
        }
    }

    cleanupListeners() {
        for (const [name, cleanup] of this.activeListeners) {
            try {
                if (typeof cleanup === 'function') cleanup();
                console.log(`♻️ Cleaned up listener: ${name}`);
            } catch (e) {
                console.error(`❌ Error cleaning up listener ${name}:`, e.message);
            }
        }
        this.activeListeners.clear();
    }
}

// Initialize listener manager
const listenerManager = new ListenerManager();
let adams = null; // Global socket instance

async function connectToWhatsApp() {
    try {
        console.log('🔌 Initializing WhatsApp connection...');
        
        // Get latest WhatsApp version
        const { version } = await fetchLatestBaileysVersion();
        
        // Initialize auth state (using your preferred path format)
        const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/Session");
        
        // Create logger
        const logger = pino({ level: "debug" });
        
        // Socket configuration
        const sockOptions = {
            version,
            logger,
            browser: ['BWM XMD', "safari", "1.0.0"], // Your preferred browser info
            printQRInTerminal: true,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger)
            },
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id);
                    return msg?.message || undefined;
                }
                return { conversation: 'Message not found' };
            },
            // Recommended additional options
            shouldSyncHistoryMessage: () => true,
            syncFullHistory: false,
            linkPreviewImageThumbnailWidth: 192
        };

        // Create socket instance
        adams = makeWASocket(sockOptions);
        
        // Verify socket creation
        if (!adams?.ev) {
            throw new Error('Socket initialization failed - no event emitter');
        }

        // Bind store to events
        store.bind(adams.ev);
        
        // Handle credentials update
        adams.ev.on('creds.update', saveCreds);
        
        // Handle connection updates
        adams.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'open') {
                console.log('✅ Connected to WhatsApp!');
                // Initialize your listeners here
                listenerManager.loadListeners(adams, store, commandRegistry)
                    .then(() => console.log('🎧 All listeners initialized'))
                    .catch(err => console.error('Listener init error:', err));
            }
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(`🔌 Connection closed. Reconnecting: ${shouldReconnect}`);
                
                if (shouldReconnect) {
                    setTimeout(connectToWhatsApp, 5000);
                }
                
                // Cleanup listeners
                listenerManager.cleanupListeners();
            }
        });

        // Message handling
        adams.ev.on('messages.upsert', ({ messages }) => {
            console.log('📩 New message:', messages[0]?.message?.conversation);
        });

        return adams;
        
    } catch (error) {
        console.error('⚠️ Connection error:', error);
        setTimeout(connectToWhatsApp, 10000);
        return null;
    }
}

// Hot reload listeners when files change
function setupHotReload() {
    const listenerDir = path.join(__dirname, 'bwmxmd');
    fs.watch(listenerDir, (eventType, filename) => {
        if (filename && eventType === 'change' && filename.endsWith('.js')) {
            console.log(`🔄 Reloading listener: ${filename}`);
            listenerManager.loadListeners(adams, store, commandRegistry);
        }
    });
    console.log('🔥 Hot reload enabled for listeners');
}

// Start the bot
(async () => {
    // First connection attempt
    await connectToWhatsApp();
    
    // Setup hot reload
    setupHotReload();
    
    // Handle process exit
    process.on('SIGINT', () => {
        console.log('🛑 Shutting down gracefully...');
        listenerManager.cleanupListeners();
        process.exit(0);
    });
})();


 

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
adams.ev.on('messages.upsert', async ({ messages, type }) => {
    try {
        // Validate message type
        if (type !== 'notify') return;
        
        const ms = messages[0];
        if (!ms?.message || !ms?.key) return;

        // Improved JID handling
        const decodeJid = (jid) => {
            if (!jid) return '';
            if (typeof jid === 'string') return jid;
            return jid.decodeJid?.() || jid.user || '';
        };

        // Core message info
        const origineMessage = ms.key.remoteJid || '';
        const idBot = decodeJid(adams.user?.id);
        const botJid = idBot.includes('@') ? idBot : `${idBot}@s.whatsapp.net`;
        const verifGroupe = origineMessage.endsWith('@g.us');
        
        // Group metadata handling
        let infosGroupe = null;
        let nomGroupe = '';
        if (verifGroupe) {
            try {
                infosGroupe = await adams.groupMetadata(origineMessage);
                nomGroupe = infosGroupe?.subject || '';
            } catch (err) {
                console.error('Group metadata error:', err);
            }
        }

        // Quoted message handling
        const quotedMsg = ms.message?.extendedTextMessage?.contextInfo;
        const msgRepondu = quotedMsg?.quotedMessage || null;
        const auteurMsgRepondu = decodeJid(quotedMsg?.participant);
        const mentionedJids = quotedMsg?.mentionedJid || [];

        // Author determination
        let auteurMessage = verifGroupe 
            ? decodeJid(ms.key.participant || ms.participant) || origineMessage
            : origineMessage;
        if (ms.key.fromMe) auteurMessage = botJid;

        // Permission system
        const superUser = [
            `${conf.OWNER_NUMBER}@s.whatsapp.net`,
            botJid,
            ...(SUDO_NUMBERS || [])
        ].includes(auteurMessage);

        let verifAdmin = false;
        let botIsAdmin = false;
        if (verifGroupe && infosGroupe?.participants) {
            const admins = infosGroupe.participants
                .filter(p => p?.admin)
                .map(p => decodeJid(p.id));
            verifAdmin = admins.includes(auteurMessage);
            botIsAdmin = admins.includes(botJid);
        }

        // Message content extraction (fixed regex)
        const messageType = Object.keys(ms.message)[0];
        const texte = ms.message.conversation || 
                     ms.message.extendedTextMessage?.text || 
                     ms.message[messageType]?.caption || '';

        // Fixed command parsing (regex fix)
        if (typeof texte === 'string' && texte.startsWith(PREFIX)) {
            const args = texte.slice(PREFIX.length).trim().split(/\s+/);
            const com = args[0]?.toLowerCase();
            if (!com) return;

            const cmd = Array.isArray(evt.cm) 
                ? evt.cm.find(c => c?.nomCom === com || c?.aliases?.includes(com))
                : null;
            if (!cmd) return;

            try {
                // Permission check
                if (!superUser && conf.MODE?.toLowerCase() !== "yes") {
                    console.log(`Command blocked: ${auteurMessage}`);
                    return;
                }

                // Enhanced reply function
                const repondre = async (text, options = {}) => {
                    try {
                        await adams.sendMessage(origineMessage, {
                            text: String(text),
                            ...createContext(auteurMessage, {
                                title: options.title || nomGroupe || "BWM-XMD",
                                body: options.body || "",
                                thumbnail: options.thumbnail
                            })
                        }, { quoted: ms });
                    } catch (err) {
                        console.error('Reply failed:', err);
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
                        console.error('Reaction failed:', err);
                    }
                }

                // Execute command with full context
                await cmd.fonction(origineMessage, adams, {
                    ms,
                    arg: args.slice(1),
                    repondre,
                    superUser,
                    verifAdmin,
                    botIsAdmin,
                    verifGroupe,
                    infosGroupe,
                    nomGroupe,
                    auteurMessage,
                    utilisateur: mentionedJids[0] || auteurMsgRepondu || '',
                    membreGroupe: verifGroupe ? decodeJid(ms.key.participant) : '',
                    origineMessage,
                    msgRepondu,
                    auteurMsgRepondu
                });

            } catch (error) {
                console.error(`Command [${com}] error:`, error);
                try {
                    await adams.sendMessage(origineMessage, {
                        text: `🚨 Error: ${error.message}`,
                        ...createContext(auteurMessage, {
                            title: "Command Failed",
                            body: "Please try again"
                        })
                    }, { quoted: ms });
                } catch (sendErr) {
                    console.error('Error feedback failed:', sendErr);
                }
            }
        }
    } catch (globalErr) {
        console.error('Global message handler error:', globalErr);
    }
});

// Additional required functions for Baileys v5+
function getMessageType(message) {
    if (!message) return null;
    const type = Object.keys(message)[0];
    return type === 'conversation' ? 'text' : type;
}

function getMessageContent(message) {
    const type = getMessageType(message);
    if (!type) return null;
    
    switch(type) {
        case 'text':
        case 'conversation':
            return message.conversation;
        case 'extendedTextMessage':
            return message.extendedTextMessage.text;
        case 'imageMessage':
        case 'videoMessage':
        case 'documentMessage':
            return message[type]?.caption || '';
        default:
            return null;
    }
} 
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
            //adams.newsletterFollow("120363285388090068@newsletter");
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
