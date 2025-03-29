// commands/ping.js
module.exports = {
    name: "ping",
    description: "Check bot responsiveness",
    async execute({ adams, reply }) {
        await reply("Pong! 🏓");
    }
};
