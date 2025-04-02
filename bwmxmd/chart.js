const googleTTS = require("google-tts-api");
const { createContext } = require("../utils/helper");
const { createContext2 } = require("../utils/helper2");

class AdvancedMemoryBot {
  constructor(config) {
    this.config = config;
    this.memory = new Map();
    this.conversationHistory = {};
    this.knowledgeBase = this.buildKnowledgeBase();
    this.initNLP();
  }

  buildKnowledgeBase() {
    return {
      science: {
        biology: {
          definition: "Biology is the study of living organisms and their vital processes.",
          keywords: ["life", "organism", "cell", "evolution"]
        },
        physics: {
          definition: "Physics is the science of matter, energy, and their interactions.",
          keywords: ["energy", "matter", "force", "quantum"]
        }
      },
      general: {
        name: {
          definition: "I'm an AI assistant created to help with information and conversation.",
          keywords: ["who", "your", "name", "called"]
        },
        help: {
          definition: "I can answer questions, remember information, and have conversations. Just ask me anything!",
          keywords: ["help", "what", "can", "do"]
        }
      }
    };
  }

  initNLP() {
    this.tokenizer = {
      tokenize: (text) => text.toLowerCase().split(/\s+/)
    };
    this.stemmer = {
      stem: (word) => word.replace(/ing$|s$|e$/, '')
    };
  }

  processInput(input) {
    const tokens = this.tokenizer.tokenize(input);
    const stems = tokens.map(t => this.stemmer.stem(t));
    return {
      raw: input,
      tokens,
      stems,
      isQuestion: input.trim().endsWith('?')
    };
  }

  searchKnowledge(input) {
    const { stems } = this.processInput(input);
    for (const category in this.knowledgeBase) {
      for (const topic in this.knowledgeBase[category]) {
        const item = this.knowledgeBase[category][topic];
        if (item.keywords.some(kw => stems.includes(this.stemmer.stem(kw)))) {
          return {
            topic,
            definition: item.definition,
            category
          };
        }
      }
    }
    return null;
  }

  remember(jid, key, value) {
    if (!this.memory.has(jid)) {
      this.memory.set(jid, {});
    }
    this.memory.get(jid)[key] = value;
  }

  recall(jid, key) {
    return this.memory.get(jid)?.[key];
  }

  getConversationHistory(jid) {
    if (!this.conversationHistory[jid]) {
      this.conversationHistory[jid] = [];
    }
    return this.conversationHistory[jid];
  }

  generateResponse(jid, input) {
    const knowledge = this.searchKnowledge(input);
    const history = this.getConversationHistory(jid);
    
    if (knowledge) {
      return knowledge.definition;
    }
    
    if (input.includes("my name is")) {
      const name = input.split("my name is")[1].trim();
      this.remember(jid, "name", name);
      return `Nice to meet you, ${name}! I'll remember that.`;
    }
    
    if (input.includes("remember that")) {
      const fact = input.split("remember that")[1].trim();
      this.remember(jid, "fact", fact);
      return "I'll remember that!";
    }
    
    const name = this.recall(jid, "name");
    if (name && (input.includes("who am I") || input.includes("what's my name"))) {
      return `Your name is ${name}!`;
    }
    
    if (history.length > 0) {
      const lastMessage = history[history.length - 1];
      return `Earlier you mentioned "${lastMessage}". Can you tell me more?`;
    }
    
    return "That's interesting. Can you explain more about that?";
  }

  async handleMessage(remoteJid, input) {
    const processed = this.processInput(input);
    const response = this.generateResponse(remoteJid, input);
    
    // Update history
    this.getConversationHistory(remoteJid).push(input);
    if (this.getConversationHistory(remoteJid).length > 5) {
      this.getConversationHistory(remoteJid).shift();
    }
    
    return response;
  }
}

module.exports = {
  setup: async (adams, { config, logger }) => {
    if (!adams || !config) return;

    const bot = new AdvancedMemoryBot(config);

    adams.ev.on("messages.upsert", async ({ messages }) => {
      const message = messages[0];
      if (!message.message || message.key.fromMe) return;

      const remoteJid = message.key.remoteJid;
      const input = message.message.conversation || 
                   message.message.extendedTextMessage?.text;

      if (!input) return;

      try {
        // Text response
        if (config.CHATBOT === "yes") {
          const response = await bot.handleMessage(remoteJid, input);
          await adams.sendMessage(
            remoteJid,
            { 
              text: response,
              ...createContext(remoteJid, {
                title: "AI Response",
                body: "Powered by advanced memory"
              })
            },
            { quoted: message }
          );
        }

        // Voice response
        if (config.CHATBOT1 === "yes") {
          const response = await bot.handleMessage(remoteJid, input);
          const audioUrl = googleTTS.getAudioUrl(response, {
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
              ...createContext2(remoteJid, {
                title: "Voice Response",
                body: "Listen to my reply"
              })
            },
            { quoted: message }
          );
        }
      } catch (error) {
        logger.error("Message handling error:", error);
      }
    });
  }
};
