const fs = require('fs-extra');
const path = require("path");

if (fs.existsSync('config.env')) {
    require('dotenv').config({ path: __dirname + '/config.env' });
}

module.exports = { 
    // Session & Basic Config
    session: process.env.SESSION_ID || '',
    PREFIX: process.env.PREFIX || "●",
    
    // Owner Info
    OWNER_NAME: process.env.OWNER_NAME || "🚀 BMW-MD",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "254106727593",
    
    // Bot Settings
    BOT: process.env.BOT_NAME || '⚡ BMW-MD',
    URL: process.env.BOT_MENU_LINKS || 'https://files.catbox.moe/h2ydge.jpg',
    MODE: process.env.PUBLIC_MODE || "yes",
    
    // Presence & Status
    ETAT: process.env.PRESENCE || '2',
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "yes",
    AUTO_DOWNLOAD_STATUS: process.env.AUTO_DOWNLOAD_STATUS || 'no',
    
    // Features Toggles
    CHATBOT: process.env.CHATBOT || 'yes',
    CHATBOT1: process.env.AUDIO_CHATBOT || 'yes',
    ANTICALL: process.env.ANTICALL || 'yes',
    PM_PERMIT: process.env.PM_PERMIT || 'yes',
    WELCOME_MESSAGE: process.env.WELCOME_MESSAGE || 'yes',
    GOODBYE_MESSAGE: process.env.GOODBYE_MESSAGE || 'yes',
    
    // Auto Features
    AUTO_REACT: process.env.AUTO_REACT || 'yes',
    AUTO_REACT_STATUS: process.env.AUTO_REACT_STATUS || 'yes',
    AUTO_REPLY: process.env.AUTO_REPLY || 'no',
    AUTO_READ: process.env.AUTO_READ || 'yes',
    AUTO_BIO: process.env.AUTO_BIO || 'yes',
    AUTO_REJECT_CALL: process.env.AUTO_REJECT_CALL || 'yes',
    
    // Group Settings
    GROUP_ANTILINK: process.env.GROUP_ANTILINK || 'yes',
    WARN_COUNT: process.env.WARN_COUNT || '3',
    
    // Heroku
    HEROKU_APP_NAME: process.env.HEROKU_APP_NAME,
    HEROKU_API_KEY: process.env.HEROKU_API_KEY,
    
    // Message Settings
    STATUS_REACT_EMOJIS: process.env.STATUS_REACT_EMOJIS || "🚀,🌎",
    STARTING_BOT_MESSAGE: process.env.STARTING_BOT_MESSAGE || "yes",
    
    // Database (simplified)
    DATABASE: process.env.DATABASE_URL || "sqlite://./database.db"
};

let fichier = require.resolve(__filename);
fs.watchFile(fichier, () => {
    fs.unwatchFile(fichier);
    console.log(`🔁 Updated ${__filename}`);
    delete require.cache[fichier];
    require(fichier);
});
