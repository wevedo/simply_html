const fs = require('fs-extra');
const path = require("path");

// Path to the database
const databasePath = path.join(__dirname, './database.db');

// Default configuration object
const config = {
    session: '',
    PREFIXE: ".",
    OWNER_NAME: "Ibrahim Adams",
    NUMERO_OWNER: "Ibrahim Adams",
    AUTO_READ_STATUS: "yes",
    AUTO_DOWNLOAD_STATUS: "no",
    BOT: "BMW_MD",
    URL: "https://files.catbox.moe/h2ydge.jpg",
    MODE: "yes",
    PM_PERMIT: "yes",
    HEROKU_APP_NAME: "",
    HEROKU_APY_KEY: "",
    WARN_COUNT: '3',
    ETAT: '',
    CHATBOT: "yes",
    CHATBOT1: "yes",
    SELF_CHATBOT: "yes",
    DP: "yes",
    ANTIDELETE1: "yes",
    ANTIDELETE2: "yes",
    ANTICALL: "yes",
    MENUTYPE: '',
    AUTO_REACT: "yes",
    AUTO_REACT_STATUS: "yes",
    AUTO_REPLY: "yes",
    AUTO_READ: "yes",
    AUTO_SAVE_CONTACTS: "yes",
    AUTO_REJECT_CALL: "yes",
    AUTO_BIO: "yes",
    AUDIO_REPLY: "yes",
    ANTI_VV: "yes",
    AUTO_SAVE_CONTACTS_NAME: "🚀 ʙᴡᴍ xᴍᴅ",
    AUTO_REPLY_MESSAGE: "",
    DATABASE_URL: process.env.DATABASE_URL || databasePath,
    DATABASE: process.env.DATABASE_URL === databasePath
        ? "postgresql://postgres:bKlIqoOUWFIHOAhKxRWQtGfKfhGKgmRX@viaduct.proxy.rlwy.net:47738/railway"
        : "postgresql://postgres:bKlIqoOUWFIHOAhKxRWQtGfKfhGKgmRX@viaduct.proxy.rlwy.net:47738/railway",
};

// Function to update configuration values dynamically
function updateConfig(variable, value) {
    const configPath = __filename;

    try {
        // Read the current content of config.js
        let content = fs.readFileSync(configPath, 'utf8');

        // Create a regex pattern to locate the variable
        const regex = new RegExp(`(${variable}\\s*:\\s*)(["'].*?["']|\\S+)`, 'g');
        if (regex.test(content)) {
            // Update the variable with the new value
            content = content.replace(regex, `$1'${value}'`);
        } else {
            throw new Error(`⚠️ Variable ${variable} not found in config.js`);
        }

        // Write the updated content back to the file
        fs.writeFileSync(configPath, content, 'utf8');
        console.log(`✅ Successfully updated ${variable} to ${value}`);
    } catch (error) {
        console.error("Error updating config.js:", error.message);
        throw error;
    }
}

// Monitor the file for changes and reload it dynamically
fs.watchFile(__filename, () => {
    fs.unwatchFile(__filename);
    console.log(`♻️ Reloading ${__filename}`);
    delete require.cache[require.resolve(__filename)];
    require(__filename);
});

module.exports = { ...config, updateConfig };
