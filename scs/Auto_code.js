const fs = require("fs");

class AutoSaveContacts {
    constructor(zk, conf, store) {
        this.zk = zk;
        this.conf = conf;
        this.store = store;
        this.repliedContacts = new Set(); // Tracks contacts that have already received an auto-reply
    }

    async sendVCard(jid, baseName) {
        try {
            const phoneNumber = jid.split("@")[0];
            let counter = 1;
            let name = `${baseName} ${counter}`;

            // Increment name if it already exists
            while (Object.values(this.store.contacts).some(contact => contact.name === name)) {
                counter++;
                name = `${baseName} ${counter}`;
            }

            const vCardContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${phoneNumber}:+${phoneNumber}\nEND:VCARD\n`;
            const vCardPath = `./${name}.vcf`;

            fs.writeFileSync(vCardPath, vCardContent);

            await this.zk.sendMessage(this.conf.NUMERO_OWNER + "@s.whatsapp.net", {
                document: { url: vCardPath },
                mimetype: "text/vcard",
                fileName: `${name}.vcf`,
                caption: `Contact saved as ${name}. Please import this vCard to add the number to your contacts.\n\n🚀 ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs`,
            });

            fs.unlinkSync(vCardPath);
            return name;
        } catch (error) {
            console.error(`Error creating or sending vCard:`, error.message);
        }
    }

    async handleNewContact(ms) {
        const remoteJid = ms.key.remoteJid;
        const baseName = "🚀 ʙᴡᴍ xᴍᴅ";

        if (remoteJid.endsWith("@s.whatsapp.net") && (!this.store.contacts[remoteJid] || !this.store.contacts[remoteJid].name)) {
            const assignedName = await this.sendVCard(remoteJid, baseName);
            this.store.contacts[remoteJid] = { name: assignedName };

            await this.zk.sendMessage(remoteJid, {
                text: `Hello! Your name has been saved as "${assignedName}" in our system.\n\n🚀 ʙᴡᴍ xᴍᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs`,
            });
        }
    }

    async handleAutoReply(ms) {
        const remoteJid = ms.key.remoteJid;
        const messageText = ms.message.conversation || ms.message.extendedTextMessage?.text;

        // Allow the owner to update the auto-reply message dynamically
        if (messageText && messageText.match(/^[^\w\s]/) && ms.key.fromMe) {
            const prefix = messageText[0];
            const command = messageText.slice(1).split(" ")[0];
            const newMessage = messageText.slice(prefix.length + command.length).trim();

            if (command === "setautoreply" && newMessage) {
                this.conf.AUTO_REPLY_MESSAGE = newMessage; // Update the message in the configuration
                await this.zk.sendMessage(remoteJid, {
                    text: `✨ *Auto-Reply Message Updated* ✨\n\nNew message:\n"${newMessage}"`,
                });
                return;
            }
        }

        if (
            this.conf.AUTO_REPLY === "yes" &&
            !this.repliedContacts.has(remoteJid) &&
            !ms.key.fromMe &&
            !remoteJid.includes("@g.us")
        ) {
            await this.zk.sendMessage(remoteJid, {
                text: `✨ *Auto-Reply Message* ✨\n\n${this.conf.AUTO_REPLY_MESSAGE}\n\n🤖 ʙᴡᴍ ʙᴏᴛ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs`,
            });

            this.repliedContacts.add(remoteJid);
        }
    }

    setupListeners() {
        this.zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];

            if (this.conf.AUTO_SAVE_CONTACTS === "yes" && ms.message) {
                await this.handleNewContact(ms);
            }

            if (this.conf.AUTO_REPLY === "yes" && ms.message) {
                await this.handleAutoReply(ms);
            }
        });
    }
}

module.exports = AutoSaveContacts;
