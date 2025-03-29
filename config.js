

const fs = require('fs-extra');
const path = require('path');

// Load environment variables
if (fs.existsSync('config.env')) {
    require('dotenv').config({ path: path.join(__dirname, 'config.env') });
}

module.exports = {
    // Core Settings
    SESSION: process.env.SESSION_ID || '',
    PREFIX: process.env.PREFIX || ".",
    
    // Owner Settings
    OWNER_NAME: process.env.OWNER_NAME || "Ibrahim Adams",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "254710772666,254106727593",
    
    // Bot Identity
    BOT_NAME: process.env.BOT || 'BWM-XMD',
    BOT_MENU_IMAGE: process.env.BOT_MENU_LINKS || 'https://files.catbox.moe/h2ydge.jpg',
    BWM_XMD: 'https://ibrahimadams.site/bwmxmd',
    
    // Behavior Flags
    MODE: process.env.PUBLIC_MODE || "yes",
    PM_PERMIT: process.env.PM_PERMIT || 'yes',
    CHATBOT: process.env.CHATBOT || 'no',
    
    // Automation Settings
    AUTO: {
        READ: process.env.AUTO_READ || 'yes',
        BIO: process.env.AUTO_BIO || 'yes',
        REACT: process.env.AUTO_REACT || 'yes',
        REPLY: process.env.AUTO_REPLY || 'no',
        SAVE_CONTACTS: process.env.AUTO_SAVE_CONTACTS || 'yes',
        REJECT_CALL: process.env.AUTO_REJECT_CALL || 'yes',
        DOWNLOAD_STATUS: process.env.AUTO_DOWNLOAD_STATUS || 'no',
        READ_STATUS: process.env.AUTO_READ_STATUS || 'yes'
    },
    
    // Security Features
    ANTICALL: process.env.ANTICALL || 'yes',
    ANTILINK_GROUP: process.env.ANTILINK_GROUP || 'yes',
    ANTIDELETE: {
        MESSAGES: process.env.ANTIDELETE_MESSAGES || 'yes',
        STATUS: process.env.ANTIDELETE2 || 'yes'
    },
    
    // Heroku Deployment
    HEROKU: {
        APP_NAME: process.env.HEROKU_APP_NAME,
        API_KEY: process.env.HEROKU_APY_KEY
    },
    
    // Miscellaneous
    WARN_LIMIT: process.env.WARN_COUNT || '3',
    STARTUP_MESSAGE: process.env.STARTING_BOT_MESSAGE || "yes",
    PRESENCE: process.env.PRESENCE || '2'
};

// Config file watcher
const configFile = path.resolve(__filename);
fs.watchFile(configFile, () => {
    fs.unwatchFile(configFile);
    console.log(`Config file updated: ${path.basename(configFile)}`);
    delete require.cache[configFile];
    require(configFile);
});


