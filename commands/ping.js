const { getValidAudioContext, createMessageContext } = require("../utils/helper");

module.exports = {
  name: "ping",
  description: "Check bot responsiveness",
  reaction: "🏓",
  
  async execute({ adams, chat, sender, message, reply }) {
    try {
      // Add reaction first
      await adams.sendMessage(chat, {
        react: {
          text: this.reaction,
          key: message.key
        }
      });

      // Get audio context
      const audioContext = getValidAudioContext();
      
      // Send audio message
      await adams.sendMessage(chat, {
        audio: audioContext,
        ...createMessageContext(sender, {
          title: "Ping Test",
          body: `📶 Response: ${Math.floor(100 + Math.random() * 900)}ms`
        })
      }, { quoted: message });

    } catch (error) {
      console.error(`Ping command error: ${error.message}`);
      await reply("❌ Failed to process ping command");
    }
  }
};
