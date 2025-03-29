const { updateFeature } = require('../utils/settings');

module.exports = {
    name: 'autobio',
    description: 'Toggle automatic bio updates',
    syntax: '<on/off>',
    async execute({ adams, message, args, listenerManager }) {
        const [state] = args;
        
        // Validate input
        if (!state || !['on', 'off'].includes(state.toLowerCase())) {
            return adams.sendMessage(message.key.remoteJid, {
                text: `Invalid usage! Usage:\n${conf.PREFIX}${this.name} ${this.syntax}`
            }, { quoted: message });
        }

        // Update settings
        await updateFeature('AUTO_BIO', state);
        
        // Reload listeners to apply changes
        await listenerManager.loadListeners(adams, store, commandRegistry);
        
        // Send confirmation
        await adams.sendMessage(message.key.remoteJid, {
            text: `‚ö°ÔłŹ AutoBio ${state === 'on' ? 'activated' : 'disabled'}!`
        }, { quoted: message });
    }
};
