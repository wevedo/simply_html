"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc); 
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const logger_1 = __importDefault(require("@whiskeysockets/baileys/lib/Utils/logger"));
const logger = logger_1.default.child({});
logger.level = 'silent';
const pino = require("pino");
const boom_1 = require("@hapi/boom");
const conf = require("./config");
const axios = require("axios");
const moment = require("moment-timezone");
let fs = require("fs-extra");
let path = require("path");
let botPassword = null;
const FileType = require('file-type');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
//import chalk from 'chalk'
const { verifierEtatJid , recupererActionJid } = require("./lib/antilien");
let evt = require(__dirname + "/Ibrahim/adams");
const {isUserBanned , addUserToBanList , removeUserFromBanList} = require("./lib/banUser");
/*
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function rateLimitedSendMessage(zk, remoteJid, message) {
    try {
        await delay(2000); // Add a 2-second delay to reduce request frequency
        await zk.sendMessage(remoteJid, message);
    } catch (err) {
        console.error("Error sending message:", err.message);
        if (err.output?.statusCode === 429) {
            console.log("Rate limit hit, waiting 10 seconds...");
            await delay(10000); // Wait 10 seconds before retrying
        }
    }
}
*/
const  {addGroupToBanList,isGroupBanned,removeGroupFromBanList} = require("./lib/banGroup");
const {isGroupOnlyAdmin,addGroupToOnlyAdminList,removeGroupFromOnlyAdminList} = require("./lib/onlyAdmin");
//const //{loadCmd}=require("/framework/mesfonctions")
let { reagir } = require(__dirname + "/Ibrahim/app");
const prefixe = conf.PREFIXE;
const more = String.fromCharCode(8206)
const BaseUrl = process.env.GITHUB_GIT;
const adamsapikey = process.env.BOT_OWNER;
const BaseUrl1 = process.env.MADE_IN_KENYA;
const adamsapikey2 = process.env.BOT_NAME;
require('dotenv').config({ path: './config.env' });
const herokuAppName = process.env.HEROKU_APP_NAME || "Unknown App Name";
const herokuAppLink = process.env.HEROKU_APP_LINK || `https://dashboard.heroku.com/apps/${herokuAppName}`; 
const botOwner = process.env.NUMERO_OWNER || "Unknown Owner"; 
const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;
 
function atbverifierEtatJid(jid) {
    if (!jid.endsWith('@s.whatsapp.net')) {
        console.error('Invalid JID format:', jid);
        return false;
    }
    console.log('JID verified:', jid);
    return true;
}

const zlib = require('zlib');

async function authentification() {
    try {
        if (!fs.existsSync(__dirname + "/Session/creds.json")) {
            console.log("Session connected...");
            // Split the session string into header and Base64 data
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
authentification();
const store = (0, baileys_1.makeInMemoryStore)({
    logger: pino().child({ level: "silent", stream: "store" }),
});
setTimeout(() => {
    async function main() {
        const { version, isLatest } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(__dirname + "/Session");
        const sockOptions = {
            version,
            logger: pino({ level: "silent" }),
            browser: ['Bmw-Md', "safari", "1.0.0"],
            printQRInTerminal: true,
            fireInitQueries: false,
            shouldSyncHistoryMessage: true,
            downloadHistory: true,
            syncFullHistory: true,
            generateHighQualityLinkPreview: true,
            markOnlineOnConnect: false,
            keepAliveIntervalMs: 30_000,
            /* auth: state*/ auth: {
                creds: state.creds,
                /** caching makes the store faster to send/recv messages */
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
            },
            //////////
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
                    return msg.message || undefined;
                }
                return {
                    conversation: 'An Error Occurred, Repeat Command!'
                };
            }
            ///////
        };
   const zk = (0, baileys_1.default)(sockOptions);
   store.bind(zk.ev);
  setInterval(() => { store.writeToFile("store.json"); }, 3000);

  

        function getCurrentDateTime() {
    const options = {
        timeZone: 'Africa/Nairobi', // Kenya time zone
        year: 'numeric',
        month: 'long', // Full month name
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // 24-hour format
    };
    return new Intl.DateTimeFormat('en-KE', options).format(new Date());
}

// List of mixed quotes: Kenyan and cool English ones
const quotes = [
    "Dream big, code smart, live limitless. 🚀",
    "Innovation is just a bug fix away. 💻✨",
    "Stay sharp, stay focused, stay coding. 🔥",
    "Think less, code more. Results will follow. 🛠️",
    "Every bug is just an opportunity in disguise. 🐛➡️🎯",
    "Don’t stop when you’re tired; stop when it’s done. 🏁",
    "Keep calm and deploy the bot. 🤖🌐",
    "Hustle in silence, let your code speak. 👨‍💻👩‍💻",
    "Hakuna stress, tuko hapa kwa ground 🚜🇰🇪",
    "Bora uhai, na bot imewaka! 🔥",
    "Sina form but Bwm xmd iko online! 💃",
    "Weuh! Vitu kwa ground ni different lakini bot iko shwari! 🌟",
    "Acha tu! Hii bot ni kama chai ya mama mboga, shwari kabisa! ☕✨",
    "Life is short, sip your chai and vibe with Bwm xmd! ☕💬",
];

// Function to get a random quote
function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

// Function to generate a dynamic bio
function generateBio(nomAuteurMessage = "User") {
    const currentDateTime = getCurrentDateTime(); // Get the current date and time
    const quote = getRandomQuote(); // Get a random quote
    return `👋HEY,  ${nomAuteurMessage} BWM XMD IS ONLINE 🚀,\n📅 ${currentDateTime}\n💬 "${quote}"`;
}

// Auto Bio Update Interval
setInterval(async () => {
    if (conf.AUTO_BIO === "yes") {
        // Replace "User" dynamically if you can fetch an author/message participant
        const nomAuteurMessage = "🚀"; // Replace with logic to fetch the participant's name or ID
        const bioText = generateBio(nomAuteurMessage); // Generate the advanced bio text
        await zk.updateProfileStatus(bioText); // Update the bio
        console.log(`Updated Bio: ${bioText}`); // Log the updated bio
    }
}, 60000); // Update bio every 60 seconds

        
   

        
zk.ev.on("call", async (callData) => {
  if (conf.ANTICALL === 'yes') {
    const callId = callData[0].id;
    const callerId = callData[0].from;

    // Reject the call
    await zk.rejectCall(callId, callerId);

    // Delay for 1 second before sending a message
    setTimeout(async () => {
      await zk.sendMessage(callerId, {
        text: `🚫 *Call Rejected!*  
Hi there, I’m *BWM XMD* 🤖.  
⚠️ My owner is unavailable at the moment.  
Please try again later or leave a message. Cheers! 😊`
      });
    }, 1000); // 1-second delay


// Utility function for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Track the last reaction time to prevent overflow
let lastReactionTime = 0;

// Love emojis for AUTO_REACT_STATUS
const loveEmojis = [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💞', '💕', '💓', 
    '💗', '💖', '💘', '💝', '❣️', '💌'
];

// Emoji set for AUTO_REACT
const autoReactEmojis = [
    // Smiley Faces and Positive Reactions
    '😊', '😁', '😂', '🤣', '😎', '😍', '🥰', '🤩', '😘', '😇', '🙃', '🙂', '😉', 
    '😌', '😅', '🤗', '🤭', '😜', '😝', '🤔', '😏',

    // Hand Gestures
    '👍', '👎', '👏', '🙌', '🙏', '👌', '🤞', '✌️', '🤟', '🤙', '💪', '✋', '🤚', '🖐️', 
    '🖖', '👋', '🤝', '💅',

    // Celebrations and Fun
    '🎉', '🎊', '🎁', '🎈', '🔥', '✨', '💥', '⚡', '🌟', '🥳', '🌈', '🎆', '🎇',

    // Nature and Animals
    '🌻', '🌹', '🌸', '🌺', '🌷', '🍀', '🌴', '🌳', '🌍', '🦋', '🐝', '🐞', '🐶', '🐱', 
    '🐭', '🐰', '🐻', '🐼', '🐸', '🐯', '🦁', '🐵', '🦊', '🦄', '🐔', '🐧', '🐦', '🐠', 
    '🐳', '🐬', '🦈', '🐙',

    // Food and Drink
    '🍕', '🍔', '🍟', '🌭', '🍿', '🍩', '🍪', '🍫', '🍦', '🍰', '🍎', '🍌', '🍓', '🥝', 
    '🍍', '🍇', '🥑', '🍋', '🥤', '🍹', '🍷', '🍺', '🥂', '☕', '🍵',

    // Sports and Games
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎳', '🎯', '🏓', '🏸', '🥊', '🎮', '🎲', '♟️',

    // Objects and Activities
    '📱', '💻', '🖊️', '📚', '🎵', '🎧', '🎤', '🎸', '🎷', '🎺', '🥁', '📷', '🎥', '📽️', 
    '🎬', '🖼️', '🎨', '✏️', '📝', '📖',

    // Symbols and Random Reactions
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💯', '✔️', '❌', '❓', '❗', '🔔', 
    '💡', '🔑', '🚀', '🎩', '👑', '💎', '🌌', '🛸', '🪐'
];

// Auto-react to regular messages
if (conf.AUTO_REACT === "yes") {
    console.log("AUTO_REACT is enabled. Listening for regular messages...");

    zk.ev.on("messages.upsert", async (m) => {
        const { messages } = m;

        for (const message of messages) {
            if (message.key && message.key.remoteJid) {
                const now = Date.now();
                if (now - lastReactionTime < 5000) {
                    console.log("Throttling reactions to prevent overflow.");
                    continue;
                }

                const randomEmoji = autoReactEmojis[Math.floor(Math.random() * autoReactEmojis.length)];

                try {
                    await zk.sendMessage(message.key.remoteJid, {
                        react: {
                            text: randomEmoji,
                            key: message.key
                        }
                    });

                    lastReactionTime = Date.now();
                    console.log(`Successfully reacted with '${randomEmoji}' to message by ${message.key.remoteJid}`);
                } catch (error) {
                    console.error("Failed to send reaction to message:", error);
                }

                await delay(2000);
            }
        }
    });
}

// Auto-react to status updates
if (conf.AUTO_REACT_STATUS === "yes") {
    console.log("AUTO_REACT_STATUS is enabled. Listening for status updates...");

    zk.ev.on("messages.upsert", async (m) => {
        const { messages } = m;

        for (const message of messages) {
            if (message.key && message.key.remoteJid === "status@broadcast") {
                console.log("Detected status update from:", message.key.remoteJid);

                const now = Date.now();
                if (now - lastReactionTime < 5000) {
                    console.log("Throttling reactions to prevent overflow.");
                    continue;
                }

                const adams = zk.user?.id?.split(":")[0] + "@s.whatsapp.net";
                if (!adams) {
                    console.log("Bot's user ID not available. Skipping reaction.");
                    continue;
                }

                const randomLoveEmoji = loveEmojis[Math.floor(Math.random() * loveEmojis.length)];

                try {
                    await zk.sendMessage(message.key.remoteJid, {
                        react: {
                            key: message.key,
                            text: randomLoveEmoji,
                        },
                    }, {
                        statusJidList: [message.key.participant, adams],
                    });

                    lastReactionTime = Date.now();
                    console.log(`Successfully reacted with '${randomLoveEmoji}' to status update by ${message.key.remoteJid}`);
                } catch (error) {
                    console.error("Failed to send reaction to status:", error);
                }

                await delay(2000);
            }
        }
    });
}

    
// Function to create and send vCard for a new contact with incremented numbering
async function sendVCard(jid, baseName) {
    try {
        // Extract phone number from JID
        const phoneNumber = jid.split('@')[0];
        
        // Generate unique name with incremented number
        let counter = 1;
        let name = `${baseName} ${counter}`;

        // Check existing contacts to find the next available number
        while (Object.values(store.contacts).some(contact => contact.name === name)) {
            counter++;
            name = `${baseName} ${counter}`;
        }

        // Manually construct vCard content
        const vCardContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${phoneNumber}:+${phoneNumber}\nEND:VCARD\n`;
        
        // Define the path and file name for the vCard file
        const vCardPath = `./${name}.vcf`;
        
        // Write the vCard content to a .vcf file
        fs.writeFileSync(vCardPath, vCardContent);

        // Send the vCard to yourself (the bot owner) for easy importing
        await zk.sendMessage(conf.NUMERO_OWNER + "@s.whatsapp.net", {
            document: { url: vCardPath },
            mimetype: 'text/vcard',
            fileName: `${name}.vcf`,
            caption: `Contact saved as ${name}. Please import this vCard to add the number to your contacts.\n\n🚀 ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs`
        });

        console.log(`vCard created and sent for: ${name} (${jid})`);

        // Delete the vCard file after sending
        fs.unlinkSync(vCardPath);

        return name;  // Return the assigned name to use in the notification
    } catch (error) {
        console.error(`Error creating or sending vCard for ${name}:`, error.message);
    }
}
// New Contact Handler
zk.ev.on("messages.upsert", async (m) => {
    // Check if AUTO_SAVE_CONTACTS is enabled
    if (conf.AUTO_SAVE_CONTACTS !== "yes") return;

    const { messages } = m;
    const ms = messages[0];

    if (!ms.message) return;

    const origineMessage = ms.key.remoteJid;
    const baseName = "🚀 ʙᴡᴍ xᴍᴅ";

    // Check if the message is from an individual and if contact is not saved
    if (origineMessage.endsWith("@s.whatsapp.net") && (!store.contacts[origineMessage] || !store.contacts[origineMessage].name)) {
        // Generate and save contact with incremented name
        const assignedName = await sendVCard(origineMessage, baseName);

        // Update contact in store to avoid duplicate saving
        store.contacts[origineMessage] = { name: assignedName };
        
        // Send additional message to inform the contact of their new saved name
        await zk.sendMessage(origineMessage, {
            text: `Hello! Your name has been saved as "${assignedName}" in our system.\n\n🚀 ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs`
        });

        console.log(`Contact ${assignedName} has been saved and notified.`);
    }

    // Further message handling for saved contacts can be added here...
});


      //const fs = require('fs');

// Function to create and send vCard file for all group members
async function createAndSendGroupVCard(groupJid, baseName, zk) {
    try {
        // Notify the group that processing has started
        await zk.sendMessage(groupJid, {
            text: "⌛ Generating vCard file for all group members. This may take a few moments...",
        });

        // Fetch group metadata to get participants
        const groupMetadata = await zk.groupMetadata(groupJid);
        const participants = groupMetadata.participants;

        // Define the path and file name for the vCard file
        const fileName = `${baseName}_${groupMetadata.subject.replace(/\s+/g, '_')}.vcf`;
        const vCardPath = `./${fileName}`;

        // Open file stream for efficient writing
        const fileStream = fs.createWriteStream(vCardPath);

        // Write vCard header
        participants.forEach((participant, index) => {
            const phoneNumber = participant.id.split('@')[0];
            const name = `${baseName} ${index + 1}`;
            fileStream.write(
                `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${phoneNumber}:+${phoneNumber}\nEND:VCARD\n\n`
            );
        });

        // Close file stream after writing all vCards
        fileStream.end();

        // Wait for the file stream to finish
        fileStream.on('finish', async () => {
            // Send the vCard file back to the group
            await zk.sendMessage(groupJid, {
                document: { url: vCardPath },
                mimetype: 'text/vcard',
                fileName: fileName,
                caption: `Here is the vCard file containing all ${participants.length} members of this group: ${groupMetadata.subject}.\n\n🚀 ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs`,
            });

            // Delete the vCard file after sending
            fs.unlinkSync(vCardPath);
            console.log(`vCard file created and sent for group: ${groupMetadata.subject}`);
        });

        fileStream.on('error', (error) => {
            console.error(`Error writing vCard file: ${error.message}`);
        });
    } catch (error) {
        console.error(`Error creating or sending vCard file for group ${groupJid}:`, error.message);

        // Send error feedback to the group
        await zk.sendMessage(groupJid, {
            text: `❌ Error generating the vCard file for this group. Please try again later.\n\n🚀 ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs`,
        });
    }
}

// Command handler with dynamic prefix detection
zk.ev.on("messages.upsert", async (m) => {
    const { messages } = m;
    const ms = messages[0];

    if (!ms.message) return;

    const messageContent = ms.message.conversation || ms.message.extendedTextMessage?.text || '';
    const sender = ms.key.remoteJid;

    // Find the prefix dynamically (any character at the start of the message)
    const prefixUsed = messageContent.charAt(0);
    
    // Check if the command is "vcard" and is sent in a group
    if (messageContent.slice(1).toLowerCase() === "vcard" && sender.endsWith("@g.us")) {
        const baseName = "🚀 ʙᴡᴍ xᴍᴅ";

        // Call the function to create and send vCards for group members
        await createAndSendGroupVCard(sender, baseName, zk);
    }
});  


        /*
// Function to create and send vCards for all group members
const fs = require('fs');

// Function to create and send vCard file for all group members
async function createAndSendGroupVCard(groupJid, baseName, zk) {
    try {
        // React to the command
        await zk.sendMessage(groupJid, { react: { text: "⌛", key: { remoteJid: groupJid, id: groupJid } } });

        // Fetch group metadata to get participants
        const groupMetadata = await zk.groupMetadata(groupJid);
        const participants = groupMetadata.participants;

        // Initialize vCard content
        let vCardContent = '';

        // Loop through each participant and create their vCard
        participants.forEach((participant, index) => {
            const phoneNumber = participant.id.split('@')[0];
            const name = `${baseName} ${index + 1}`; // Assign an incremented name
            vCardContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${phoneNumber}:+${phoneNumber}\nEND:VCARD\n\n`;
        });

        // Define the path and file name for the vCard file
        const fileName = `${baseName}_${groupMetadata.subject.replace(/\s+/g, '_')}.vcf`;
        const vCardPath = `./${fileName}`;

        // Write the vCard content to a .vcf file
        fs.writeFileSync(vCardPath, vCardContent);

        // Send the vCard file back to the group
        await zk.sendMessage(groupJid, {
            document: { url: vCardPath },
            mimetype: 'text/vcard',
            fileName: fileName,
            caption: `Here is the vCard file containing all members of this group: ${groupMetadata.subject}.\n\n🚀 ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs`
        });

        // Delete the vCard file after sending
        fs.unlinkSync(vCardPath);

        console.log(`vCard file created and sent for group: ${groupMetadata.subject}`);
    } catch (error) {
        console.error(`Error creating or sending vCard file for group ${groupJid}:`, error.message);

        // Send error feedback to the group
        await zk.sendMessage(groupJid, {
            text: `❌ Error generating the vCard file for this group. Please try again later.\n\n🚀 ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs`
        });
    }
}

// Command handler with any prefix
zk.ev.on("messages.upsert", async (m) => {
    const { messages } = m;
    const ms = messages[0];

    if (!ms.message) return;

    const messageContent = ms.message.conversation || ms.message.extendedTextMessage?.text || '';
    const sender = ms.key.remoteJid;

    // Example prefixes you can allow
    const prefixes = ["!", ".", "/", "#", "$"];
    const command = prefixes.find((prefix) => messageContent.startsWith(prefix)) ? messageContent.slice(1).toLowerCase() : null;

    // Check if the message is the "vcard" command and is sent in a group
    if (command === "vcard" && sender.endsWith("@g.us")) {
        const baseName = "🚀 ʙᴡᴍ xᴍᴅ";

        // React and call the function to create and send vCards
        await createAndSendGroupVCard(sender, baseName, zk);
    }
});
*/
// Default auto-reply message
let auto_reply_message = "Hello, I am Bwm xmd. My owner is currently unavailable. Please leave a message, and he will get back to you as soon as possible.";

// Track contacts that have already received the auto-reply
let repliedContacts = new Set();

zk.ev.on("messages.upsert", async (m) => {
    const { messages } = m;
    const ms = messages[0];
    if (!ms.message) return;

    const messageText = ms.message.conversation || ms.message.extendedTextMessage?.text;
    const remoteJid = ms.key.remoteJid;

    // Check if the message exists and is a command to set a new auto-reply message with any prefix
    if (messageText && messageText.match(/^[^\w\s]/) && ms.key.fromMe) {
        const prefix = messageText[0]; // Detect the prefix
        const command = messageText.slice(1).split(" ")[0]; // Command after prefix
        const newMessage = messageText.slice(prefix.length + command.length).trim(); // New message content

        // Update the auto-reply message if the command is 'setautoreply'
        if (command === "setautoreply" && newMessage) {
            auto_reply_message = newMessage;
            await zk.sendMessage(remoteJid, {
                text: `Auto-reply message has been updated to:\n"${auto_reply_message}"`,
            });
            return;
        }
    }

    // Check if auto-reply is enabled, contact hasn't received a reply, and it's a private chat
    if (conf.AUTO_REPLY === "yes" && !repliedContacts.has(remoteJid) && !ms.key.fromMe && !remoteJid.includes("@g.us")) {
        await zk.sendMessage(remoteJid, {
            text: auto_reply_message,
        });

        // Add contact to replied set to prevent repeat replies
        repliedContacts.add(remoteJid);
    }
});





        
// Function to download and return media buffer
async function downloadMedia(message) {
    const mediaType = Object.keys(message)[0].replace('Message', ''); // Determine the media type
    try {
        const stream = await zk.downloadContentFromMessage(message[mediaType], mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    } catch (error) {
        console.error('Error downloading media:', error);
        return null;
    }
}

// Function to format notification message
function createNotification(deletedMessage) {
    const deletedBy = deletedMessage.key.participant || deletedMessage.key.remoteJid;

    // Format time in Nairobi timezone
    const timeInNairobi = new Intl.DateTimeFormat('en-KE', {
        timeZone: 'Africa/Nairobi',
        dateStyle: 'full',
        timeStyle: 'medium',
    }).format(new Date());

    let notification = `*[ANTIDELETE DETECTED]*\n\n`;
    notification += `*Time:* ${timeInNairobi}\n`;
    notification += `*Deleted By:* @${deletedBy.split('@')[0]}\n\n`;

    return notification;
}

// Event listener for all incoming messages
zk.ev.on("messages.upsert", async (m) => {
    if (conf.ANTIDELETE2 === "yes") { // Check if ANTIDELETE is enabled
        const { messages } = m;
        const ms = messages[0];
        if (!ms.message) return;

        const messageKey = ms.key;
        const remoteJid = messageKey.remoteJid;

        // Store message for future reference
        if (!store.chats[remoteJid]) {
            store.chats[remoteJid] = [];
        }
        store.chats[remoteJid].push(ms);

        // Handle deleted messages
        if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0) {
            const deletedKey = ms.message.protocolMessage.key;
            const chatMessages = store.chats[remoteJid];
            const deletedMessage = chatMessages.find(
                (msg) => msg.key.id === deletedKey.id
            );

            if (deletedMessage) {
                try {
                    const notification = createNotification(deletedMessage);

                    // Determine message type
                    const mtype = Object.keys(deletedMessage.message)[0];

                    // Handle text messages (conversation or extendedTextMessage)
                    if (mtype === 'conversation' || mtype === 'extendedTextMessage') {
                        await zk.sendMessage(conf.NUMERO_OWNER + '@s.whatsapp.net', {
                            text: notification + `*Message:* ${deletedMessage.message[mtype].text}`,
                            mentions: [deletedMessage.key.participant],
                        });
                    }
                    // Handle media messages (image, video, document, audio, sticker, voice)
                    else if (mtype === 'imageMessage' || mtype === 'videoMessage' || mtype === 'documentMessage' ||
                             mtype === 'audioMessage' || mtype === 'stickerMessage' || mtype === 'voiceMessage') {
                        const mediaBuffer = await downloadMedia(deletedMessage.message);
                        if (mediaBuffer) {
                            const mediaType = mtype.replace('Message', '').toLowerCase();
                            await zk.sendMessage(conf.NUMERO_OWNER + '@s.whatsapp.net', {
                                [mediaType]: mediaBuffer,
                                caption: notification,
                                mentions: [deletedMessage.key.participant],
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error handling deleted message:', error);
                }
            }
        }
    }
});



// Event listener for all incoming messages
zk.ev.on("messages.upsert", async (m) => {
    // Check if ANTIDELETE is enabled
    if (conf.ANTIDELETE1 === "yes") {
        const { messages } = m;
        const ms = messages[0];
        if (!ms.message) return;

        // Store each received message
        const messageKey = ms.key;
        const remoteJid = messageKey.remoteJid;

        // Store message for future undelete reference
        if (!store.chats[remoteJid]) {
            store.chats[remoteJid] = [];
        }

        // Save the received message to storage
        store.chats[remoteJid].push(ms);

        // Handle deleted messages
        if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0) {
            const deletedKey = ms.message.protocolMessage.key;

            // Search for the deleted message in the stored messages
            const chatMessages = store.chats[remoteJid];
            const deletedMessage = chatMessages.find(
                (msg) => msg.key.id === deletedKey.id
            );

            if (deletedMessage) {
                try {
                    // Create notification about the deleted message
                    const notification = createNotification(deletedMessage);

                    // Resend deleted content based on its type
                    if (deletedMessage.message.conversation) {
                        // Text message
                        await zk.sendMessage(remoteJid, {
                            text: notification + `*Message:* ${deletedMessage.message.conversation}`,
                            mentions: [deletedMessage.key.participant],
                        });
                    } else if (deletedMessage.message.imageMessage || 
                               deletedMessage.message.videoMessage || 
                               deletedMessage.message.documentMessage || 
                               deletedMessage.message.audioMessage || 
                               deletedMessage.message.stickerMessage || 
                               deletedMessage.message.voiceMessage) {
                        // Media message (image, video, document, audio, sticker, voice)
                        const mediaBuffer = await downloadMedia(deletedMessage.message);
                        if (mediaBuffer) {
                            const mediaType = deletedMessage.message.imageMessage ? 'image' :
                                deletedMessage.message.videoMessage ? 'video' :
                                deletedMessage.message.documentMessage ? 'document' :
                                deletedMessage.message.audioMessage ? 'audio' :
                                deletedMessage.message.stickerMessage ? 'sticker' : 'audio';

                            await zk.sendMessage(remoteJid, {
                                [mediaType]: mediaBuffer,
                                caption: notification,
                                mentions: [deletedMessage.key.participant],
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error handling deleted message:', error);
                }
            }
        }
    }
});




        
//const fs = require('fs/promises'); // Use the promises API for fs operations

// Map keywords to corresponding audio files
const audioMap = {
    "hey": "files/hey.wav",
    "hi": "files/hey.wav",
    "hey": "files/hey.wav",
    "he": "files/hey.wav",
    "hello": "files/hello.wav",
    "mambo": "files/hey.wav",
    "niaje": "files/hey.wav",
    "morning": "files/goodmorning.wav",
    "goodmorning": "files/goodmorning.wav",
    "weka up": "files/goodmorning.wav",
    "night": "files/goodnight.wav",
    "goodnight": "files/goodnight.wav",
    "sleep": "files/goodnight.wav",
    "oyaah": "files/mkuu.wav",
    "mkuu": "files/mkuu.wav",
    "mahn": "files/mkuu.wav",
    "owoh": "files/mkuu.wav",
    "yoo": "files/mkuu.wav",
    "wazii": "files/mkuu.wav",
    "dev": "files/ibrahim.wav",
    "ibraah": "files/ibrahim.wav",
    "ibrah": "files/ibrahim.wav",
    "ibrahim": "files/ibrahim.wav",
    "adams": "files/ibrahim.wav",
    "bot": "files/bwm.mp3",
    "bwm": "files/bwm.mp3",
    "xmd": "files/bwm.mp3",
    "bmw": "files/bwm.mp3",
    "md": "files/bwm.mp3",
    "whatsapp bot": "files/bwm.mp3",
    "bmw md": "files/bwm.mp3",
    "evening": "files/goodevening.wav",
    "goodevening": "files/goodevening.wav",
    "darling": "files/darling.wav",
    "beb": "files/darling.wav",
    "mpenzi": "files/darling.wav",
    "afternoon": "files/goodafternoon.wav",
    "jion": "files/goodafternoon.wav",
    "kaka": "files/kaka.wav",
    "bro": "files/morio.mp3",
    "ndugu": "files/kaka.wav",
    "morio": "files/morio.mp3",
    "mzee": "files/morio.mp3",
    "kijina": "files/mkuu.wav",
    "mkuu": "files/mkuu.wav",
     "ozah": "files/mkuu.wav",
     "ozaah": "files/mkuu.wav",
    "oyaah": "files/mkuu.wav",
    "oyah": "files/mkuu.wav",





    

};

// Utility to get audio file path for a message
const getAudioForSentence = (sentence) => {
    const words = sentence.split(/\s+/); // Split sentence into words
    for (const word of words) {
        const audioFile = audioMap[word.toLowerCase()]; // Check each word in sentence
        if (audioFile) return audioFile; // Return first matched audio file
    }
    return null; // Return null if no match
};

// Auto-reply with audio functionality
if (conf.AUDIO_REPLY === "yes") {
    console.log("AUTO_REPLY_AUDIO is enabled. Listening for messages...");

    zk.ev.on("messages.upsert", async (m) => {
        try {
            const { messages } = m;

            for (const message of messages) {
                if (!message.key || !message.key.remoteJid) continue; // Ignore invalid messages
                
                const conversationText = message?.message?.conversation || "";
                const audioFile = getAudioForSentence(conversationText);

                if (audioFile) {
                    try {
                        // Check if the audio file exists
                        await fs.access(audioFile);

                        console.log(`Replying with audio: ${audioFile}`);
                        await zk.sendMessage(message.key.remoteJid, {
                            audio: { url: audioFile },
                            mimetype: "audio/mp4",
                            ptt: true
                        });

                        console.log(`Audio reply sent: ${audioFile}`);
                    } catch (err) {
                        console.error(`Error sending audio reply: ${err.message}`);
                    }
                } else {
                    console.log("No matching keyword detected. Skipping message.");
                }

                // Add a delay to prevent spamming
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }
        } catch (err) {
            console.error("Error in message processing:", err.message);
        }
    });
}
        /*// Required Libraries
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const speech = require("@google-cloud/speech"); // Google Speech-to-Text library
const client = new speech.SpeechClient(); // Google Speech Client

// Function to process voice note
async function processVoiceCommand(message) {
    try {
        // Download the voice note
        const stream = await downloadContentFromMessage(message.audioMessage, "audio");
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Save the audio locally for transcription
        const audioPath = "./voice_note.ogg";
        fs.writeFileSync(audioPath, buffer);

        // Convert the audio to text using Google Speech-to-Text API
        const audio = { content: buffer.toString("base64") };
        const config = {
            encoding: "OGG_OPUS",
            sampleRateHertz: 16000,
            languageCode: "en-US", // Adjust based on your preferred language
        };
        const request = { audio, config };

        const [response] = await client.recognize(request);
        const transcription = response.results
            .map((result) => result.alternatives[0].transcript)
            .join("\n");

        console.log("Transcription:", transcription);
        return transcription.toLowerCase();
    } catch (error) {
        console.error("Error processing voice command:", error.message);
        return null;
    }
}

// Command handling for voice notes
zk.ev.on("messages.upsert", async (m) => {
    const { messages } = m;
    const ms = messages[0];
    if (!ms.message) return;

    const remoteJid = ms.key.remoteJid;

    // Check if the message is a voice note
    if (ms.message.audioMessage) {
        const transcription = await processVoiceCommand(ms.message);

        if (!transcription) {
            await zk.sendMessage(remoteJid, { text: "❌ Could not understand the voice note. Please try again." });
            return;
        }

        // Respond to commands based on the transcribed text
        if (transcription.includes("menu")) {
            await zk.sendMessage(remoteJid, {
                text: "📜 *Menu*\n1. Command 1\n2. Command 2\n3. Command 3\n\nReply with a number to choose.",
            });
        } else {
            await zk.sendMessage(remoteJid, { text: `🤖 Command "${transcription}" not recognized.` });
        }
    }
});
        // Initialize zk after creating the socket instance


       

if (conf.AUTO_TAG_STATUS === "yes") {
    console.log("AUTO_TAG_STATUS is enabled. Listening for new status updates...");

    zk.ev.on("messages.upsert", async (messageUpdate) => {
        const { messages } = messageUpdate;

        for (const message of messages) {
            try {
                // Ensure this is a new status posted by the bot itself
                if (message.key && message.key.remoteJid === "status@broadcast" && message.key.fromMe) {
                    console.log("Detected a new status update from the bot.");

                    // Validate the store and recent contacts
                    if (!store || !store.chats) {
                        console.error("Store or chats data is unavailable. Skipping tagging.");
                        continue;
                    }

                    // Fetch up to 10 recent individual contacts
                    const allContacts = Object.keys(store.chats).filter(jid => jid.endsWith("@s.whatsapp.net"));
                    const recentContacts = allContacts.slice(-10); // Max 10 contacts

                    if (recentContacts.length === 0) {
                        console.log("No recent contacts to tag. Skipping tagging.");
                        continue;
                    }

                    // Ensure no undefined or invalid JIDs
                    const mentions = recentContacts.filter(jid => typeof jid === "string" && jid.includes("@s.whatsapp.net"));
                    if (mentions.length === 0) {
                        console.log("No valid contacts to tag. Skipping tagging.");
                        continue;
                    }

                    // Create the tagging message
                    const tagMessage = `Hey there, check out my new status!\n\n` +
                        mentions.map(jid => `@${jid.split("@")[0]}`).join(" ");

                    // Send tagging message
                    await zk.sendMessage("status@broadcast", {
                        text: tagMessage,
                        mentions: mentions,
                    });

                    console.log(`Successfully tagged ${mentions.length} recent contact(s) in the new status update.`);
                }
            } catch (error) {
                console.error("Error in AUTO_TAG_STATUS functionality:", error.message);
            }
        }
    });
}**/
        
        zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];
            if (!ms.message)
                return;
            const decodeJid = (jid) => {
                if (!jid)
                    return jid;
                if (/:\d+@/gi.test(jid)) {
                    let decode = (0, baileys_1.jidDecode)(jid) || {};
                    return decode.user && decode.server && decode.user + '@' + decode.server || jid;
                }
                else
                    return jid;
            };
            var mtype = (0, baileys_1.getContentType)(ms.message);
            var texte = mtype == "conversation" ? ms.message.conversation : mtype == "imageMessage" ? ms.message.imageMessage?.caption : mtype == "videoMessage" ? ms.message.videoMessage?.caption : mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : mtype == "buttonsResponseMessage" ?
                ms?.message?.buttonsResponseMessage?.selectedButtonId : mtype == "listResponseMessage" ?
                ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId : mtype == "messageContextInfo" ?
                (ms?.message?.buttonsResponseMessage?.selectedButtonId || ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId || ms.text) : "";
            var origineMessage = ms.key.remoteJid;
            var idBot = decodeJid(zk.user.id);
            var servBot = idBot.split('@')[0];
            /* const dj='22559763447';
             const dj2='254751284190';
             const luffy='254762016957'*/
            /*  var superUser=[servBot,dj,dj2,luffy].map((s)=>s.replace(/[^0-9]/g)+"@s.whatsapp.net").includes(auteurMessage);
              var dev =[dj,dj2,luffy].map((t)=>t.replace(/[^0-9]/g)+"@s.whatsapp.net").includes(auteurMessage);*/
            const verifGroupe = origineMessage?.endsWith("@g.us");
            var infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage) : "";
            var nomGroupe = verifGroupe ? infosGroupe.subject : "";
            var msgRepondu = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
            var auteurMsgRepondu = decodeJid(ms.message?.extendedTextMessage?.contextInfo?.participant);
            //ms.message.extendedTextMessage?.contextInfo?.mentionedJid
            // ms.message.extendedTextMessage?.contextInfo?.quotedMessage.
            var mr = ms.Message?.extendedTextMessage?.contextInfo?.mentionedJid;
            var utilisateur = mr ? mr : msgRepondu ? auteurMsgRepondu : "";
            var auteurMessage = verifGroupe ? (ms.key.participant ? ms.key.participant : ms.participant) : origineMessage;
            if (ms.key.fromMe) {
                auteurMessage = idBot;
            }
            
            var membreGroupe = verifGroupe ? ms.key.participant : '';
            const { getAllSudoNumbers } = require("./lib/sudo");
            const nomAuteurMessage = ms.pushName;
            const abu1 = '254710772666';
            const abu2 = '254710772666';
            const abu3 = "254710772666";
            const abu4 = '254710772666';
            const sudo = await getAllSudoNumbers();
            const superUserNumbers = [servBot, abu1, abu2, abu3, abu4, conf.NUMERO_OWNER].map((s) => s.replace(/[^0-9]/g) + "@s.whatsapp.net");
            const allAllowedNumbers = superUserNumbers.concat(sudo);
            const superUser = allAllowedNumbers.includes(auteurMessage);
            
            var dev = [abu1, abu2,abu3,abu4].map((t) => t.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(auteurMessage);
            function repondre(mes) { zk.sendMessage(origineMessage, { text: mes }, { quoted: ms }); }
            console.log("\tCONSOLE MESSAGES");
            console.log("=========== NEW CONVERSATION ===========");
            if (verifGroupe) {
                console.log("MESSAGE FROM GROUP : " + nomGroupe);
            }
            console.log("MESSAGE SENT BY : " + "[" + nomAuteurMessage + " : " + auteurMessage.split("@s.whatsapp.net")[0] + " ]");
            console.log("MESSAGE TYPE : " + mtype);
            console.log("==================TEXT==================");
            console.log(texte);
            /**  */
            function groupeAdmin(membreGroupe) {
                let admin = [];
                for (m of membreGroupe) {
                    if (m.admin == null)
                        continue;
                    admin.push(m.id);
                }
                // else{admin= false;}
                return admin;
            }



            var etat = conf.ETAT;
// Presence update logic based on etat value
if (etat == 1) {
    await zk.sendPresenceUpdate("available", origineMessage);
} else if (etat == 2) {
    await zk.sendPresenceUpdate("composing", origineMessage);
} else if (etat == 3) {
    await zk.sendPresenceUpdate("recording", origineMessage);
} else {
    await zk.sendPresenceUpdate("unavailable", origineMessage);
}

const mbre = verifGroupe ? await infosGroupe.participants : '';
let admins = verifGroupe ? groupeAdmin(mbre) : '';
const verifAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
var verifZokouAdmin = verifGroupe ? admins.includes(idBot) : false;

const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
const verifCom = texte ? texte.startsWith(prefixe) : false;
const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : false;

const lien = conf.URL.split(',');

            
            // Utiliser une boucle for...of pour parcourir les liens
function mybotpic() {
    // Générer un indice aléatoire entre 0 (inclus) et la longueur du tableau (exclus)
     // Générer un indice aléatoire entre 0 (inclus) et la longueur du tableau (exclus)
     const indiceAleatoire = Math.floor(Math.random() * lien.length);
     // Récupérer le lien correspondant à l'indice aléatoire
     const lienAleatoire = lien[indiceAleatoire];
     return lienAleatoire;
  }

// Define command options object for reusability
var commandeOptions = {
    superUser, dev,
    verifGroupe,
    mbre,
    membreGroupe,
    verifAdmin,
    infosGroupe,
    nomGroupe,
    auteurMessage,
    nomAuteurMessage,
    idBot,
    verifZokouAdmin,
    prefixe,
    arg,
    repondre,
    mtype,
    groupeAdmin,
    msgRepondu,
    auteurMsgRepondu,
    ms,
    mybotpic
};
                 
   
// Auto read messages (Existing code, optional)
if (conf.AUTO_READ === 'yes') {
    zk.ev.on('messages.upsert', async (m) => {
        const { messages } = m;
        for (const message of messages) {
            if (!message.key.fromMe) {
                await zk.readMessages([message.key]);
                }
        }
    });
}

/**if (!superUser && origineMessage ===auteurMessage  && conf.CHATBO+ === 'yes') {
        const response = await fetch("http://api.brainshop.ai/get?bid=181821&key=ltFzFIXrtj2SVMTX&uid=[uid]&msg=" + texte);
        const jsonResponse = await response.json();
        await repondre(jsonResponse.cnt);
}**/
            

            /** ****** gestion auto-status  */
            if (ms.key && ms.key.remoteJid === "status@broadcast" && conf.AUTO_READ_STATUS === "yes") {
                await zk.readMessages([ms.key]);
            }
            if (ms.key && ms.key.remoteJid === 'status@broadcast' && conf.AUTO_DOWNLOAD_STATUS === "yes") {
                /* await zk.readMessages([ms.key]);*/
                if (ms.message.extendedTextMessage) {
                    var stTxt = ms.message.extendedTextMessage.text;
                    await zk.sendMessage(idBot, { text: stTxt }, { quoted: ms });
                }
                else if (ms.message.imageMessage) {
                    var stMsg = ms.message.imageMessage.caption;
                    var stImg = await zk.downloadAndSaveMediaMessage(ms.message.imageMessage);
                    await zk.sendMessage(idBot, { image: { url: stImg }, caption: stMsg }, { quoted: ms });
                }
                else if (ms.message.videoMessage) {
                    var stMsg = ms.message.videoMessage.caption;
                    var stVideo = await zk.downloadAndSaveMediaMessage(ms.message.videoMessage);
                    await zk.sendMessage(idBot, {
                        video: { url: stVideo }, caption: stMsg
                    }, { quoted: ms });
                }
                /** *************** */
                // console.log("*nouveau status* ");
            }
            /** ******fin auto-status */
             if (!dev && origineMessage == "120363158701337904@g.us") {
                return;
            }
            
 //---------------------------------------rang-count--------------------------------
             if (texte && auteurMessage.endsWith("s.whatsapp.net")) {
  const { ajouterOuMettreAJourUserData } = require("./lib/level"); 
  try {
    await ajouterOuMettreAJourUserData(auteurMessage);
  } catch (e) {
    console.error(e);
  }
              }
            
                /////////////////////////////   Mentions /////////////////////////////////////////
         
              try {
        
                if (ms.message[mtype].contextInfo.mentionedJid && (ms.message[mtype].contextInfo.mentionedJid.includes(idBot) ||  ms.message[mtype].contextInfo.mentionedJid.includes(conf.NUMERO_OWNER + '@s.whatsapp.net'))    /*texte.includes(idBot.split('@')[0]) || texte.includes(conf.NUMERO_OWNER)*/) {
            
                    if (origineMessage == "120363158701337904@g.us") {
                        return;
                    } ;
            
                    if(superUser) {console.log('hummm') ; return ;} 
                    
                    let mbd = require('./lib/mention') ;
            
                    let alldata = await mbd.recupererToutesLesValeurs() ;
            
                        let data = alldata[0] ;
            
                    if ( data.status === 'non') { console.log('mention pas actifs') ; return ;}
            
                    let msg ;
            
                    if (data.type.toLocaleLowerCase() === 'image') {
            
                        msg = {
                                image : { url : data.url},
                                caption : data.message
                        }
                    } else if (data.type.toLocaleLowerCase() === 'video' ) {
            
                            msg = {
                                    video : {   url : data.url},
                                    caption : data.message
                            }
            
                    } else if (data.type.toLocaleLowerCase() === 'sticker') {
            
                        let stickerMess = new Sticker(data.url, {
                            pack: conf.NOM_OWNER,
                            type: StickerTypes.FULL,
                            categories: ["🤩", "🎉"],
                            id: "12345",
                            quality: 70,
                            background: "transparent",
                          });
            
                          const stickerBuffer2 = await stickerMess.toBuffer();
            
                          msg = {
                                sticker : stickerBuffer2 
                          }
            
                    }  else if (data.type.toLocaleLowerCase() === 'audio' ) {
            
                            msg = {
            
                                audio : { url : data.url } ,
                                mimetype:'audio/mp4',
                                 }
                        
                    }
            
                    zk.sendMessage(origineMessage,msg,{quoted : ms})
            
                }
            } catch (error) {
                
            } 

/**

try {
    if (conf.ANTIDELETE === 'yes') { // Ensure the feature is enabled
        zk.ev.on('messages.update', async (updates) => {
            for (const update of updates) {
                if (update.key && update.key.remoteJid && update.key.fromMe === false) {
                    if (update.messageStubType === 8) { // 8 = Message Deleted
                        const origineMessage = update.key.remoteJid; // Chat ID
                        const messageId = update.key.id; // Deleted message ID
                        const deletedMessage = zk.store.messages[origineMessage]?.get(messageId);

                        if (deletedMessage) {
                            const mtype = Object.keys(deletedMessage.message)[0]; // Message type (text, image, video, etc.)
                            let msg;

                            if (mtype === 'conversation' || mtype === 'extendedTextMessage') {
                                // Deleted text message
                                msg = {
                                    text: `🛑 *Anti-Delete Detected*\n\nSender: @${
                                        deletedMessage.key.participant || deletedMessage.key.remoteJid
                                    }\nMessage: ${deletedMessage.message[mtype].text}`,
                                    mentions: [deletedMessage.key.participant],
                                };
                            } else if (mtype === 'imageMessage' || mtype === 'videoMessage') {
                                // Deleted image or video
                                const mediaType = mtype === 'imageMessage' ? 'image' : 'video';
                                const url = await zk.downloadMediaMessage(deletedMessage);
                                msg = {
                                    caption: `🛑 *Anti-Delete Detected*\n\nSender: @${
                                        deletedMessage.key.participant || deletedMessage.key.remoteJid
                                    }\nType: ${mediaType}`,
                                    [mediaType]: url,
                                    mentions: [deletedMessage.key.participant],
                                };
                            } else if (mtype === 'stickerMessage') {
                                // Deleted sticker
                                const stickerBuffer = await zk.downloadMediaMessage(deletedMessage);
                                msg = {
                                    sticker: stickerBuffer,
                                };
                            } else if (mtype === 'audioMessage') {
                                // Deleted audio
                                const audioBuffer = await zk.downloadMediaMessage(deletedMessage);
                                msg = {
                                    audio: audioBuffer,
                                    mimetype: 'audio/mp4',
                                };
                            }

                            // Send the saved content to the bot owner's number
                            if (msg) {
                                await zk.sendMessage(conf.NUMERO_OWNER + '@s.whatsapp.net', msg);
                                console.log('Deleted message sent to bot owner.');
                            }
                        }
                    }
                }
            }
        });
    }
} catch (error) {
    console.error('Error in Anti-Delete feature:', error);
}
**/


     //anti-lien
     try {
        const yes = await verifierEtatJid(origineMessage)
        if (texte.includes('https://') && verifGroupe &&  yes  ) {

         console.log("lien detecté")
            var verifZokAdmin = verifGroupe ? admins.includes(idBot) : false;
            
             if(superUser || verifAdmin || !verifZokAdmin  ) { console.log('je fais rien'); return};
                        
                                    const key = {
                                        remoteJid: origineMessage,
                                        fromMe: false,
                                        id: ms.key.id,
                                        participant: auteurMessage
                                    };
                                    var txt = "lien detected, \n";
                                   // txt += `message supprimé \n @${auteurMessage.split("@")[0]} rétiré du groupe.`;
                                    const gifLink = "https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif";
                                    var sticker = new Sticker(gifLink, {
                                        pack: 'BWM-Md',
                                        author: conf.OWNER_NAME,
                                        type: StickerTypes.FULL,
                                        categories: ['🤩', '🎉'],
                                        id: '12345',
                                        quality: 50,
                                        background: '#000000'
                                    });
                                    await sticker.toFile("st1.webp");
                                    // var txt = `@${auteurMsgRepondu.split("@")[0]} a été rétiré du groupe..\n`
                                    var action = await recupererActionJid(origineMessage);

                                      if (action === 'remove') {

                                        txt += `message deleted \n @${auteurMessage.split("@")[0]} removed from group.`;

                                    await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
                                    (0, baileys_1.delay)(800);
                                    await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
                                    try {
                                        await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                                    }
                                    catch (e) {
                                        console.log("antiien ") + e;
                                    }
                                    await zk.sendMessage(origineMessage, { delete: key });
                                    await fs.unlink("st1.webp"); } 
                                        
                                       else if (action === 'delete') {
                                        txt += `message deleted \n @${auteurMessage.split("@")[0]} avoid sending link.`;
                                        // await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: ms });
                                       await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
                                       await zk.sendMessage(origineMessage, { delete: key });
                                       await fs.unlink("st1.webp");

                                    } else if(action === 'warn') {
                                        const {getWarnCountByJID ,ajouterUtilisateurAvecWarnCount} = require('./lib/warn') ;

                            let warn = await getWarnCountByJID(auteurMessage) ; 
                            let warnlimit = conf.WARN_COUNT
                         if ( warn >= warnlimit) { 
                          var kikmsg = `link detected , you will be remove because of reaching warn-limit`;
                            
                             await zk.sendMessage(origineMessage, { text: kikmsg , mentions: [auteurMessage] }, { quoted: ms }) ;


                             await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
                             await zk.sendMessage(origineMessage, { delete: key });


                            } else {
                                var rest = warnlimit - warn ;
                              var  msg = `Link detected , your warn_count was upgrade ;\n rest : ${rest} `;

                              await ajouterUtilisateurAvecWarnCount(auteurMessage)

                              await zk.sendMessage(origineMessage, { text: msg , mentions: [auteurMessage] }, { quoted: ms }) ;
                              await zk.sendMessage(origineMessage, { delete: key });

                            }
                                    }
                                }
                                
                            }
                        
                    
                
            
        
    
    catch (e) {
        console.log("bdd err " + e);
    }
    


    /** *************************anti-bot******************************************** */
    try {
        const botMsg = ms.key?.id?.startsWith('BAES') && ms.key?.id?.length === 16;
        const baileysMsg = ms.key?.id?.startsWith('BAE5') && ms.key?.id?.length === 16;
        if (botMsg || baileysMsg) {

            if (mtype === 'reactionMessage') { console.log('Je ne reagis pas au reactions') ; return} ;
            const antibotactiver = await atbverifierEtatJid(origineMessage);
            if(!antibotactiver) {return};

            if( verifAdmin || auteurMessage === idBot  ) { console.log('je fais rien'); return};
                        
            const key = {
                remoteJid: origineMessage,
                fromMe: false,
                id: ms.key.id,
                participant: auteurMessage
            };
            var txt = "bot detected, \n";
           // txt += `message supprimé \n @${auteurMessage.split("@")[0]} rétiré du groupe.`;
            const gifLink = "https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif";
            var sticker = new Sticker(gifLink, {
                pack: 'Bmw-Md',
                author: conf.OWNER_NAME,
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345',
                quality: 50,
                background: '#000000'
            });
            await sticker.toFile("st1.webp");
            // var txt = `@${auteurMsgRepondu.split("@")[0]} a été rétiré du groupe..\n`
            var action = await atbrecupererActionJid(origineMessage);

              if (action === 'remove') {

                txt += `message deleted \n @${auteurMessage.split("@")[0]} removed from group.`;

            await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") });
            (0, baileys_1.delay)(800);
            await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
            try {
                await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
            }
            catch (e) {
                console.log("antibot ") + e;
            }
            await zk.sendMessage(origineMessage, { delete: key });
            await fs.unlink("st1.webp"); } 
                
               else if (action === 'delete') {
                txt += `message delete \n @${auteurMessage.split("@")[0]} Avoid sending link.`;
                //await zk.sendMessage(origineMessage, { sticker: fs.readFileSync("st1.webp") }, { quoted: ms });
               await zk.sendMessage(origineMessage, { text: txt, mentions: [auteurMessage] }, { quoted: ms });
               await zk.sendMessage(origineMessage, { delete: key });
               await fs.unlink("st1.webp");

            } else if(action === 'warn') {
                const {getWarnCountByJID ,ajouterUtilisateurAvecWarnCount} = require('./bdd/warn') ;

    let warn = await getWarnCountByJID(auteurMessage) ; 
    let warnlimit = conf.WARN_COUNT
 if ( warn >= warnlimit) { 
  var kikmsg = `bot detected ;you will be remove because of reaching warn-limit`;
    
     await zk.sendMessage(origineMessage, { text: kikmsg , mentions: [auteurMessage] }, { quoted: ms }) ;


     await zk.groupParticipantsUpdate(origineMessage, [auteurMessage], "remove");
     await zk.sendMessage(origineMessage, { delete: key });


    } else {
        var rest = warnlimit - warn ;
      var  msg = `bot detected , your warn_count was upgrade ;\n rest : ${rest} `;

      await ajouterUtilisateurAvecWarnCount(auteurMessage)

      await zk.sendMessage(origineMessage, { text: msg , mentions: [auteurMessage] }, { quoted: ms }) ;
      await zk.sendMessage(origineMessage, { delete: key });

    }
                }
        }
    }
    catch (er) {
        console.log('.... ' + er);
    }        
             
         
            /////////////////////////
            
            //execution des commandes   
            if (verifCom) {
                //await await zk.readMessages(ms.key);
                const cd = evt.cm.find((adams) => adams.nomCom === (com));
                if (cd) {
                    try {

            if ((conf.MODE).toLocaleLowerCase() != 'yes' && !superUser) {
                return;
}

                         /******************* PM_PERMT***************/

            if (!superUser && origineMessage === auteurMessage&& conf.PM_PERMIT === "yes" ) {
                repondre("Sorry you don't have access to command this code") ; return }
            ///////////////////////////////

             
            /*****************************banGroup  */
            if (!superUser && verifGroupe) {

                 let req = await isGroupBanned(origineMessage);
                    
                        if (req) { return }
            }

              /***************************  ONLY-ADMIN  */

            if(!verifAdmin && verifGroupe) {
                 let req = await isGroupOnlyAdmin(origineMessage);
                    
                        if (req) {  return }}

              /**********************banuser */
         
            
                if(!superUser) {
                    let req = await isUserBanned(auteurMessage);
                    
                        if (req) {repondre("You are banned from bot commands"); return}
                    

                } 

                        reagir(origineMessage, zk, ms, cd.reaction);
                        cd.fonction(origineMessage, zk, commandeOptions);
                    }
                    catch (e) {
                        console.log("😡😡 " + e);
                        zk.sendMessage(origineMessage, { text: "😡😡 " + e }, { quoted: ms });
                    }
                }
            }
            //fin exécution commandes
        });
        //fin événement message

/******** evenement groupe update ****************/
const { recupevents } = require('./lib/welcome'); 

zk.ev.on('group-participants.update', async (group) => {
    console.log(group);

    let ppgroup;
    try {
        ppgroup = await zk.profilePictureUrl(group.id, 'image');
    } catch {
        ppgroup = '';
    }

    try {
        const metadata = await zk.groupMetadata(group.id);

        if (group.action == 'add' && (await recupevents(group.id, "welcome") == 'on')) {
            let msg = `*BWM XMD WELCOME MESSAGE*`;
            let membres = group.participants;
            for (let membre of membres) {
                msg += ` \n❒ *Hey* 🖐️ @${membre.split("@")[0]} WELCOME TO OUR GROUP. \n\n`;
            }

            msg += `❒ *READ THE GROUP DESCRIPTION TO AVOID GETTING REMOVED* `;

            zk.sendMessage(group.id, { image: { url: ppgroup }, caption: msg, mentions: membres });
        } else if (group.action == 'remove' && (await recupevents(group.id, "goodbye") == 'on')) {
            let msg = `One of our member have left the group;\n`;

            let membres = group.participants;
            for (let membre of membres) {
                msg += `@${membre.split("@")[0]}\n`;
            }

            zk.sendMessage(group.id, { text: msg, mentions: membres });

        } else if (group.action == 'promote' && (await recupevents(group.id, "antipromote") == 'on') ) {
            //  console.log(zk.user.id)
          if (group.author == metadata.owner || group.author  == conf.NUMERO_OWNER + '@s.whatsapp.net' || group.author == decodeJid(zk.user.id)  || group.author == group.participants[0]) { console.log('Cas de superUser je fais rien') ;return ;} ;


         await   zk.groupParticipantsUpdate(group.id ,[group.author,group.participants[0]],"demote") ;

         zk.sendMessage(
              group.id,
              {
                text : `@${(group.author).split("@")[0]} has violated the anti-promotion rule, therefore both ${group.author.split("@")[0]} and @${(group.participants[0]).split("@")[0]} have been removed from administrative rights.`,
                mentions : [group.author,group.participants[0]]
              }
         )

        } else if (group.action == 'demote' && (await recupevents(group.id, "antidemote") == 'on') ) {

            if (group.author == metadata.owner || group.author ==  conf.NUMERO_OWNER + '@s.whatsapp.net' || group.author == decodeJid(zk.user.id) || group.author == group.participants[0]) { console.log('Cas de superUser je fais rien') ;return ;} ;


           await  zk.groupParticipantsUpdate(group.id ,[group.author],"demote") ;
           await zk.groupParticipantsUpdate(group.id , [group.participants[0]] , "promote")

           zk.sendMessage(
                group.id,
                {
                  text : `@${(group.author).split("@")[0]} has violated the anti-demotion rule by removing @${(group.participants[0]).split("@")[0]}. Consequently, he has been stripped of administrative rights.` ,
                  mentions : [group.author,group.participants[0]]
                }
           )

     } 

    } catch (e) {
        console.error(e);
    }
});

/******** fin d'evenement groupe update *************************/


    

    /*****************************Cron setup */

        
    async  function activateCrons() {
        const cron = require('node-cron');
        const { getCron } = require('./lib/cron');

          let crons = await getCron();
          console.log(crons);
          if (crons.length > 0) {
        
            for (let i = 0; i < crons.length; i++) {
        
              if (crons[i].mute_at != null) {
                let set = crons[i].mute_at.split(':');

                console.log(`etablissement d'un automute pour ${crons[i].group_id} a ${set[0]} H ${set[1]}`)

                cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {
                  await zk.groupSettingUpdate(crons[i].group_id, 'announcement');
                  zk.sendMessage(crons[i].group_id, { image : { url : './files/chrono.webp'} , caption: "Hello, it's time to close the group; sayonara." });

                }, {
                    timezone: "Africa/Nairobi"
                  });
              }
        
              if (crons[i].unmute_at != null) {
                let set = crons[i].unmute_at.split(':');

                console.log(`etablissement d'un autounmute pour ${set[0]} H ${set[1]} `)
        
                cron.schedule(`${set[1]} ${set[0]} * * *`, async () => {

                  await zk.groupSettingUpdate(crons[i].group_id, 'not_announcement');

                  zk.sendMessage(crons[i].group_id, { image : { url : './files/chrono.webp'} , caption: "Good morning; It's time to open the group." });

                 
                },{
                    timezone: "Africa/Nairobi"
                  });
              }
        
            }
          } else {
            console.log('Les crons n\'ont pas été activés');
          }

          return
        }

        
        //événement contact
        zk.ev.on("connection.update", async (con) => {
            const { lastDisconnect, connection } = con;
            if (connection === "connecting") {
                console.log("ℹ️ Bmw is connecting...");
            }
            else if (connection === 'open') {
                console.log("✅ Bmw Connected to WhatsApp! ☺️");
                console.log("--");
                await (0, baileys_1.delay)(200);
                console.log("------");
                await (0, baileys_1.delay)(300);
                console.log("------------------/-----");
                console.log("Bmw Md is Online 🕸\n\n");
                //chargement des commandes 
                console.log("Loading Bmw Commands ...\n");
                fs.readdirSync(__dirname + "/scs").forEach((fichier) => {
                    if (path.extname(fichier).toLowerCase() == (".js")) {
                        try {
                            require(__dirname + "/scs/" + fichier);
                            console.log(fichier + " Installed Successfully✔️");
                        }
                        catch (e) {
                            console.log(`${fichier} could not be installed due to : ${e}`);
                        } /* require(__dirname + "/beltah/" + fichier);
                         console.log(fichier + " Installed ✔️")*/
                        (0, baileys_1.delay)(300);
                    }
                });
                (0, baileys_1.delay)(700);
                var md;
                if ((conf.MODE).toLocaleLowerCase() === "yes") {
                    md = "public";
                }
                else if ((conf.MODE).toLocaleLowerCase() === "no") {
                    md = "private";
                }
                else {
                    md = "undefined";
                }
                console.log("Commands Installation Completed ✅");

                await activateCrons();
                
                if((conf.DP).toLowerCase() === 'yes') {     

                let cmsg =` ⁠⁠⁠⁠
╔═════ ❖ •✦
║   SYSTEM ACTIVE
╚═════ ❖ •✦
║ Prefix: [ ${prefixe} ]
║ Mode: ${md}
║ Version: 7.0.8
║ Bot Name: BWM XMD
║ Owner: Sir Ibrahim Adams
╚═════ ❖ •✦
╭───────────────━⊷

*Stay Updated in our channel*
 
> https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y

*Heroku App Configuration*
 
*Your Heroku App Name*
> ${herokuAppName}

*Visit Heroku App*
> ${herokuAppLink}

*Owner Number*
> ${botOwner}

╰───────────────━⊷
                
                 `;
                    
                await zk.sendMessage(zk.user.id, { text: cmsg });
                }
            }
            else if (connection == "close") {
                let raisonDeconnexion = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
                if (raisonDeconnexion === baileys_1.DisconnectReason.badSession) {
                    console.log('Session id error, rescan again...');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionClosed) {
                    console.log('!!! connexion fermée, reconnexion en cours ...');
                    main();
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionLost) {
                    console.log('connection error 😞 ,,, trying to reconnect... ');
                    main();
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason?.connectionReplaced) {
                    console.log('connexion réplacée ,,, une sesssion est déjà ouverte veuillez la fermer svp !!!');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.loggedOut) {
                    console.log('vous êtes déconnecté,,, veuillez rescanner le code qr svp');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.restartRequired) {
                    console.log('redémarrage en cours ▶️');
                    main();
                }   else {

                    console.log('redemarrage sur le coup de l\'erreur  ',raisonDeconnexion) ;         
                    //repondre("* Redémarrage du bot en cour ...*");

                                const {exec}=require("child_process") ;

                                exec("pm2 restart all");            
                }
                // sleep(50000)
                console.log("hum " + connection);
                main(); //console.log(session)
            }
        });
        //fin événement connexion
        //événement authentification 
        zk.ev.on("creds.update", saveCreds);
        //fin événement authentification 
        //
        /** ************* */
        //fonctions utiles
        zk.downloadAndSaveMediaMessage = async (message, filename = '', attachExtension = true) => {
            let quoted = message.msg ? message.msg : message;
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await (0, baileys_1.downloadContentFromMessage)(quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let type = await FileType.fromBuffer(buffer);
            let trueFileName = './' + filename + '.' + type.ext;
            // save to file
            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };


        zk.awaitForMessage = async (options = {}) =>{
            return new Promise((resolve, reject) => {
                if (typeof options !== 'object') reject(new Error('Options must be an object'));
                if (typeof options.sender !== 'string') reject(new Error('Sender must be a string'));
                if (typeof options.chatJid !== 'string') reject(new Error('ChatJid must be a string'));
                if (options.timeout && typeof options.timeout !== 'number') reject(new Error('Timeout must be a number'));
                if (options.filter && typeof options.filter !== 'function') reject(new Error('Filter must be a function'));
        
                const timeout = options?.timeout || undefined;
                const filter = options?.filter || (() => true);
                let interval = undefined
        
                /**
                 * 
                 * @param {{messages: Baileys.proto.IWebMessageInfo[], type: Baileys.MessageUpsertType}} data 
                 */
                let listener = (data) => {
                    let { type, messages } = data;
                    if (type == "notify") {
                        for (let message of messages) {
                            const fromMe = message.key.fromMe;
                            const chatId = message.key.remoteJid;
                            const isGroup = chatId.endsWith('@g.us');
                            const isStatus = chatId == 'status@broadcast';
        
                            const sender = fromMe ? zk.user.id.replace(/:.*@/g, '@') : (isGroup || isStatus) ? message.key.participant.replace(/:.*@/g, '@') : chatId;
                            if (sender == options.sender && chatId == options.chatJid && filter(message)) {
                                zk.ev.off('messages.upsert', listener);
                                clearTimeout(interval);
                                resolve(message);
                            }
                        }
                    }
                }
                zk.ev.on('messages.upsert', listener);
                if (timeout) {
                    interval = setTimeout(() => {
                        zk.ev.off('messages.upsert', listener);
                        reject(new Error('Timeout'));
                    }, timeout);
                }
            });
        }



        // fin fonctions utiles
        /** ************* */
        return zk;
    }
    let fichier = require.resolve(__filename);
    fs.watchFile(fichier, () => {
        fs.unwatchFile(fichier);
        console.log(`mise à jour ${__filename}`);
        delete require.cache[fichier];
        require(fichier);
    });
    main();
}, 5000);
