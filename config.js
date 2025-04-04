

const fs = require('fs-extra');
const { Sequelize } = require('sequelize');
const path = require('path');

// Default configuration values
const config = {
    // Basic settings
    SESSION_ID: '', // Session ID for WhatsApp connection
    PREFIX: ".", // Command prefix
    OWNER_NAME: "Ibrahim Adams", // Bot owner's name
    OWNER_NUMBER: "254106727593", // Bot owner's number
    BOT: 'BMW_MD', // Bot name
    URL: 'https://files.catbox.moe/h2ydge.jpg', // Bot image URL
    BWM_XMD: 'https://ibrahimadams.site/bwmxmd', // Additional URL
    
    // Status settings
    AUTO_READ_STATUS: "yes", // Auto read status updates
    AUTO_DOWNLOAD_STATUS: 'no', // Auto download status updates
    PRESENCE: 'online', // Presence status (online, offline, etc.)
    
    // Mode settings
    MODE: "yes", // Public/private mode
    PM_PERMIT: 'yes', // PM permission control
    
    // Group settings
    GROUP_ANTILINK: 'yes', // Anti-link in groups
    GROUP_ANTILINK2: 'no', // Secondary anti-link control
    WELCOME_MESSAGE: 'yes', // Welcome message in groups
    GOODBYE_MESSAGE: 'yes', // Goodbye message in groups
    
    // Chatbot settings
    CHATBOT: 'yes', // Enable text chatbot
    AUDIO_CHATBOT: 'yes', // Enable voice chatbot
    AUTO_REPLY: 'no', // Auto reply to messages
    
    // Message handling
    ANTIDELETE: 'yes', // Anti-delete messages
    ANTIDELETE2: 'yes', // Secondary anti-delete control
    AUTO_READ: 'yes', // Auto read incoming messages
    
    // Reaction settings
    AUTO_REACT: 'yes', // Auto react to messages
    AUTO_REACT_STATUS: 'yes', // Auto react to status
    STATUS_REACT_EMOJIS: "🚀,🌎", // Emojis for reactions
    
    // Call settings
    ANTICALL: 'yes', // Block unwanted calls
    AUTO_REJECT_CALL: 'yes', // Auto reject calls
    
    // Other features
    AUTO_BIO: 'yes', // Auto update bio
    AUTO_SAVE_CONTACTS: 'yes', // Auto save new contacts
    DP: "yes", // Display picture settings
    MENUTYPE: '', // Menu type configuration
    
    // Warning system
    WARN_COUNT: '3', // Warning limit
    
    // Heroku settings (empty by default)
    HEROKU_APP_NAME: '',
    HEROKU_API_KEY: ''
};

// Database configuration - using SQLite locally
const databasePath = path.join(__dirname, './database.db');
const DATABASE = new Sequelize({
    dialect: 'sqlite',
    storage: databasePath,
    logging: false
});

module.exports = {
    ...config,
    DATABASE,
    DATABASE_URL: databasePath, // For backward compatibility
    // Aliases for compatibility
    ETAT: config.PRESENCE, // PRESENCE is now the main variable
    CHATBOT1: config.AUDIO_CHATBOT, // AUDIO_CHATBOT is now the main variable
    session: config.SESSION_ID // ANTIDELETE is now the main variable
};

// File watcher for hot reloading
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(`Updated ${__filename}`);
    delete require.cache[file];
    require(file);
});
