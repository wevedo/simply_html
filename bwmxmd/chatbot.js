const googleTTS = require("google-tts-api");
const { createContext } = require("../utils/helper");
const { createContext2 } = require("../utils/helper2");


// Enhanced Memory System with TTL
class ConversationMemory {
    constructor() {
        this.store = new Map();
        this.ttl = 60 * 60 * 1000; // 30 minutes retention
    }

    get(jid) {
        const data = this.store.get(jid);
        if (data && Date.now() - data.lastUpdated < this.ttl) {
            return data;
        }
        this.delete(jid);
        return null;
    }

    set(jid, data) {
        this.store.set(jid, {
            ...data,
            lastUpdated: Date.now()
        });
    }

    delete(jid) {
        this.store.delete(jid);
    }

    extractInfo(content) {
        const patterns = [
            { regex: /(?:my name is|call me) (\w+)/i, key: 'name' },
            { regex: /(?:i am|i'm) (\w+)/i, key: 'name' },
            { regex: /(?:live in|from) (.+?)(?:\.|$)/i, key: 'location' },
            { regex: /(?:age is|am) (\d+)/i, key: 'age' },
            { regex: /remember (.+)/i, key: 'custom' }
        ];

        const info = {};
        for (const { regex, key } of patterns) {
            const match = content.match(regex);
            if (match) info[key] = match[1].trim();
        }
        return info;
    }
}

const memory = new ConversationMemory();

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

            // Initialize or get conversation context
            let context = memory.get(remoteJid) || {
                botName: "BWM-XMD",
                creator: "Ibrahim Adams",
                history: [],
                userData: {}
            };

            // Process user information
            if (messageContent) {
                const newInfo = memory.extractInfo(messageContent);
                if (Object.keys(newInfo).length > 0) {
                    context.userData = { ...context.userData, ...newInfo };
                    memory.set(remoteJid, context);
                    
                    // Acknowledge information storage
                    if (newInfo.name) {
                        await adams.sendMessage(
                            remoteJid,
                            { text: `Nice to meet you ${newInfo.name}! I'll remember that.` },
                            { quoted: ms }
                        );
                        return;
                    }
                }
            }

            // Handle special queries
            if (/your name|who are you/i.test(messageContent)) {
                return await adams.sendMessage(
                    remoteJid,
                    { 
                        text: `I'm ${context.botName}, created by ${context.creator}.` +
                            (context.userData.name ? ` Nice to see you again ${context.userData.name}!` : ""),
                        ...createContext(senderJid, {
                            title: "Bot Identity",
                            body: "Always at your service"
                        })
                    },
                    { quoted: ms }
                );
            }

            if (/remember me|my info/i.test(messageContent)) {
                if (Object.keys(context.userData).length === 0) {
                    return await adams.sendMessage(
                        remoteJid,
                        { text: "I don't have any information about you yet. Tell me something like 'My name is Ibrahim Adams'!" },
                        { quoted: ms }
                    );
                }
                
                let response = "🔍 Here's what I remember:\n\n";
                for (const [key, value] of Object.entries(context.userData)) {
                    response += `• ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
                }
                
                return await adams.sendMessage(
                    remoteJid,
                    { 
                        text: response,
                        ...createContext(senderJid, {
                            title: "Your Information",
                            body: "Stored securely"
                        })
                    },
                    { quoted: ms }
                );
            }

            // Enhanced API Handler with Memory Context
            const getAIResponse = async (query) => {
                const apis = [
                    "https://apis.davidcyriltech.my.id/ai/qwen2Coder?text=",
                    "https://bk9.fun/ai/chataibot?q=",
                    "https://apis.davidcyriltech.my.id/ai/qvq?text=",
                    "https://apis-keith.vercel.app/ai/deepseek?q=",
                    "https://apis.davidcyriltech.my.id/ai/gemma?text=",
                    "https://apis.davidcyriltech.my.id/ai/pixtral?text=",
                    "https://apis.davidcyriltech.my.id/ai/uncensor?text=",
                    "https://apis.davidcyriltech.my.id/ai/claudeSonnet?text="
                ];

                const contextualQuery = [
                    query,
                    ...Object.entries(context.userData).map(([k,v]) => `[User ${k}: ${v}]`),
                    ...context.history.slice(-2).map((h, i) => `[Previous: ${h}]`)
                ].join(" ");

                let lastValidResponse = "I couldn't process that. Could you rephrase?";
                let lastError = null;

                for (const api of apis) {
                    try {
                        const url = api + encodeURIComponent(contextualQuery);
                        const response = await fetch(url, { timeout: 8000 });
                        
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        
                        const data = await response.json();
                        const result = data.result || data.response || data.message;
                        
                        if (result) {
                            lastValidResponse = result;
                            break;
                        }
                    } catch (error) {
                        lastError = error;
                        logger.debug(`API ${api} failed: ${error.message}`);
                        continue;
                    }
                }

                // Update memory
                memory.set(remoteJid, {
                    ...context,
                    history: [...context.history.slice(-1), `${query} → ${lastValidResponse.substring(0,30)}...`]
                });

                return lastValidResponse;
            };

            // Voice Response Handler
            if (config.CHATBOT1 === "yes") {
                if (messageType === "conversation" || messageType === "extendedTextMessage") {
                    try {
                        const botReply = await getAIResponse(messageContent);
                        
                        const audioUrl = googleTTS.getAudioUrl(botReply, {
                            lang: "en",
                            slow: false,
                            host: "https://translate.google.com",
                        });

                        await adams.sendMessage(
                            remoteJid,
                            { 
                                audio: { url: audioUrl },
                                mimetype: "audio/mpeg",
                                ptt: true,
                                ...createContext2(senderJid, {
                                    title: `${context.botName} Voice Response`,
                                    body: `For ${context.userData.name || "User"}`
                                    //thumbnail: "https://files.catbox.moe/sd49da.jpg"
                                })
                            },
                            { quoted: ms }
                        );
                    } catch (error) {
                        logger.error("Voice response failed:", error.message);
                    }
                }
            }

            // Text Response Handler
            if (config.CHATBOT === "yes") {
                if (messageType === "conversation" || messageType === "extendedTextMessage") {
                    try {
                        const botReply = await getAIResponse(messageContent);
                        
                        await adams.sendMessage(
                            remoteJid,
                            { 
                                text: botReply,
                                ...createContext(senderJid, {
                                    title: `${context.botName} AI Response`,
                                    body: context.userData.name ? `For ${context.userData.name}` : "AI Assistance",
                                    thumbnail: "https://files.catbox.moe/24j10y.jpeg"
                                })
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
