// ╔══════════════════════════════════════════════════════════╗
// ║  ██████╗ ██╗    ██╗███╗   ███╗ ██╗  ██╗██████╗ ██████╗  ║
// ║  ██╔══██╗██║    ██║████╗ ████║ ╚██╗██╔╝╚════██╗██╔══██╗ ║
// ║  ██████╔╝██║ █╗ ██║██╔████╔██║  ╚███╔╝  █████╔╝██║  ██║ ║
// ║  ██╔══██╗██║███╗██║██║╚██╔╝██║  ██╔██╗  ╚═══██╗██║  ██║ ║
// ║  ██████╔╝╚███╔███╔╝██║ ╚═╝ ██║ ██╔╝ ██╗██████╔╝██████╔╝ ║
// ║  ╚═════╝  ╚══╝╚══╝ ╚═╝     ╚═╝ ╚═╝  ╚═╝╚═════╝ ╚═════╝  ║
// ╚══════════════════════════════════════════════════════════╝

const fs = require('fs-extra');
const path = require("path");

// ════════════════════════════════════════════════════════════
// ║  🌀 ENVIRONMENT CONFIGURATION
// ╚═══════════════════════════════════════════════════════════
if (fs.existsSync('config.env')) {
    require('dotenv').config({ path: __dirname + '/config.env' });
}

// ════════════════════════════════════════════════════════════
// ║  ⚙️ CORE CONFIGURATION (Type-Safe)
// ╚═══════════════════════════════════════════════════════════
const config = {
    // 🔐 AUTHENTICATION
    '╔═► SESSION': String(process.env.SESSION_ID || ''),
    '╠═► PREFIX': String(process.env.PREFIX || "✧"),
    
    // 👑 OWNERSHIP
    '╔═► OWNER_NAME': String(process.env.OWNER_NAME || "🔥 BWM-XMD"),
    '╠═► OWNER_NUMBER': String(process.env.OWNER_NUMBER || "254106727593"),
    
    // 🤖 BOT IDENTITY
    '╔═► BOT_NAME': String(process.env.BOT_NAME || '⚡ BWM-XMD'),
    '╠═► BOT_AVATAR': String(process.env.BOT_MENU_LINKS || 'https://i.imgur.com/8K5fjOP.jpg'),
    
    // 🌐 OPERATION MODE
    '╔═► MODE': String(process.env.PUBLIC_MODE || "yes"),
    '╠═► STATUS': String(process.env.PRESENCE || '2'),
    
    // 💾 DATABASE
    '╔═► DATABASE': String(process.env.DATABASE_URL || "sqlite:///bwm-xmd.db"),
    
    // 🎚️ FEATURE TOGGLES
    '╔═► AUTO_FEATURES': {
        '║  ├─► READ': String(process.env.AUTO_READ_STATUS || "yes"),
        '║  ├─► DOWNLOAD': String(process.env.AUTO_DOWNLOAD_STATUS || "no"),
        '║  ├─► BIO': String(process.env.AUTO_BIO || "yes"),
        '║  └─► REACT': String(process.env.AUTO_REACT || "yes")
    },
    
    // 🛡️ SECURITY
    '╔═► PROTECTION': {
        '║  ├─► ANTICALL': String(process.env.ANTICALL || "yes"),
        '║  ├─► ANTILINK': String(process.env.GROUP_ANTILINK || "yes"),
        '║  └─► WARN_LIMIT': String(process.env.WARN_COUNT || "3")
    },
    
    // 💬 CHAT SYSTEMS
    '╔═► CHAT': {
        '║  ├─► CHATBOT': String(process.env.CHATBOT || "yes"),
        '║  ├─► VOICE_CHATBOT': String(process.env.AUDIO_CHATBOT || "yes"),
        '║  └─► WELCOME_MSG': String(process.env.WELCOME_MESSAGE || "yes")
    },
    
    // 🚀 DEPLOYMENT
    '╔═► HEROKU': {
        '║  ├─► APP_NAME': String(process.env.HEROKU_APP_NAME || ""),
        '║  └─► API_KEY': String(process.env.HEROKU_API_KEY || "")
    }
};

// ════════════════════════════════════════════════════════════
// ║  🔄 CONFIG HOT-RELOAD
// ╚═══════════════════════════════════════════════════════════
let configFile = require.resolve(__filename);
fs.watchFile(configFile, () => {
    fs.unwatchFile(configFile);
    console.log('╔════════════════════════════════════════╗');
    console.log('║    🔄 CONFIGURATION RELOADED           ║');
    console.log('╚════════════════════════════════════════╝');
    delete require.cache[configFile];
    require(configFile);
});

module.exports = config;
