// commands/play.js
const { getRandomReaction, getRandomAudio, createNewsletterContext } = require('../utils/helper');

module.exports = {
    name: "play",
    description: "Play random audio track",
    async execute({ adams, message, reply }) {
        try {
            const userJid = message.key.participant || message.key.remoteJid;
            const reaction = getRandomReaction();

            await adams.sendMessage(message.key.remoteJid, {
                react: {
                    text: reaction,
                    key: message.key
                }
            });

            await reply({
                text: `${reaction} Now Playing...`,
                ...getRandomAudio(),
                contextInfo: createNewsletterContext(userJid)
            });

        } catch (error) {
            console.error('Play command error:', error);
        }
    }
};
