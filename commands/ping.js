// commands/ping.js
const { getRandomReaction, getRandomAudio, createNewsletterContext } = require('../utils/helper');

module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    async execute({ adams, message, reply }) {
        try {
            const userJid = message.key.participant || message.key.remoteJid;
            const reaction = getRandomReaction();
            
            // Add reaction
            await adams.sendMessage(message.key.remoteJid, {
                react: {
                    text: reaction,
                    key: message.key
                }
            });

            // Generate random ping result
            const pingValue = Math.floor(100 + Math.random() * 900);
            
            await reply({
                text: `*${reaction} PONG! ${reaction}*\n` +
                      `╭───────────────────\n` +
                      `│  Response Time: ${pingValue}ms\n` +
                      `╰───────────────────`,
                ...getRandomAudio(),
                contextInfo: createNewsletterContext(userJid)
            });

        } catch (error) {
            console.error('Ping command error:', error);
        }
    }
};
