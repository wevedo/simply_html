/*/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱//
______     __     __     __    __        __  __     __    __     _____    
/\  == \   /\ \  _ \ \   /\ "-./  \      /\_\_\_\   /\ "-./  \   /\  __-.  
\ \  __<   \ \ \/ ".\ \  \ \ \-./\ \     \/_/\_\/_  \ \ \-./\ \  \ \ \/\ \ 
 \ \_____\  \ \__/".~\_\  \ \_\ \ \_\      /\_\/\_\  \ \_\ \ \_\  \ \____- 
  \/_____/   \/_/   \/_/   \/_/  \/_/      \/_/\/_/   \/_/  \/_/   \/____/ 
                                                                           
/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰/*/


const { 
    default: makeWASocket, 
    isJidGroup, 
    downloadAndSaveMediaMessage, 
    fetchMessagesFromWA, 
    superUser, 
    imageMessage, 
    CommandSystem, 
    repondre, 
    verifierEtatJid, 
    recupererActionJid, 
    DisconnectReason, 
    getMessageText, 
    commandRegistry, 
    delay, 
    makeCacheableSignalKeyStore, 
    fetchLatestBaileysVersion, 
    useMultiFileAuthState, 
    makeInMemoryStore, 
    jidDecode, 
    proto, 
    getContentType 
} = require("@fizzxydev/baileys");

const SUDO_NUMBERS = ["254727716045", "254710772666"].map(num => num + "@s.whatsapp.net");
const Pino = require("pino");
const logger = Pino({ level: "silent" });
const { createContext } = require("./utils/helper");
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

app.use(express.static("public"));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.listen(PORT, () => console.log(`Bwm xmd is starting on port ${PORT}`));

// Session Handling
async function setupSession() {
    const sessionDir = path.join(__dirname, "Session");
    
    // Create session directory if it doesn't exist
    await fs.ensureDir(sessionDir);
    
    // Check for existing session or initialize from config
    if (!fs.existsSync(path.join(sessionDir, "creds.json"))) {
        console.log("Initializing new session...");
        
        if (conf.session) {
            try {
                const [header, b64data] = conf.session.split(';;;');
                
                if (header === "BWM-XMD" && b64data) {
                    const compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                    const decompressedData = zlib.gunzipSync(compressedData);
                    await fs.writeFile(path.join(sessionDir, "creds.json"), decompressedData);
                    console.log("Session restored from config");
                }
            } catch (e) {
                console.log("Session restore failed:", e.message);
                await fs.remove(path.join(sessionDir, "creds.json"));
            }
        }
    }
    
    return sessionDir;
}

// Enhanced connection handler
async function connectToWhatsApp() {
    const sessionDir = await setupSession();
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
        version,
        logger,
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        browser: ['BWM XMD', "safari", "1.0.0"],
        markOnlineOnConnect: true,
        syncFullHistory: false,
        getMessage: async (key) => {
            return { conversation: 'Message not stored' };
        },
        shouldIgnoreJid: jid => isJidGroup(jid),
        connectTimeoutMs: 30_000,
        keepAliveIntervalMs: 10_000
    });
     store.bind(adams.ev);
    // Connection event handling
    socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, isNewLogin, qr } = update;
        console.log('Connection Update:', connection);

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== 401;
            console.log(`Connection closed, ${shouldReconnect ? 'reconnecting' : 'not reconnecting'}`);
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 5000);
            }
        } 
        else if (connection === 'open') {
            console.log('✅ Connected to WhatsApp');
            await socket.sendPresenceUpdate('available');
            
            // Test functionality
            setTimeout(() => {
                testConnection(socket).catch(console.error);
            }, 2000);
        }

        if (qr) {
            console.log('QR Code generated - scan to authenticate');
        }
    });

    socket.ev.on('creds.update', saveCreds);
    return socket;
}

// Enhanced message handler
function setupMessageHandler(socket) {
    socket.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            console.log('New message batch received');
            
            if (type !== 'notify') {
                console.log('Ignoring non-notify message');
                return;
            }

            for (const ms of messages) {
                try {
                    if (!ms?.message || !ms?.key) {
                        console.log('Invalid message structure');
                        continue;
                    }

                    const origineMessage = ms.key.remoteJid || '';
                    const isGroup = isJidGroup(origineMessage);
                    const sender = ms.key.participant || ms.key.remoteJid || '';
                    
                    console.log(`Processing message from ${sender}`);

                    // Extract message content
                    const messageType = getContentType(ms.message);
                    let texte = '';
                    
                    if (messageType === 'conversation') {
                        texte = ms.message.conversation;
                    } 
                    else if (messageType === 'extendedTextMessage') {
                        texte = ms.message.extendedTextMessage?.text || '';
                    } 
                    else if (['imageMessage', 'videoMessage', 'documentMessage'].includes(messageType)) {
                        texte = ms.message[messageType]?.caption || '';
                    }
                    
                    console.log('Message content:', texte);

                    // Command processing
                    if (texte && texte.startsWith(PREFIX)) {
                        const args = texte.slice(PREFIX.length).trim().split(/\s+/);
                        const com = args[0]?.toLowerCase();
                        
                        console.log('Command detected:', com);

                        const cmd = Array.isArray(evt.cm) 
                            ? evt.cm.find(c => c?.nomCom === com || c?.aliases?.includes(com))
                            : null;
                            
                        if (!cmd) {
                            console.log('Command not found');
                            continue;
                        }

                        // Permission check
                        const isOwner = sender === `${conf.OWNER_NUMBER}@s.whatsapp.net`;
                        const isSudo = SUDO_NUMBERS.includes(sender);
                        const isBot = sender === socket.user.id;
                        const isPublic = conf.MODE?.toLowerCase() === 'yes';
                        
                        if (!isPublic && !isOwner && !isSudo && !isBot) {
                            console.log('Command blocked - private mode');
                            continue;
                        }

                        // Execute command
                        try {
                            // Add reaction
                            if (cmd.reaction) {
                                await socket.sendMessage(origineMessage, {
                                    react: {
                                        text: cmd.reaction,
                                        key: ms.key
                                    }
                                });
                            }

                            // Prepare group info
                            let groupInfo = null;
                            if (isGroup) {
                                groupInfo = await socket.groupMetadata(origineMessage).catch(console.error);
                            }

                            // Execute command
                            await cmd.fonction(origineMessage, socket, {
                                ms,
                                arg: args.slice(1),
                                repondre: async (text, options = {}) => {
                                    await socket.sendMessage(origineMessage, {
                                        text: String(text),
                                        ...createContext(sender, {
                                            title: options.title || (groupInfo?.subject || "BWM-XMD"),
                                            body: options.body || "",
                                            thumbnail: options.thumbnail
                                        })
                                    }, { quoted: ms });
                                },
                                superUser: isOwner || isSudo || isBot,
                                verifAdmin: isGroup && groupInfo?.participants?.some(
                                    p => p.id === sender && p.admin
                                ),
                                botIsAdmin: isGroup && groupInfo?.participants?.some(
                                    p => p.id === socket.user.id && p.admin
                                ),
                                verifGroupe: isGroup,
                                infosGroupe: groupInfo,
                                nomGroupe: groupInfo?.subject || '',
                                auteurMessage: sender,
                                origineMessage
                            });

                            console.log('✅ Command executed');
                            
                        } catch (cmdError) {
                            console.error('Command failed:', cmdError);
                            await socket.sendMessage(origineMessage, {
                                text: `⚠️ Error: ${cmdError.message}`,
                                ...createContext(sender, {
                                    title: "Command Failed",
                                    body: "Please try again"
                                })
                            }, { quoted: ms });
                        }
                    }
                } catch (msgError) {
                    console.error('Message processing failed:', msgError);
                }
            }
        } catch (batchError) {
            console.error('Message batch processing failed:', batchError);
        }
    });
}

// Initialize the bot
async function startBot() {
    try {
        console.log('🚀 Starting BWM XMD...');
        adams = await connectToWhatsApp();
        
        setupMessageHandler(adams);
        
        console.log('🤖 BWM XMD is ready');
    } catch (error) {
        console.error('Startup failed:', error);
        process.exit(1);
    }
}

// Start the bot
startBot().catch(console.error);

// Connection test
async function testConnection(socket) {
    console.log('Running connection tests...');
    
    // Test 1: Send self message
    await socket.sendMessage(socket.user.id, { text: '🔍 Connection test' });
    
    // Test 2: Emulate command
    const testMsg = {
        key: { 
            remoteJid: socket.user.id, 
            fromMe: true,
            id: 'test-' + Date.now()
        },
        message: { conversation: `${PREFIX}ping` }
    };
    
    socket.ev.emit('messages.upsert', {
        messages: [testMsg],
        type: 'notify'
    });
    
    console.log('Connection tests completed');
}






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
/*
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
    });*/

    // Load commands
    console.log("Loading Bwm xmd Commands...\n");
    try {
        const taskflowPath = path.join(__dirname, "Taskflow");
        fs.readdirSync(taskflowPath).forEach((fichier) => {
            if (path.extname(fichier).toLowerCase() === ".js") {
                try {
                    require(path.join(taskflowPath, fichier));
                    console.log(`‚🚀 ${fichier} installed successfully.`);
                } catch (e) {
                    console.error(`‚😭 Failed to load ${fichier}: ${e.message}`);
                }
            }
        });
    } catch (error) {
        console.error("‚😭 Error reading Taskflow folder:", error.message);
    }

    const STATE = conf.PRESENCE; 
    
/*
// Debug configuration
const DEBUG_MODE = true;
const TEST_ON_CONNECT = true;

function debugLog(...args) {
    if (DEBUG_MODE) console.log('[DEBUG]', new Date().toISOString(), ...args);
}

// Connection handler
adams.ev.on('connection.update', async (update) => {
    debugLog('Connection update:', JSON.stringify(update, null, 2));
    
    const { connection, isNewLogin, qr } = update;
    
    if (connection === 'close') {
        const shouldReconnect = (update.lastDisconnect.error)?.output?.statusCode !== 401;
        debugLog(`Connection closed. Should reconnect: ${shouldReconnect}`);
        if (shouldReconnect) {
            setTimeout(() => startBot(), 5000);
        }
    } 
    else if (connection === 'open') {
        debugLog('Connection established successfully');
        
        // Update presence to ensure proper connection
        await adams.sendPresenceUpdate('available');
        debugLog('Presence updated to "available"');
        
        if (TEST_ON_CONNECT) {
            setTimeout(() => testBotFunctionality(), 3000);
        }
    }
    
    if (qr) {
        debugLog('QR code generated');
    }
    
    if (isNewLogin) {
        debugLog('New login detected - resetting session');
    }
});

// Enhanced functionality test
async function testBotFunctionality() {
    try {
        debugLog('Starting comprehensive functionality test...');
        
        // 1. Test basic message sending
        await adams.sendMessage(adams.user.id, { 
            text: '🔍 Bot connection test initiated...' 
        });
        debugLog('Test message sent to self');
        
        // 2. Test command processing
        const testCmd = {
            key: { 
                remoteJid: adams.user.id, 
                fromMe: true,
                id: 'test-cmd-' + Date.now()
            },
            message: { conversation: `${PREFIX}ping` },
            pushName: 'Test Bot'
        };
        
        debugLog('Emulating test command:', testCmd);
        await adams.ev.emit('messages.upsert', { 
            messages: [testCmd], 
            type: 'notify' 
        });
        
        // 3. Verify event listeners
        await delay(2000);
        debugLog('Functionality test completed');
        
    } catch (error) {
        console.error('Comprehensive test failed:', error);
    }
}

// Enhanced message handler
adams.ev.on('messages.upsert', async ({ messages, type }) => {
    try {
        debugLog(`New message batch (type: ${type})`);
        
        if (type !== 'notify') {
            debugLog('Non-notify message batch ignored');
            return;
        }

        for (const ms of messages) {
            try {
                if (!ms?.message || !ms?.key) {
                    debugLog('Invalid message structure:', ms);
                    continue;
                }

                const origineMessage = ms.key.remoteJid || '';
                const isGroup = isJidGroup(origineMessage);
                const sender = ms.key.participant || ms.key.remoteJid || '';
                
                debugLog(`Processing message from ${sender} in ${isGroup ? 'group' : 'DM'}`);
                debugLog('Full message key:', JSON.stringify(ms.key, null, 2));

                // Enhanced message content extraction
                const messageType = getContentType(ms.message);
                let texte = '';
                
                if (messageType === 'conversation') {
                    texte = ms.message.conversation;
                } 
                else if (messageType === 'extendedTextMessage') {
                    texte = ms.message.extendedTextMessage?.text || '';
                } 
                else if (['imageMessage', 'videoMessage', 'documentMessage'].includes(messageType)) {
                    texte = ms.message[messageType]?.caption || '';
                }
                
                debugLog('Extracted text:', texte);

                // Command processing
                if (texte && texte.startsWith(PREFIX)) {
                    const args = texte.slice(PREFIX.length).trim().split(/\s+/);
                    const com = args[0]?.toLowerCase();
                    
                    debugLog('Potential command detected:', {
                        command: com,
                        args: args.slice(1),
                        sender: sender
                    });

                    if (!com) {
                        debugLog('Empty command after prefix');
                        continue;
                    }

                    // Find command in registry
                    const cmd = Array.isArray(evt.cm) 
                        ? evt.cm.find(c => c?.nomCom === com || c?.aliases?.includes(com))
                        : null;
                        
                    if (!cmd) {
                        debugLog('Command not found in registry:', com);
                        continue;
                    }

                    debugLog('Executing command:', cmd.nomCom);
                    
                    // Permission system
                    const isOwner = sender === `${conf.OWNER_NUMBER}@s.whatsapp.net`;
                    const isSudo = SUDO_NUMBERS?.includes(sender);
                    const isBot = sender === adams.user.id;
                    const isPublic = conf.MODE?.toLowerCase() === 'yes';
                    const allowed = isPublic || isOwner || isSudo || isBot;
                    
                    debugLog('Permission check:', {
                        isOwner,
                        isSudo,
                        isBot,
                        isPublic,
                        allowed
                    });

                    if (!allowed) {
                        debugLog('Command execution denied - insufficient permissions');
                        continue;
                    }

                    // Execute command with full context
                    try {
                        // Prepare group info if needed
                        let groupInfo = null;
                        if (isGroup) {
                            groupInfo = await adams.groupMetadata(origineMessage).catch(err => {
                                debugLog('Failed to fetch group metadata:', err);
                                return null;
                            });
                        }

                        // Create reply function with enhanced error handling
                        const repondre = async (text, options = {}) => {
                            try {
                                await adams.sendMessage(origineMessage, {
                                    text: String(text),
                                    ...createContext(sender, {
                                        title: options.title || (groupInfo?.subject || "BWM-XMD"),
                                        body: options.body || "",
                                        thumbnail: options.thumbnail
                                    })
                                }, { quoted: ms });
                                debugLog('Reply sent successfully');
                            } catch (err) {
                                debugLog('Failed to send reply:', err);
                            }
                        };

                        // Add reaction if specified
                        if (cmd.reaction) {
                            try {
                                await adams.sendMessage(origineMessage, {
                                    react: {
                                        key: ms.key,
                                        text: cmd.reaction
                                    }
                                });
                                debugLog('Reaction added:', cmd.reaction);
                            } catch (err) {
                                debugLog('Failed to add reaction:', err);
                            }
                        }

                        // Execute command
                        await cmd.fonction(origineMessage, adams, {
                            ms,
                            arg: args.slice(1),
                            repondre,
                            superUser: isOwner || isSudo || isBot,
                            verifAdmin: isGroup && groupInfo?.participants?.some(
                                p => p.id === sender && p.admin
                            ),
                            botIsAdmin: isGroup && groupInfo?.participants?.some(
                                p => p.id === adams.user.id && p.admin
                            ),
                            verifGroupe: isGroup,
                            infosGroupe: groupInfo,
                            nomGroupe: groupInfo?.subject || '',
                            auteurMessage: sender,
                            origineMessage
                        });

                        debugLog('Command executed successfully');
                        
                    } catch (cmdError) {
                        console.error(`Command execution error [${cmd.nomCom}]:`, cmdError);
                        try {
                            await adams.sendMessage(origineMessage, {
                                text: `⚠️ Command error: ${cmdError.message}`,
                                ...createContext(sender, {
                                    title: "Command Failed",
                                    body: "Please try again"
                                })
                            }, { quoted: ms });
                        } catch (sendErr) {
                            console.error('Failed to send error message:', sendErr);
                        }
                    }
                }
            } catch (msgError) {
                console.error('Message processing error:', msgError);
            }
        }
    } catch (batchError) {
        console.error('Message batch processing error:', batchError);
    }
}); */

    // Connection Handler
    socket.ev.on("connection.update", async (update) => {
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


main().catch(err => console.error("Initialization error:", err));
