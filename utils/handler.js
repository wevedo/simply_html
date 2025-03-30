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
            return '';
        }
    },

    getMessageMetadata: (msgObj) => {
        try {
            return {
                remoteJid: msgObj?.key?.remoteJid || '',
                participant: msgObj?.key?.participant || '',
                fromMe: msgObj?.key?.fromMe || false,
                id: msgObj?.key?.id || '',
                timestamp: msgObj?.key?.timestamp ? new Date(msgObj.key.timestamp * 1000) : null
            };
        } catch (e) {
            console.error('Metadata error:', e.message);
            return {};
        }
    }
};
