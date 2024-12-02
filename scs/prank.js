const { adams } = require("../Ibrahim/adams");

adams({ nomCom: "hack", categorie: "Fun", reaction: "💀" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, prefixe } = commandeOptions;

    try {
        // Loading animation sequence
        const loadingSequence = [
            "⚡ _Connecting to encrypted servers..._ ⚡",
            "🔐 _Bypassing multi-layer firewalls..._ 🔐",
            "⚙️ _Injecting malicious payload..._ ⚙️",
            "🛑 _Exploiting kernel vulnerabilities..._ 🛑",
            "💣 _Uploading spyware to remote host..._ 💣"
        ];

        // Respond with loading animations
        for (let i = 0; i < loadingSequence.length; i++) {
            await repondre(loadingSequence[i]);
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
        }

        // Main prank message
        const hackedMessage = `*💀🔓 SYSTEM BREACHED 🔓💀*
        
        ⚠️ _Critical security breach detected!_ ⚠️
        
        ▄█▓▒░ *SYSTEM LOG* ░▒▓█▄
        ${"█".repeat(30)}
        🔴 *WhatsApp Chats* _exported to shadow network!_
        🔴 *Contacts Synced to Deep Web Servers!*
        🔴 _Injecting trojan into system: \`/root/sys32/critical.js\`_
        🔴 Device IMEI: *${Math.floor(100000000000000 + Math.random() * 900000000000000)}*
        🔴 _Live Camera Stream Activated..._
        ${"█".repeat(30)}
        
        *⚠️ WARNING ⚠️*  
        _Your device is under remote surveillance. Do NOT attempt to reboot._

        _💀 Script Executed by: Ibrahim Adams 💀_`;

        // Send the prank message
        await repondre(hackedMessage);

        // Final warning with fake countdown
        const countdown = ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
        for (let i = 0; i < countdown.length; i++) {
            await repondre(`💣 _System Destruction in: ${countdown[i]} seconds..._ 💣`);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
        }

        // Fake ending message
        await repondre("💥💀 *SYSTEM FAILURE: CRITICAL ERROR!* 💀💥");
    } catch (error) {
        console.error(error);
        return await repondre("_❌ An error occurred during the prank 😅_");
    }
});
