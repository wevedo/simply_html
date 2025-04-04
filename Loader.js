const fs = require('fs');
const path = require('path');
const { makeInMemoryStore } = require('@whiskeysockets/baileys');

// Initialize store
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

async function loadListeners(zk) {
    const listenersDir = path.join(__dirname, 'bwmxmd');
    
    if (!fs.existsSync(listenersDir)) {
        console.log('[!] bwmxmd directory not found, creating...');
        fs.mkdirSync(listenersDir);
        return;
    }

    const listenerFiles = fs.readdirSync(listenersDir).filter(file => file.endsWith('.js'));

    console.log('[+] Loading listeners from bwmxmd folder...');

    for (const file of listenerFiles) {
        try {
            const listenerPath = path.join(listenersDir, file);
            const listener = require(listenerPath);
            
            if (typeof listener === 'function') {
                listener(zk, store);
                console.log(`[+] Loaded: ${file}`);
            } else {
                console.log(`[!] Skipping ${file} - not a valid listener function`);
            }
        } catch (error) {
            console.log(`[!] Failed to load ${file}: ${error.message}`);
        }
    }
}

function setupMessageLogger(zk) {
    zk.ev.on('messages.upsert', ({ messages }) => {
        const msg = messages[0];
        const direction = msg.key.fromMe ? 'OUTGOING' : 'INCOMING';
        const type = Object.keys(msg.message)[0];
        const text = type === 'conversation' ? msg.message.conversation : 
                    type === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : 
                    type === 'imageMessage' ? `[IMAGE] ${msg.message.imageMessage.caption || ''}` : 
                    type === 'videoMessage' ? `[VIDEO] ${msg.message.videoMessage.caption || ''}` : 
                    `[${type}]`;

        console.log(`[${direction}] ${msg.key.remoteJid}: ${text}`);
    });
}

module.exports = {
    loadListeners,
    store,
    setupMessageLogger
};
