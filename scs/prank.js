const { adams } = require("../Ibrahim/adams");

adams({ nomCom: "prank", categorie: "Fun", reaction: "💀" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg, prefixe } = commandeOptions;

    try {
        // Loading animation sequence
        const loadingSequence = [
            "_Establishing connection to servers..._",
            "_Breaching security layers..._",
            "_Injecting payload..._",
            "_Accessing sensitive data..._",
            "_Compiling files..._"
        ];

        // Respond with loading animations
        for (let i = 0; i < loadingSequence.length; i++) {
            await repondre(loadingSequence[i]);
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
        }

        // Main prank message
        const hackedMessage = `*🔓 SYSTEM BREACHED 🔓*
        
        _Target system compromised!_
        
        ▄█▓▒░ SYSTEM LOG ░▒▓█▄
        ${"█".repeat(30)}
        🔴 *WhatsApp Chats* successfully forwarded!
        🔴 *Contacts Synced to Remote Database!*
        🔴 Injecting malware to \`/root/sys32/hack.js\`
        🔴 Device IMEI: *${Math.floor(100000000000000 + Math.random() * 900000000000000)}*
        🔴 Starting webcam recording...
        ${"█".repeat(30)}
        
        ▄█▓▒░ HACKING COMPLETE ░▒▓█▄
        _Do not try to restart your system. Remote monitoring enabled._
        
        _💀 Script By: Mr. Dark Code 💀_`;

        // Send the prank message
        await repondre(hackedMessage);

        // Final warning with fake countdown
        const countdown = ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
        for (let i = 0; i < countdown.length; i++) {
            await repondre(`_System Self-Destruction in: ${countdown[i]}s_`);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
        }

        // Fake ending message
        await repondre("💀 *SYSTEM CORRUPTED!* 💀");
    } catch (error) {
        console.error(error);
        return await repondre("_Une erreur s'est produite pendant la farce 😅_");
    }
});
