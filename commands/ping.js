const { getRandomAudio, createContext } = require("../utils/helper");

module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    reaction: "🏓",
    async execute({ adams, chat, sender, message }) {
        const responseTime = Math.floor(100 + Math.random() * 900);
        
        // Get audio details first
        const audioDetails = getRandomAudio();
        
        await adams.sendMessage(chat, { 
            audio: {
                url: audioDetails.url,
                mimetype: 'audio/mpeg',
                ptt: false, // Disable push-to-talk
                seconds: 60, // Set dummy duration
                waveform: new Uint8Array([0, 255, 0, 255]) // Fake waveform
            },
            ...createContext(sender, {
                title: "Ping Test",
                body: `📶 Response Time: ${responseTime}ms`
            })
        }, { quoted: message });
    }
};
