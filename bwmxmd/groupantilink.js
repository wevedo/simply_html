module.exports = (zk, conf) => {
    const isAnyLink = (message) => {
        // Regex pattern to detect any link
        const linkPattern = /https?:\/\/[^\s]+/;
        return linkPattern.test(message);
    };

    zk.ev.on('messages.upsert', async (msg) => {
        try {
            const { messages } = msg;
            const message = messages[0];

            if (!message.message) return;

            const from = message.key.remoteJid;
            const sender = message.key.participant || message.key.remoteJid;
            const isGroup = from.endsWith('@g.us');

            if (!isGroup) return;

            const groupMetadata = await zk.groupMetadata(from);
            const groupAdmins = groupMetadata.participants
                .filter((member) => member.admin)
                .map((admin) => admin.id);

            if (conf.ANTILINK_GROUP === 'yes') {
                const messageType = Object.keys(message.message)[0];
                const body = messageType === 'conversation' 
                    ? message.message.conversation
                    : message.message[messageType]?.text || '';

                if (!body) return;

                if (groupAdmins.includes(sender)) return;

                if (isAnyLink(body)) {
                    await zk.sendMessage(from, { delete: message.key });
                    await zk.groupParticipantsUpdate(from, [sender], 'remove');
                    
                    await zk.sendMessage(
                        from,
                        {
                            text: `⚠️Bwm xmd anti-link online!\nUser @${sender.split('@')[0]} removed for sharing a link.\n\n🌐 More info: https://ibrahimadamscenter.us.kg`,
                            mentions: [sender]
                        }
                    );
                }
            }
        } catch (err) {
            console.error('Antilink Error:', err);
            // Optionally send error notification to owner
            // await zk.sendMessage(conf.NUMERO_OWNER+'@s.whatsapp.net', {text: `Antilink Error: ${err.message}`})
        }
    });
};
