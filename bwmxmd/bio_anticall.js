module.exports = function (zk, conf) {
    if (!conf) {
        console.error("Configuration (conf) is missing!");
        return;
    }

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

    // Update bio automatically
    setInterval(async () => {
        if (conf.AUTO_BIO === "yes") {
            const bioText = generateBio("🚀");
            try {
                await zk.updateProfileStatus(bioText);
                console.log(`✅ Updated Bio: ${bioText}`);
            } catch (err) {
                console.error(`❌ Failed to update bio: ${err.message}`);
            }
        }
    }, 60000);

    // Handle call rejection
    zk.ev.on("call", async (callData) => {
        if (conf.ANTICALL === "yes") {
            try {
                const { id, from } = callData[0];

                await zk.rejectCall(id, from);
                console.log(`🚫 Call rejected from: ${from}`);

                setTimeout(async () => {
                    await zk.sendMessage(from, {
                        text: `🚫 *Call Rejected!*  
Hi there, I’m *BWM XMD* 🤖.  
⚠️ My owner is unavailable.  
Please try again later or leave a message. 😊`
                    });
                }, 1000);
            } catch (err) {
                console.error(`❌ Error handling call: ${err.message}`);
            }
        }
    });

    console.log("✅ Listener initialized successfully!");
};
