const { adams } = require("../Ibrahim/adams");

adams(
  {
    nomCom: "chajid",
    aliases: ["getjid"],
    categorie: "Utility",
    reaction: "📡",
  },
  async (dest, zk, commandOptions) => {
    const { arg, repondre } = commandOptions;

    if (!arg[0]) {
      return repondre("❌ *Provide a WhatsApp Channel link!*\nExample: `.channeljid https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y`");
    }

    const channelLink = arg[0];
    const match = channelLink.match(/channel\/([a-zA-Z0-9]+)/);

    if (!match) {
      return repondre("❌ *Invalid WhatsApp Channel link!*");
    }

    const channelID = match[1];

    try {
      // Fetch all chats
      const chats = await zk.chatFetchAll();
      const channels = chats.filter(chat => chat.id.endsWith("@newsletter"));

      // Find the correct JID
      const foundChannel = channels.find(chat => chat.id.includes(channelID));

      if (!foundChannel) {
        return repondre("🚫 *Channel JID not found!*\nEnsure the bot is subscribed to the channel.");
      }

      return repondre(`✅ *Correct JID:* \`${foundChannel.id}\``);
    } catch (error) {
      console.error("Error fetching channel JID:", error.message);
      return repondre("❌ *Failed to retrieve JID. Try again later!*");
    }
  }
);
