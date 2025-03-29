

const fs = require('fs-extra');
const path = require('path');
const { config } = require('dotenv');
const Joi = require('joi'); // Add validation

// Load environment variables
if (fs.existsSync(path.join(__dirname, '.env'))) {
    config({ path: path.join(__dirname, '.env') });
}

// Database configuration
const databasePath = path.join(__dirname, 'database.db');
const DEFAULT_DB_URL = 'postgresql://postgres:bKlIqoOUWFIHOAhKxRWQtGfKfhGKgmRX@viaduct.proxy.rlwy.net:47738/railway';

// Validate environment variables
const envVars = Joi.object({
    SESSION_ID: Joi.string().optional(),
    PREFIX: Joi.string().default('.'),
    OWNER_NAME: Joi.string().default('Ibrahim Adams'),
    NUMERO_OWNER: Joi.string().default('254710772666,254106727593'),
    DATABASE_URL: Joi.string().uri().default(DEFAULT_DB_URL),
    // Add validation for other variables...
}).validate(process.env);

if (envVars.error) {
    throw new Error(`Config validation error: ${envVars.error.message}`);
}

const configuration = {
    // Core Settings
    session: process.env.SESSION_ID || '',
    database: {
        url: process.env.DATABASE_URL || DEFAULT_DB_URL,
        dialect: process.env.DATABASE_URL?.startsWith('postgres') ? 'postgres' : 'sqlite',
        storage: databasePath,
        logging: false,
        dialectOptions: process.env.DATABASE_URL?.startsWith('postgres') ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {}
    },

    // Bot Settings
    botSettings: {
        prefix: process.env.PREFIX || '.',
        name: process.env.BOT_NAME || 'BMW_MD',
        menuImage: process.env.BOT_MENU_LINKS || 'https://files.catbox.moe/h2ydge.jpg',
        presence: process.env.PRESENCE || '2',
        menuType: process.env.MENUTYPE || 'text'
    },

    // Features Configuration
    features: {
        autoRead: process.env.AUTO_READ === 'yes',
        pmPermit: process.env.PM_PERMIT === 'yes',
        antiDelete: process.env.ANTIDELETE_MESSAGES === 'yes',
        antiCall: process.env.ANTICALL === 'yes',
        autoBio: process.env.AUTO_BIO === 'yes',
        chatbot: {
            text: process.env.CHATBOT === 'yes',
            audio: process.env.AUDIO_CHATBOT === 'yes'
        }
    },

    // Owner Configuration
    owner: {
        name: process.env.OWNER_NAME || 'Ibrahim Adams',
        numbers: (process.env.OWNER_NUMBER || '254710772666,254106727593').split(','),
        sudoNumbers: ['254710772666', '254710772666', '254710772666', '254710772666']
    },

    // Security Settings
    security: {
        warnLimit: parseInt(process.env.WARN_COUNT) || 3,
        antiLinkGroups: process.env.ANTILINK_GROUP === 'yes',
        autoReact: process.env.AUTO_REACT === 'yes'
    },

    // External Services
    services: {
        bwmXmd: 'https://ibrahimadams.site/bwmxmd',
        heroku: {
            appName: process.env.HEROKU_APP_NAME,
            apiKey: process.env.HEROKU_API_KEY
        }
    }
};

// File change watcher
if (require.main === module) {
    fs.watchFile(__filename, () => {
        console.log('Configuration updated - restart required');
        process.exit(0);
    });
}

module.exports = configuration;


