module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) return;

        const botJid = `${adams.user?.id.split('@')[0]}@s.whatsapp.net`;
        const linkPattern = /https?:\/\/[^\s]+/gi; // Optimized regex

        // Cache for admin status (5 minute TTL)
        const adminCache = new Map();
        const clearCache = () => adminCache.clear();
        setInterval(clearCache, 300000);

        adams.ev.on('messages.upsert', async ({ messages }) => {
            if (!config.GROUP_ANTILINK && !config.GROUP_ANTILINK2) return;

            const message = messages[0];
            if (!message?.message) return;

            const from = message.key.remoteJid;
            if (!from?.endsWith('@g.us')) return;

            const sender = message.key.participant || from;
            if (sender === botJid) return;

            try {
                // Blazing fast text extraction
                const msgObj = message.message;
                const body = msgObj.conversation || 
                             msgObj.extendedTextMessage?.text || 
                             Object.values(msgObj)[0]?.text || '';

                if (!linkPattern.test(body)) return;

                // Check admin cache
                let isAdmin = false;
                if (adminCache.has(from)) {
                    isAdmin = adminCache.get(from).has(sender);
                } else {
                    const metadata = await adams.groupMetadata(from);
                    const admins = new Set(
                        metadata.participants
                            .filter(p => p.admin)
                            .map(p => p.id)
                    );
                    adminCache.set(from, admins);
                    isAdmin = admins.has(sender);
                }
                if (isAdmin) return;

                // MODE 1: Delete + Remove (STRICT)
                if (config.GROUP_ANTILINK === 'yes') {
                    await Promise.all([
                        adams.sendMessage(from, { delete: message.key }),
                        adams.groupParticipantsUpdate(from, [sender], 'remove'),
                        adams.sendMessage(from, {
                            text: `🚨 @${sender.split('@')[0]} was removed for sending links`,
                            mentions: [sender]
                        })
                    ]);
                } 
                // MODE 2: Delete Only (WARNING)
                else if (config.GROUP_ANTILINK2 === 'yes') {
                    await Promise.all([
                        adams.sendMessage(from, { delete: message.key }),
                        adams.sendMessage(from, {
                            text: `⚠️ @${sender.split('@')[0]}, links are not allowed here!`,
                            mentions: [sender]
                        })
                    ]);
                }

            } catch (err) {
                logger.error('Anti-link error:', err);
            }
        });
    }
};
