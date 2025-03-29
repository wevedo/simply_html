const { updateFeature } = require('../utils/settings');

module.exports = {
    name: 'autobio',
    description: 'Enable/disable automatic bio updates',
    syntax: `${conf.PREFIX}autobio [on/off]`,
    async execute({ adams, message, args, listenerManager, store, commandRegistry }) {
        const [state] = args;
        
        if (!['on', 'off'].includes(state?.toLowerCase())) {
            return adams.sendMessage(message.key.remoteJid, { 
                text: `Invalid syntax! Usage:\n${this.syntax}`
            }, { quoted: message });
        }

        const isEnabled = state.toLowerCase() === 'on';
        await updateFeature('AUTO_BIO', state);
        
        // Reload listeners to apply changes
        await listenerManager.loadListeners(adams, store, commandRegistry);
        
        await adams.sendMessage(message.key.remoteJid, { 
            text: `Automatic bio updates ${isEnabled ? 'activated ūüĎá' : 'deactivated ūüĎó'}`
        }, { quoted: message });
    }
};
