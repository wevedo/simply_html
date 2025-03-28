module.exports = async (sock, conf) => {
    if (!sock || !conf) return;

    console.log("🔄 Auto Bio & Anti-Call Listener Activated...");

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

        function generateBio() {
            return `👋 BWM XMD Online 🚀\n📅 ${getCurrentDateTime()}`;
        }

        setInterval(async () => {
            try {
                await sock.updateProfileStatus(generateBio());
                console.log("✅ Bio Updated");
            } catch (err) {
                console.error("❌ Failed to update bio:", err.message);
            }
        }, 60000);
    }

    async function antiCall() {
        if (conf.ANTICALL !== "yes") return;

        sock.ev.on("call", async (callData) => {
            try {
                const { id, from } = callData[0];
                await sock.rejectCall(id, from);
                console.log(`🚫 Rejected call from ${from}`);
            } catch (err) {
                console.error("❌ Error handling call:", err.message);
            }
        });
    }

    autoBio();
    antiCall();
};
