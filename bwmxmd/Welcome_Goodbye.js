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

