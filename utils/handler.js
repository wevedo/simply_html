// utils/messageUtils.js
const { getContentType } = require("@whiskeysockets/baileys");

module.exports = {
    getMessageContent: (message) => {
        try {
            if (!message) return '';
            
            const type = getContentType(message);
            if (!type) return '';
            
            // Handle different message types
            switch(type) {
                case 'conversation':
                    return message.conversation;
                
                case 'extendedTextMessage':
                    return message.extendedTextMessage.text;
                
                case 'imageMessage':
                    return message.imageMessage.caption || '';
                
                case 'videoMessage':
                    return message.videoMessage.caption || '';
                
                case 'audioMessage':
                    // For audio messages with captions
                    return message.audioMessage.caption || '';
                
                case 'buttonsResponseMessage':
                    return message.buttonsResponseMessage.selectedButtonId;
                
                case 'listResponseMessage':
                    return message.listResponseMessage.singleSelectReply.selectedRowId;
                
                case 'templateButtonReplyMessage':
                    return message.templateButtonReplyMessage.selectedId;
                
                case 'messageContextInfo':
                    return message.messageContextInfo.stanzaId || '';
                
                default:
                    // Handle other types like documents, stickers, etc.
                    return '';
            }
        } catch (e) {
            console.error('Message content error:', e.message);
            return '';
        }
    },

    getMessageMetadata: (message) => {
        const msgKey = message.key || {};
        return {
            remoteJid: msgKey.remoteJid,
            participant: msgKey.participant,
            fromMe: msgKey.fromMe,
            id: msgKey.id,
            timestamp: msgKey.timestamp
        };
    }
};
