//═══════[ 𝙎𝙀𝙏𝙏𝙄𝙉𝙂𝙎 & �𝘾𝙊𝙉𝙁𝙄𝙂 ]═══════✧//
const fs = require('fs-extra');
const path = require("path");

// Load environment variables
if (fs.existsSync('config.env')) {
    require('dotenv').config({ path: __dirname + '/config.env' });
}

//═══════[ 𝘽𝙊𝙏 𝘾𝙊𝙉𝙁𝙄𝙂𝙐𝙍𝘼𝙏𝙄𝙊𝙉 ]═══════✧//
module.exports = {
    //═══════[ 𝘾𝙊𝙍𝙀 𝘾𝙊𝙉𝙁𝙄𝙂 ]═══════✧//
    session: process.env.SESSION_ID || '',
    PREFIX: process.env.PREFIX || "●",
    MODE: (process.env.PUBLIC_MODE || "yes").toLowerCase(),
    
    //═══════[ 𝙊𝙒𝙉𝙀𝙍 𝘿𝙀𝙏𝘼𝙄𝙇𝙎 ]═══════✧//
    OWNER_NAME: process.env.OWNER_NAME || "🚀 BWM-XMD",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "254106727593",
    
    //═══════[ 𝘽𝙊𝙏 �𝙍𝙊𝙁𝙄𝙇𝙀 ]═══════✧//
    BOT: process.env.BOT_NAME || '⚡ BWM-XMD',
    URL: process.env.BOT_MENU_LINKS || 'https://files.catbox.moe/h2ydge.jpg',
    DP: (process.env.STARTING_BOT_MESSAGE || "yes").toLowerCase(),
    
    //═══════[ 𝙋𝙍𝙀𝙎𝙀𝙉𝘾𝙀 & 𝘼𝙐𝙏𝙊𝙈𝘼𝙏𝙄𝙊𝙉 ]═══════✧//
    ETAT: process.env.PRESENCE || '2',
    AUTO_READ: (process.env.AUTO_READ || "yes").toLowerCase(),
    AUTO_READ_STATUS: (process.env.AUTO_READ_STATUS || "yes").toLowerCase(),
    AUTO_DOWNLOAD_STATUS: (process.env.AUTO_DOWNLOAD_STATUS || "no").toLowerCase(),
    
    //═══════[ 𝘾𝙃𝘼𝙏 𝙁𝙀𝘼𝙏𝙐𝙍𝙀𝙎 ]═══════✧//
    CHATBOT: (process.env.CHATBOT || "yes").toLowerCase(),
    CHATBOT1: (process.env.AUDIO_CHATBOT || "yes").toLowerCase(),
    AUTO_REPLY: (process.env.AUTO_REPLY || "no").toLowerCase(),
    
    //═══════[ 𝙎𝙀𝘾𝙐𝙍𝙄𝙏𝙔 𝙎𝙀𝙏𝙏𝙄𝙉𝙂𝙎 ]═══════✧//
    ANTICALL: (process.env.ANTICALL || "yes").toLowerCase(),
    PM_PERMIT: (process.env.PM_PERMIT || "yes").toLowerCase(),
    GROUP_ANTILINK: (process.env.GROUP_ANTILINK || "yes").toLowerCase(),
    WARN_COUNT: process.env.WARN_COUNT || '3',
    
    //═══════[ �𝙍𝙀𝙎𝙀𝙉𝘾𝙀 𝘾𝙊𝙉𝙏𝙍𝙊𝙇𝙎 ]═══════✧//
    STATUS_REACT_EMOJIS: process.env.STATUS_REACT_EMOJIS || "🚀,🌎",
    
    //═══════[ �𝙍𝙊 �𝙇𝘼𝙉 𝘾𝙊𝙉𝙁𝙄𝙂 ]═══════✧//
    HEROKU_APP_NAME: process.env.HEROKU_APP_NAME,
    HEROKU_API_KEY: process.env.HEROKU_API_KEY,
    
    //═══════[ 𝘿𝙀𝙇𝘾𝙊𝙈𝙀/𝙂𝙊𝙊𝘿𝘽𝙔𝙀 ]═══════✧//
    WELCOME_MESSAGE: (process.env.WELCOME_MESSAGE || "yes").toLowerCase(),
    GOODBYE_MESSAGE: (process.env.GOODBYE_MESSAGE || "yes").toLowerCase(),
    
    //═══════[ 𝘼𝙐𝙏𝙊 𝙁𝙀𝘼𝙏𝙐𝙍𝙀𝙎 ]═══════✧//
    AUTO_REACT: (process.env.AUTO_REACT || "yes").toLowerCase(),
    AUTO_REACT_STATUS: (process.env.AUTO_REACT_STATUS || "yes").toLowerCase(),
    AUTO_SAVE_CONTACTS: (process.env.AUTO_SAVE_CONTACTS || "yes").toLowerCase(),
    AUTO_REJECT_CALL: (process.env.AUTO_REJECT_CALL || "yes").toLowerCase(),
    AUTO_BIO: (process.env.AUTO_BIO || "yes").toLowerCase(),
    AUDIO_REPLY: (process.env.AUDIO_REPLY || "no").toLowerCase(),
    
    //═══════[ 𝘿𝘼𝙏𝘼𝘽𝘼𝙎𝙀 ]═══════✧//
    DATABASE: process.env.DATABASE_URL || "sqlite://./database.db"
};

//═══════[ 𝘾𝙊𝙉𝙁𝙄𝙂 𝙒𝘼𝙏𝘾𝙃𝙀𝙍 ]═══════✧//
let configFile = require.resolve(__filename);
fs.watchFile(configFile, () => {
    fs.unwatchFile(configFile);
    console.log(`♻️  Config file updated: ${__filename}`);
    delete require.cache[configFile];
    require(configFile);
});
