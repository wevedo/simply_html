const isAnyLink = (message) => {
    const linkPattern = /https?:\/\/[^\s]+/;
    return linkPattern.test(message);
};

module.exports = {
    setup: async (zk, { config, logger }) => {
        if (!zk || !config) {
            logger.error('Missing zk or config');
            return;
        }

        const botJid = `${zk.user?.id.split(':')[0]}@s.whatsapp.net`;
        const welcomeImage = 'https://files.catbox.moe/h2ydge.jpg';
        const businessLink = 'https://business.bwmxmd.online/';
        const infoLink = 'https://ibrahimadams.site/';

        // Anti-link + Welcome/Goodbye system
        zk.ev.on('group-participants.update', async (update) => {
            try {
                if (config.GROUP_ANTILINK !== 'yes' || 
                    config.WELCOME_MESSAGE !== 'yes' && config.GOODBYE_MESSAGE !== 'yes') return;

                const { id, participants, action } = update;
                const groupMetadata = await zk.groupMetadata(id);
                const groupAdmins = groupMetadata.participants
                    .filter((member) => member.admin)
                    .map((admin) => admin.id);

                for (const participant of participants) {
                    // Skip actions for bot and admins
                    if (participant === botJid || groupAdmins.includes(participant)) continue;

                    if (action === 'add' && config.WELCOME_MESSAGE === 'yes') {
                        await zk.sendMessage(id, {
                            image: { url: welcomeImage },
                            caption: `🎉 Welcome @${participant.split('@')[0]} to the group!\n\n` +
                                     `📌 Please read the group rules and enjoy your stay.\n\n` +
                                     `🌐 For more info, visit:\n${infoLink}\n` +
                                     `💼 Business: ${businessLink}`,
                            mentions: [participant]
                        });
                    } 
                    else if (action === 'remove' && config.GOODBYE_MESSAGE === 'yes') {
                        await zk.sendMessage(id, {
                            text: `👋 @${participant.split('@')[0]} has left the group.\n\n` +
                                  `🌐 Visit us at: ${infoLink}\n` +
                                  `💼 Business: ${businessLink}`,
                            mentions: [participant]
                        });
                    }
                }
            } catch (err) {
                logger.error('Error in group participants update:', err);
            }
        });

        // Anti-link protection
        zk.ev.on('messages.upsert', async (msg) => {
            try {
                if (config.GROUP_ANTILINK !== 'yes') return;

                const { messages } = msg;
                const message = messages[0];

                if (!message.message) return;

                const from = message.key.remoteJid;
                const sender = message.key.participant || message.key.remoteJid;
                const isGroup = from.endsWith('@g.us');

                if (!isGroup || sender === botJid) return;

                const groupMetadata = await zk.groupMetadata(from);
                const groupAdmins = groupMetadata.participants
                    .filter((member) => member.admin)
                    .map((admin) => admin.id);

                if (groupAdmins.includes(sender)) return;

                const messageType = Object.keys(message.message)[0];
                const body =
                    messageType === 'conversation'
                        ? message.message.conversation
                        : message.message[messageType]?.text || '';

                if (!body) return;

                if (isAnyLink(body)) {
                    await zk.sendMessage(from, { delete: message.key });
                    await zk.groupParticipantsUpdate(from, [sender], 'remove');
                    
                    await zk.sendMessage(
                        from,
                        {
                            text: `⚠️ Bwm xmd anti-link active!\n` +
                                  `User @${sender.split('@')[0]} has been removed for sharing a link.\n\n` +
                                  `🌐 For more info, visit:\n${infoLink}\n` +
                                  `💼 Business: ${businessLink}`,
                            mentions: [sender],
                        }
                    );
                }
            } catch (err) {
                logger.error('Error handling message:', err);
            }
        });
    }
};
