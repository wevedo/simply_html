const linkPattern = /https?:\/\/[^\s]+/gi; // Global and case-insensitive for faster detection

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) return;

        const botJid = `${adams.user?.id.split(':')[0]}@s.whatsapp.net`;
        const welcomeImage = 'https://files.catbox.moe/h2ydge.jpg';
        const businessLink = 'https://business.bwmxmd.online/';
        const infoLink = 'https://ibrahimadams.site/';

        // Cache for group metadata to reduce API calls
        const groupCache = new Map();

        // Welcome system (independent)
        adams.ev.on('group-participants.update', async (update) => {
            if (!config.WELCOME_MESSAGE && !config.GOODBYE_MESSAGE) return;

            const { id, participants, action } = update;
            
            try {
                // Get cached or fresh group metadata
                let groupMetadata = groupCache.get(id);
                if (!groupMetadata) {
                    groupMetadata = await adams.groupMetadata(id);
                    groupCache.set(id, groupMetadata);
                }

                const groupName = groupMetadata.subject || "this group";
                const admins = new Set(
                    groupMetadata.participants
                        .filter(p => p.admin)
                        .map(p => p.id)
                );

                for (const participant of participants) {
                    if (participant === botJid || admins.has(participant)) continue;

                    if (action === 'add' && config.WELCOME_MESSAGE === 'yes') {
                        await adams.sendMessage(id, {
                            image: { url: welcomeImage },
                            caption: `🎉 Welcome @${participant.split('@')[0]} to ${groupName}!\n\n` +
                                     `📌 Enjoy your stay!\n\n` +
                                     `🌐 ${infoLink}\n💼 ${businessLink}`,
                            mentions: [participant]
                        });
                    } 
                    else if (action === 'remove' && config.GOODBYE_MESSAGE === 'yes') {
                        await adams.sendMessage(id, {
                            text: `👋 @${participant.split('@')[0]} left ${groupName}\n\n` +
                                  `🌐 ${infoLink}\n💼 ${businessLink}`,
                            mentions: [participant]
                        });
                    }
                }
            } catch (err) {
                logger.error('Group update error:', err);
            }
        });

        // Optimized link detection
        adams.ev.on('messages.upsert', async ({ messages }) => {
            if (!config.GROUP_ANTILINK && !config.GROUP_ANTILINK2) return;

            const message = messages[0];
            if (!message?.message) return;

            const { key } = message;
            const from = key.remoteJid;
            if (!from?.endsWith('@g.us')) return;

            const sender = key.participant || key.remoteJid;
            if (sender === botJid) return;

            try {
                // Fast text extraction
                const msgObj = message.message;
                const body = msgObj.conversation || 
                            msgObj.extendedTextMessage?.text || 
                            Object.values(msgObj)[0]?.text || '';

                if (!body || !linkPattern.test(body)) return;

                // Get cached or fresh group metadata
                let groupMetadata = groupCache.get(from);
                if (!groupMetadata) {
                    groupMetadata = await adams.groupMetadata(from);
                    groupCache.set(from, groupMetadata);
                }

                const isAdmin = groupMetadata.participants.some(
                    p => p.id === sender && p.admin
                );
                if (isAdmin) return;

                const userMention = `@${sender.split('@')[0]}`;
                const warningMsg = {
                    text: `⚠️ *LINK DETECTED* ⚠️\n` +
                          `${userMention} ${config.GROUP_ANTILINK ? 'removed' : 'warned'} for sharing link\n\n` +
                          `🌐 ${infoLink}`,
                    mentions: [sender],
                    edit: key // Edit original message
                };

                // Strict mode (edit + remove)
                if (config.GROUP_ANTILINK === 'yes') {
                    await Promise.all([
                        adams.sendMessage(from, warningMsg),
                        adams.groupParticipantsUpdate(from, [sender], 'remove')
                    ]);
                }
                // Warning mode (edit only)
                else if (config.GROUP_ANTILINK2 === 'yes') {
                    await adams.sendMessage(from, warningMsg);
                }

            } catch (err) {
                logger.error('Link detection error:', err);
            }
        });

        // Clear cache periodically
        setInterval(() => groupCache.clear(), 300000); // 5 minutes
    }
};
