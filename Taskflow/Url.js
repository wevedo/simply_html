const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs-extra");
const { Catbox } = require("node-catbox");
const path = require("path");
const fluentFfmpeg = require("fluent-ffmpeg");

const catbox = new Catbox();

// Utility: Download media from message
async function downloadMedia(mediaMessage, mediaType) {
    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
    const buffer = await streamToBuffer(stream);

    const extension = mediaMessage.mimetype.split("/")[1] || "bin";
    const filePath = path.join(__dirname, `temp_${Date.now()}.${extension}`);

    await fs.writeFile(filePath, buffer);
    return filePath;
}

// Utility: Convert stream to buffer
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}

// Utility: Upload file to Catbox
async function uploadToCatbox(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error("File does not exist");
    }

    try {
        const response = await catbox.uploadFile({ path: filePath });
        return response || "Upload failed";
    } catch (err) {
        throw new Error("Upload Error: " + err);
    }
}

// Convert any audio format (including voice notes) to MP3
async function convertToMp3(inputPath) {
    const mp3Path = inputPath.replace(/\.\w+$/, ".mp3");

    if (inputPath.endsWith(".mp3")) {
        return inputPath; // Already MP3
    }

    return new Promise((resolve, reject) => {
        fluentFfmpeg(inputPath)
            .toFormat("mp3")
            .on("error", (err) => reject(new Error("FFmpeg error: " + err.message)))
            .on("end", () => {
                fs.unlinkSync(inputPath); // Remove original file after conversion
                resolve(mp3Path);
            })
            .save(mp3Path);
    });
}

// Command: Get URL for media
adams({ nomCom: "url", categorie: "General", reaction: "🌐" }, async (origineMessage, zk, commandeOptions) => {
    const { msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) {
        repondre("📌 Reply to an image, video, audio (including voice notes), or document to get a URL.");
        return;
    }

    let mediaPath, mediaType;

    try {
        if (msgRepondu.videoMessage) {
            const videoSize = msgRepondu.videoMessage.fileLength;
            if (videoSize > 50 * 1024 * 1024) {
                repondre("🚨 The video is too large. Please send a smaller one.");
                return;
            }
            mediaPath = await downloadMedia(msgRepondu.videoMessage, "video");
            mediaType = "video";

        } else if (msgRepondu.imageMessage) {
            mediaPath = await downloadMedia(msgRepondu.imageMessage, "image");
            mediaType = "image";

        } else if (msgRepondu.audioMessage) {
            mediaPath = await downloadMedia(msgRepondu.audioMessage, "audio");
            mediaType = "audio";

            // Convert all audio types (including voice notes) to MP3
            mediaPath = await convertToMp3(mediaPath);

        } else if (msgRepondu.documentMessage) {
            mediaPath = await downloadMedia(msgRepondu.documentMessage, "document");
            mediaType = "document";

        } else {
            repondre("⚠ Unsupported media type. Reply with an image, video, audio, or document.");
            return;
        }

        // Upload and get URL
        const catboxUrl = await uploadToCatbox(mediaPath);
        fs.unlinkSync(mediaPath); // Cleanup after upload

        // Reply with the correct type
        switch (mediaType) {
            case "image":
                repondre(`🖼️ Image URL:\n${catboxUrl}`);
                break;
            case "video":
                repondre(`🎥 Video URL:\n${catboxUrl}`);
                break;
            case "audio":
                repondre(`🔊 Audio URL (MP3):\n${catboxUrl}`);
                break;
            case "document":
                repondre(`📄 Document URL:\n${catboxUrl}`);
                break;
            default:
                repondre(`✅ File URL:\n${catboxUrl}`);
                break;
        }
    } catch (error) {
        console.error("Error in url command:", error);
        if (mediaPath && fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }
        repondre("❌ Error processing media. Please try again.");
    }
});
