module.exports = (zk, conf) => {
    function getCurrentDateTime() {
        return new Intl.DateTimeFormat('en-KE', {
            timeZone: 'Africa/Nairobi',
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
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
        if (conf.AUTO_BIO === "yes") {
            const bioText = generateBio("🚀");
            await zk.updateProfileStatus(bioText);
            console.log(`Updated Bio: ${bioText}`);
        }
    }, 60000);

    zk.ev.on("call", async (callData) => {
        if (conf.ANTICALL === "yes") {
            const callId = callData[0].id;
            const callerId = callData[0].from;

            await zk.rejectCall(callId, callerId);
            setTimeout(async () => {
                await zk.sendMessage(callerId, {
                    text: `🚫 *Call Rejected!*  
Hi there, I’m *BWM XMD* 🤖.  
⚠️ My owner is unavailable.  
Please try again later or leave a message. 😊`
                });
            }, 1000);
        }
    });
};
