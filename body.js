/*/‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ//
______     __     __     __    __        __  __     __    __     _____    
/\  == \   /\ \  _ \ \   /\ "-./  \      /\_\_\_\   /\ "-./  \   /\  __-.  
\ \  __<   \ \ \/ ".\ \  \ \ \-./\ \     \/_/\_\/_  \ \ \-./\ \  \ \ \/\ \ 
 \ \_____\  \ \__/".~\_\  \ \_\ \ \_\      /\_\/\_\  \ \_\ \ \_\  \ \____- 
  \/_____/   \/_/   \/_/   \/_/  \/_/      \/_/\/_/   \/_/  \/_/   \/____/ 
                                                                           
/‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį‚ĖĪ‚Ėį/*/

const { default: makeWASocket, isJidGroup, downloadAndSaveMediaMessage, superUser, imageMessage, CommandSystem, repondre, verifierEtatJid, recupererActionJid, DisconnectReason, getMessageText, commandRegistry, delay, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, useMultiFileAuthState, makeInMemoryStore, jidDecode, proto, getContentType } = require("@whiskeysockets/baileys");
const SUDO_NUMBERS = ["254727716045","254710772666"].map(num => num + "@s.whatsapp.net");
const logger = require("@whiskeysockets/baileys/lib/Utils/logger").default.child({});
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
let adams;
require("dotenv").config({ path: "./config.env" });
logger.level = "silent";
app.use(express.static("public"));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.listen(PORT, () => console.log(`Bwm xmd is starting with a speed of ${PORT}msūüöÄ`));

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
            console.log("Bwm xmd session connected ‚úÖ");
            const [header, b64data] = conf.session.split(';;;'); 

            if (header === "BWM-XMD" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                let decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(__dirname + "/Session/creds.json", decompressedData, "utf8");
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

    // Listener Manager Class
    class ListenerManager {
        constructor() {
            this.activeListeners = new Map();
        }

        async loadListeners(adams, store, commands) {
            const listenerDir = path.join(__dirname, 'bwmxmd');
            this.cleanupListeners();
            
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

    const listenerManager = new ListenerManager();

    adams.ev.on('connection.update', ({ connection }) => {
        if (connection === 'open') {
            listenerManager.loadListeners(adams, store, commandRegistry)
                .then(() => console.log('All listeners initialized'))
                .catch(console.error);
        }
        
        if (connection === 'close') {
            listenerManager.cleanupListeners();
        }
    });

    fs.watch(path.join(__dirname, 'bwmxmd'), (eventType, filename) => {
        if (eventType === 'change' && filename.endsWith('.js')) {
            console.log(`Reloading listener: ${filename}`);
            delete require.cache[require.resolve(path.join(__dirname, 'bwmxmd', filename))];
            listenerManager.loadListeners(adams, store, commandRegistry);
        }
    });

    // Load commands
    console.log("Loading Bwm xmd Commands...\n");
    try {
        const taskflowPath = path.join(__dirname, "Taskflow");
        fs.readdirSync(taskflowPath).forEach((fichier) => {
            if (path.extname(fichier).toLowerCase() === ".js") {
                try {
                    require(path.join(taskflowPath, fichier));
                    console.log(`‚úĒÔłŹ ${fichier} installed successfully.`);
                } catch (e) {
                    console.error(`‚ĚĆ Failed to load ${fichier}: ${e.message}`);
                }
            }
        });
    } catch (error) {
        console.error("‚ĚĆ Error reading Taskflow folder:", error.message);
    }

    const STATE = conf.PRESENCE; 
    
                            // Message handler
    adams.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
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

            // Permission system - MODE check first
            const isPublicMode = conf.MODE?.toLowerCase() === 'yes';
            const isSuperUser = [
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

            // Message content extraction
            const messageType = getContentType(ms.message);
            const texte = ms.message.conversation || 
                         ms.message.extendedTextMessage?.text || 
                         ms.message[messageType]?.caption || '';

            // Command processing
            if (typeof texte === 'string' && texte.startsWith(PREFIX)) {
                const args = texte.slice(PREFIX.length).trim().split(/\s+/);
                const com = args[0]?.toLowerCase();
                if (!com) return;

                const cmd = Array.isArray(evt.cm) 
                    ? evt.cm.find(c => c?.nomCom === com || c?.aliases?.includes(com))
                    : null;
                if (!cmd) return;

                try {
                    // Permission check - MODE takes priority
                    if (!isPublicMode && !isSuperUser) {
                        console.log(`Command blocked for ${auteurMessage} (private mode)`);
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
                        superUser: isSuperUser,
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

  

    // Connection Handler
    adams.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === "connecting") {
            console.log("Connecting to WhatsApp...");
            return;
        }

        if (connection === "open") {
            console.log("‚ Successfully connected to WhatsApp");
            
            if (conf.DP?.toLowerCase() === "yes") {
                try {
                    const statusMsg = `
╭─❖ 「 *BWM XMD* 」  
│ ✅ *Status:* Connected  
│ 📌 *Version:* 8.3Q  
│ 🔑 *Prefix:* [ ${conf.PREFIX} ]  
╰──────────────❖ `;

                    await adams.sendMessage(
                        adams.user.id,
                        { text: statusMsg },
                        { disappearingMessagesInChat: true }
                    );
                } catch (err) {
                    console.error("Status message error:", err);
                }
            }

            try {
                const newsletterJid = "120363285388090068@newsletter";
                const newsletterExists = await adams.onWhatsApp(newsletterJid);
                
                if (newsletterExists?.exists) {
                    await adams.newsletterFollow(newsletterJid);
                    console.log(" Subscribed to newsletter");
                }
            } catch (err) {
                console.error("Newsletter error:", err);
            }
            return;
        }

        if (connection === "close") {
            console.log("‚ Connection closed");
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            
            if (shouldReconnect) {
                console.log("‚ôĽÔłŹ Attempting reconnect...");
                setTimeout(() => main(), 5000);
            }
        }
    });

    // Error handling
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
    });

    process.on('unhandledRejection', (err) => {
        console.error('Unhandled Rejection:', err);
    });
}

main().catch(err => console.error("Initialization error:", err));
