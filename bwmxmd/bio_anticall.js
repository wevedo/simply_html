module.exports = async (sock, conf) => {
    if (!sock || !conf) return;
    
    console.log("🔄 Loading Auto Bio & Anti-Call Listener...");

    async function autoBio() {
        if (conf.AUTO_BIO !== "yes") return;

        function getCurrentDateTime() {
            return new Intl.DateTimeFormat("en-KE", {
                timeZone: "Africa/Nairobi",
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            }).format(new Date());
        }

        const quotes = [
            "ʟɪғᴇ ɪs sʜᴏʀᴛ, ʙᴜᴛ ʏᴏᴜʀ ᴛᴏ-ᴅᴏ ʟɪsᴛ ɪs ɴᴇᴠᴇʀ-ᴇɴᴅɪɴɢ. 📋😂",
            "ᴍᴏɴᴇʏ ᴄᴀɴ'ᴛ ʙᴜʏ ʜᴀᴘᴘɪɴᴇss, ʙᴜᴛ ɪᴛ ᴄᴀɴ ʙᴜʏ ᴘɪᴢᴢᴀ. 🍕😊",
        ];

        function getRandomQuote() {
            return quotes[Math.floor(Math.random() * quotes.length)];
        }

        function generateBio(nomAuteurMessage = "User") {
            return `👋 ʜᴇʏ, ${nomAuteurMessage} ʙᴡᴍ xᴍᴅ ɪs ᴏɴʟɪɴᴇ 🚀,\n📅 ${getCurrentDateTime()}\n💬 "${getRandomQuote()}"`;
        }

        setInterval(async () => {
            const bioText = generateBio("🚀");
            try {
                await sock.updateProfileStatus(bioText);
                console.log(`✅ Updated Bio: ${bioText}`);
            } catch (err) {
                console.error(`❌ Failed to update bio: ${err.message}`);
            }
        }, 60000);
    }

    async function antiCall() {
        if (conf.ANTICALL !== "yes") return;

        sock.ev.on("call", async (callData) => {
            try {
                const { id, from } = callData[0];
                await sock.rejectCall(id, from);
                console.log(`🚫 Call rejected from: ${from}`);

                setTimeout(async () => {
                    await sock.sendMessage(from, {
                        text: `🚫 *Call Rejected!*  
Hi there, I’m *BWM XMD* 🤖.  
⚠️ My owner is unavailable.  
Please try again later or leave a message. 😊`
                    });
                }, 1000);
            } catch (err) {
                console.error(`❌ Error handling call: ${err.message}`);
            }
        });
    }

    // Start the listeners automatically
    autoBio();
    antiCall();

    console.log("✅ Auto Bio & Anti-Call Listener Initialized Successfully!");
};

// Automatically execute when required
(async () => {
    const sock = global.sock;
    const conf = global.conf;
    if (sock && conf) {
        module.exports(sock, conf);
    }
})();
