const { adams } = require('../Ibrahim/adams');
const axios = require("axios");
let { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const sleep = (ms) => {
  return new Promise((resolve) => { setTimeout(resolve, ms) });
};
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const { Catbox } = require('node-catbox');
const { createContext } = require("../utils/helper");

const catbox = new Catbox();

// Constants for consistent messaging
const BOT_NAME = "BWM_XMD";
const BOT_TAGLINE = "Next-Gen WhatsApp Automation";
const EMOJI_THEME = {
  success: "⚡",
  error: "💢",
  info: "ℹ️",
  processing: "🔄"
};

async function uploadToCatbox(Path) {
    if (!fs.existsSync(Path)) {
        throw new Error("File does not exist");
    }

    try {
        const response = await catbox.uploadFile({
            path: Path
        });

        if (response) {
            return response;
        } else {
            throw new Error("Error retrieving the file link");
        }
    } catch (err) {
        throw new Error(String(err));
    }
}

async function convertToMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat("mp3")
            .on("error", (err) => reject(err))
            .on("end", () => resolve(outputPath))
            .save(outputPath);
    });
}

adams({ nomCom: "url", categorie: "General", reaction: "👨🏿‍💻" }, async (origineMessage, zk, commandeOptions) => {
    const { msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) {
        const context = createContext(origineMessage, {
            title: "Media URL Generator",
            body: "Reply to media to get URL"
        });
        return repondre({
            text: `${EMOJI_THEME.error} *Usage*\nPlease reply to an image, video, or audio file.`,
            ...context
        });
    }

    let mediaPath, mediaType;

    if (msgRepondu.videoMessage) {
        const videoSize = msgRepondu.videoMessage.fileLength;

        if (videoSize > 50 * 1024 * 1024) {
            const context = createContext(origineMessage, {
                title: "File Size Limit",
                body: "Maximum 50MB allowed"
            });
            return repondre({
                text: `${EMOJI_THEME.error} *File Too Large*\nThe video exceeds 50MB limit.`,
                ...context
            });
        }

        mediaPath = await downloadAndSaveMediaMessage(msgRepondu.videoMessage);
        mediaType = 'video';
    } else if (msgRepondu.imageMessage) {
        mediaPath = await downloadAndSaveMediaMessage(msgRepondu.imageMessage);
        mediaType = 'image';
    } else if (msgRepondu.audioMessage) {
        mediaPath = await downloadAndSaveMediaMessage(msgRepondu.audioMessage);
        mediaType = 'audio';

        const outputPath = `${mediaPath}.mp3`;

        try {
            await convertToMp3(mediaPath, outputPath);
            fs.unlinkSync(mediaPath);
            mediaPath = outputPath;
        } catch (error) {
            console.error("Conversion error:", error);
            const context = createContext(origineMessage, {
                title: "Conversion Failed",
                body: "Audio processing error"
            });
            return repondre({
                text: `${EMOJI_THEME.error} Failed to process the audio file.`,
                ...context
            });
        }
    } else {
        const context = createContext(origineMessage, {
            title: "Unsupported Media",
            body: "Supported: Image/Video/Audio"
        });
        return repondre({
            text: `${EMOJI_THEME.error} *Unsupported Media*\nReply with an image, video, or audio file.`,
            ...context
        });
    }

    try {
        const processingContext = createContext(origineMessage, {
            title: "Uploading Media",
            body: "Please wait..."
        });
        await repondre({
            text: `${EMOJI_THEME.processing} Uploading your ${mediaType}...`,
            ...processingContext
        });

        const catboxUrl = await uploadToCatbox(mediaPath);
        fs.unlinkSync(mediaPath);

        const resultContext = createContext(origineMessage, {
            title: `${mediaType.toUpperCase()} URL Generated`,
            body: "Your media is ready"
        });

        const mediaLabels = {
            'image': 'Image URL',
            'video': 'Video URL',
            'audio': 'Audio URL (MP3)'
        };

        await repondre({
            text: `${EMOJI_THEME.success} *${mediaLabels[mediaType]}*\n\n${catboxUrl}\n\n_${BOT_TAGLINE}_`,
            ...resultContext
        });

    } catch (error) {
        console.error('Upload error:', error);
        const errorContext = createContext(origineMessage, {
            title: "Upload Failed",
            body: "Try again later"
        });
        repondre({
            text: `${EMOJI_THEME.error} *Upload Failed*\n${error.message}`,
            ...errorContext
        });
    }
});

adams({ nomCom: "tomp3", categorie: "General", reaction: "🎵" }, async (origineMessage, zk, commandeOptions) => {
    const { msgRepondu, repondre, from } = commandeOptions;

    if (!msgRepondu || !msgRepondu.videoMessage) {
        const context = createContext(origineMessage, {
            title: "Video to MP3",
            body: "Reply to a video"
        });
        return repondre({
            text: `${EMOJI_THEME.error} *Usage*\nReply to a video to convert it to audio.`,
            ...context
        });
    }

    const videoSize = msgRepondu.videoMessage.fileLength;
    if (videoSize > 50 * 1024 * 1024) {
        const context = createContext(origineMessage, {
            title: "File Size Limit",
            body: "Maximum 50MB allowed"
        });
        return repondre({
            text: `${EMOJI_THEME.error} *File Too Large*\nThe video exceeds 50MB limit.`,
            ...context
        });
    }

    try {
        const processingContext = createContext(origineMessage, {
            title: "Conversion in Progress",
            body: "Video to MP3"
        });
        await repondre({
            text: `${EMOJI_THEME.processing} Converting video to audio, please wait...`,
            ...processingContext
        });

        let media = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
        const audioPath = `${media}.mp3`;

        await convertToMp3(media, audioPath);
        fs.unlinkSync(media);

        const successContext = createContext(origineMessage, {
            title: "Conversion Complete",
            body: "Your MP3 is ready"
        });

        await zk.sendMessage(from, {
            audio: { url: audioPath },
            mimetype: 'audio/mpeg',
            contextInfo: {
                externalAdReply: {
                    title: "Video to MP3",
                    body: BOT_TAGLINE,
                    thumbnailUrl: "https://files.catbox.moe/sd49da.jpg"
                }
            }
        }, { quoted: origineMessage });

        await repondre({
            text: `${EMOJI_THEME.success} *Conversion Successful*\nHere's your audio file!`,
            ...successContext
        });

        fs.unlinkSync(audioPath);
    } catch (error) {
        console.error("Conversion error:", error);
        const errorContext = createContext(origineMessage, {
            title: "Conversion Failed",
            body: "Try again later"
        });
        repondre({
            text: `${EMOJI_THEME.error} *Failed to Process*\n${error.message}`,
            ...errorContext
        });
    }
});
