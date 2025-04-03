const { adams } = require('../Ibrahim/adams');
const axios = require("axios");
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const { Catbox } = require('node-catbox');
const path = require('path');

const catbox = new Catbox();

// Utility function to download media properly
async function downloadMedia(mediaMessage) {
    const stream = await downloadContentFromMessage(mediaMessage, mediaMessage.mimetype.includes('image') ? 'image' : 
                                                  mediaMessage.mimetype.includes('video') ? 'video' : 'audio');
    const buffer = await streamToBuffer(stream);
    const filePath = path.join(__dirname, `temp_${Date.now()}.${mediaMessage.mimetype.split('/')[1]}`);
    await fs.writeFile(filePath, buffer);
    return filePath;
}

async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

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
        repondre('Please reply to an image, video, or audio file.');
        return;
    }

    let mediaPath, mediaType;

    try {
        if (msgRepondu.videoMessage) {
            const videoSize = msgRepondu.videoMessage.fileLength;

            if (videoSize > 50 * 1024 * 1024) {
                repondre('The video is too long. Please send a smaller video.');
                return;
            }

            mediaPath = await downloadMedia(msgRepondu.videoMessage);
            mediaType = 'video';
        } else if (msgRepondu.imageMessage) {
            mediaPath = await downloadMedia(msgRepondu.imageMessage);
            mediaType = 'image';
        } else if (msgRepondu.audioMessage) {
            mediaPath = await downloadMedia(msgRepondu.audioMessage);
            mediaType = 'audio';

            const outputPath = `${mediaPath}.mp3`;
            try {
                await convertToMp3(mediaPath, outputPath);
                fs.unlinkSync(mediaPath);
                mediaPath = outputPath;
            } catch (error) {
                console.error("Error converting audio:", error);
                repondre('Failed to process the audio file.');
                return;
            }
        } else {
            repondre('Unsupported media type. Reply with an image, video, or audio file.');
            return;
        }

        const catboxUrl = await uploadToCatbox(mediaPath);
        fs.unlinkSync(mediaPath);

        switch (mediaType) {
            case 'image':
                repondre(`🖼️ Image URL:\n${catboxUrl}`);
                break;
            case 'video':
                repondre(`🎥 Video URL:\n${catboxUrl}`);
                break;
            case 'audio':
                repondre(`🔊 Audio URL (MP3):\n${catboxUrl}`);
                break;
            default:
                repondre('✅ Media URL:\n${catboxUrl}');
                break;
        }
    } catch (error) {
        console.error('Error in url command:', error);
        if (mediaPath && fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }
        repondre('❌ Error processing media. Please try again.');
    }
});
