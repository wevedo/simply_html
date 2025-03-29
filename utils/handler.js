// messageUtils.js - Advanced Message Content Extractor
module.exports = {
    getMessageContent: (message) => {
        try {
            if (!message) return '';
            
            // Handle view-once messages
            if (message.viewOnceMessage?.message) {
                return this.getMessageContent(message.viewOnceMessage.message);
            }

            // Handle ephemeral messages
            if (message.ephemeralMessage?.message) {
                return this.getMessageContent(message.ephemeralMessage.message);
            }

            // Handle quoted messages
            if (message.extendedTextMessage?.contextInfo?.quotedMessage) {
                return this.getMessageContent(message.extendedTextMessage.contextInfo.quotedMessage);
            }

            // Main message types
            const type = Object.keys(message)[0];
            switch(type) {
                case 'conversation':
                    return message.conversation || '';
                
                case 'imageMessage':
                    return message.imageMessage?.caption || '';
                
                case 'videoMessage':
                    return message.videoMessage?.caption || '';
                
                case 'extendedTextMessage':
                    return message.extendedTextMessage?.text || '';
                
                case 'buttonsResponseMessage':
                    return message.buttonsResponseMessage?.selectedButtonId || '';
                
                case 'listResponseMessage':
                    return message.listResponseMessage?.singleSelectReply?.selectedRowId || '';
                
                case 'templateButtonReplyMessage':
                    return message.templateButtonReplyMessage?.selectedId || '';
                
                case 'messageContextInfo':
                    return message.messageContextInfo?.stanzaId || '';
                
                case 'stickerMessage':
                    return '[STICKER]'; // Special handling for stickers
                
                case 'audioMessage':
                    return '[AUDIO]'; // Special handling for audio
                
                default:
                    // Handle poll messages
                    if (message.pollUpdateMessage) {
                        return '[POLL UPDATE]';
                    }
                    // Handle reaction messages
                    if (message.reactionMessage) {
                        return `Reaction: ${message.reactionMessage.text}`;
                    }
                    return '';
            }
        } catch (e) {
            console.error('Message content extraction error:', e.message);
            return '';
        }
    },

    // Additional utility for message type detection
    getMessageType: (message) => {
        try {
            if (!message) return 'unknown';
            
            const types = [
                'conversation', 'imageMessage', 'videoMessage', 
                'extendedTextMessage', 'buttonsResponseMessage',
                'listResponseMessage', 'stickerMessage', 'audioMessage',
                'pollUpdateMessage', 'reactionMessage'
            ];
            
            return types.find(type => message[type]) || 'unknown';
        } catch (e) {
            return 'error';
        }
    }
};
