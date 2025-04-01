const googleTTS = require("google-tts-api");
const { createContext } = require("../utils/helper"); // Import your context manager

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) return;

        adams.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];

            if (!ms.message) return;

            const messageType = Object.keys(ms.message)[0];
            const remoteJid = ms.key.remoteJid;
            const senderJid = ms.key.participant || ms.key.remoteJid;
            const messageContent = ms.message.conversation || ms.message.extendedTextMessage?.text;

            if (ms.key.fromMe || remoteJid === config.OWNER_NUMBER + "@s.whatsapp.net") return;

            const getAIResponse = async (query) => {
                const apis = [
                    "https://keith-api.vercel.app/ai/gpt?q=",
                    "https://bk9.fun/ai/chataibot?q=",
                    "https://apis-keith.vercel.app/ai/ilama?q=",
                    "https://apis-keith.vercel.app/ai/deepseek?q="
                ];

                let lastError = null;
                
                for (const api of apis) {
                    try {
                        const url = api + encodeURIComponent(query);
                        const response = await fetch(url);
                        
                        if (!response.ok) throw new Error(`API status ${response.status}`);
                        
                        const data = await response.json();
                        return data.result || data.response || data.message || "I couldn't understand that";
                    } catch (error) {
                        lastError = error;
                        logger.debug(`API ${api} failed: ${error.message}`);
                    }
                }
                throw lastError || new Error("All APIs failed");
            };

            // Handle CHATBOT1 (Voice Note with Newsletter Context)
            if (config.CHATBOT1 === "yes") {
                if (messageType === "conversation" || messageType === "extendedTextMessage") {
                    try {
                        const botReply = await getAIResponse(messageContent);
                        
                        const audioUrl = googleTTS.getAudioUrl(botReply, {
                            lang: "en",
                            slow: false,
                            host: "https://translate.google.com",
                        });

                        // Create newsletter context
                        const newsletterContext = createContext(senderJid, {
                            title: "AI Voice Response",
                            body: "Powered by BWM-XMD",
                            thumbnail: "https://files.catbox.moe/sd49da.jpg"
                        });

                        await adams.sendMessage(
                            remoteJid,
                            { 
                                audio: { url: audioUrl },
                                mimetype: "audio/mpeg",
                                ptt: true,
                                ...newsletterContext
                            },
                            { quoted: ms }
                        );
                    } catch (error) {
                        logger.error("Voice response failed:", error.message);
                    }
                }
            }

            // Handle CHATBOT2 (Text with Newsletter Context)
            if (config.CHATBOT === "yes") {
                if (messageType === "conversation" || messageType === "extendedTextMessage") {
                    try {
                        const botReply = await getAIResponse(messageContent);
                        
                        const newsletterContext = createContext(senderJid, {
                            title: "AI Text Response",
                            body: "Powered by BWM-XMD"
                        });

                        await adams.sendMessage(
                            remoteJid,
                            { 
                                text: botReply,
                                ...newsletterContext 
                            },
                            { quoted: ms }
                        );
                    } catch (error) {
                        logger.error("Text response failed:", error.message);
                    }
                }
            }
        });
    }
};
