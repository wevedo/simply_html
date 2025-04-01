const { createContext } = require('../utils/contextManager');

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) return;

        const botJid = `${adams.user?.id.split('@')[0]}@s.whatsapp.net`;
        const businessLink = "https://business.bwmxmd.online/";
        const infoLink = "https://ibrahimadams.site/";
        const linkPattern = /https?:\/\/[^\s]+/gi; // Catches ALL links

        // Cache system for admin checks
        const adminCache = new Map();
        setInterval(() => adminCache.clear(), 300000); // 5 minute cache

        adams.ev.on('messages.upsert', async ({ messages }) => {
            if (!config.GROUP_ANTILINK && !config.GROUP_ANTILINK2) return;

            const message = messages[0];
            if (!message?.message) return;

            const from = message.key.remoteJid;
            if (!from?.endsWith('@g.us')) return;

            const sender = message.key.participant || from;
            if (sender === botJid) return;

            try {
                // Fast content extraction
                const msgObj = message.message;
                const body = msgObj.conversation || 
                             msgObj.extendedTextMessage?.text || 
                             Object.values(msgObj)[0]?.text || '';

                if (!linkPattern.test(body)) return;

                // Admin check with cache
                let admins = adminCache.get(from);
                if (!admins) {
                    const metadata = await adams.groupMetadata(from);
                    admins = new Set(metadata.participants
                        .filter(p => p.admin)
                        .map(p => p.id));
                    adminCache.set(from, admins);
                }
                if (admins.has(sender)) return;

                // Create context for newsletter-style messages
                const context = createContext(sender, {
                    title: "BWM-XMD Security Action",
                    body: "Group Policy Enforcement",
                    thumbnail: "https://files.catbox.moe/sd49da.jpg"
                });

                // MODE 1: Strict (delete + remove)
                if (config.GROUP_ANTILINK === 'yes') {
                    await Promise.all([
                        adams.sendMessage(from, { delete: message.key }),
                        adams.groupParticipantsUpdate(from, [sender], 'remove'),
                        adams.sendMessage(from, {
                            text: `🚨 @${sender.split('@')[0]} was removed for sending links\n\n` +
                                  `🔗 Get our services: ${businessLink}\n` +
                                  `ℹ️ More info: ${infoLink}`,
                            mentions: [sender],
                            ...context
                        })
                    ]);
                } 
                // MODE 2: Warning (delete only)
                else if (config.GROUP_ANTILINK2 === 'yes') {
                    await Promise.all([
                        adams.sendMessage(from, { delete: message.key }),
                        adams.sendMessage(from, {
                            text: `⚠️ @${sender.split('@')[0]}, links are prohibited!\n\n` +
                                  `🔗 Our services: ${businessLink}\n` +
                                  `ℹ️ Learn more: ${infoLink}`,
                            mentions: [sender],
                            ...context
                        })
                    ]);
                }

            } catch (err) {
                logger.error('Anti-link error:', err);
            }
        });
    }
};
