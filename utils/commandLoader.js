module.exports = {
    getMessageContent: (message) => {
        try {
            const type = Object.keys(message)[0];
            switch(type) {
                case 'conversation':
                    return message.conversation;
                case 'extendedTextMessage':
                    return message.extendedTextMessage.text;
                case 'imageMessage':
                case 'videoMessage':
                    return message[type].caption;
                default:
                    return '';
            }
        } catch (e) {
            return '';
        }
    }
};
