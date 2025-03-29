const { updateFeature } = require('../utils/settings');

module.exports = {
    name: 'anticall',
    description: 'Enable/disable call blocking system',
    syntax: `${conf.PREFIX}anticall [on/off]`,
    async execute({ adams, message, args, listenerManager, store, commandRegistry }) {
        const [state] = args;
        
        if (!['on', 'off'].includes(state?.toLowerCase())) {
            return adams.sendMessage(message.key.remoteJid, { 
                text: `Invalid syntax! Usage:\n${this.syntax}`
            }, { quoted: message });
        }

        const isEnabled = state.toLowerCase() === 'on';
        await updateFeature('ANTICALL', state);
        
        // Reload listeners to apply changes
        await listenerManager.loadListeners(adams, store, commandRegistry);
        
        await adams.sendMessage(message.key.remoteJid, { 
            text: `Call blocking ${isEnabled ? 'activated ūüĎá' : 'deactivated ūüĎó'}`
        }, { quoted: message });
    }
};
