const { adams } = require('../Ibrahim/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const { Catbox } = require('node-catbox');
const path = require('path');
const { createContext } = require('../utils/helper');

const catbox = new Catbox();

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp_media');
fs.ensureDirSync(tempDir);

// Enhanced audio processor
async function processAudio(audioMessage) {
    try {
        // Download original audio
        const stream = await downloadContentFromMessage(audioMessage, 'audio');
        const buffer = await streamToBuffer(stream);
        const oggPath = path.join(tempDir, `audio_${Date.now()}.ogg`);
        await fs.writeFile(oggPath, buffer);

        // Convert to MP3
        const mp3Path = path.join(tempDir, `audio_${Date.now()}.mp3`);
        await new Promise((resolve, reject) => {
            ffmpeg(oggPath)
                .audioCodec('libmp3lame')
                .audioBitrate(128)
                .outputOptions('-ar', '44100') // Sample rate
                .on('end', () => {
                    fs.unlinkSync(oggPath); // Clean up OGG
                    resolve();
                })
                .on('error', reject)
                .save(mp3Path);
        });

        return mp3Path;
    } catch (error) {
        console.error('Audio processing failed:', error);
        throw new Error('Failed to process audio');
    }
}

// Universal media downloader
async function downloadMedia(mediaMessage, type) {
    try {
        const stream = await downloadContentFromMessage(mediaMessage, type);
        const buffer = await streamToBuffer(stream);
        const ext = type === 'audio' ? 'ogg' : mediaMessage.mimetype.split('/')[1];
        const filePath = path.join(tempDir, `${type}_${Date.now()}.${ext}`);
        await fs.writeFile(filePath, buffer);
        return filePath;
    } catch (error) {
        console.error('Download failed:', error);
        throw new Error(`Failed to download ${type}`);
    }
}

// Helper function
function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

// Upload handler with retries
async function uploadToCatbox(filePath, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error("File not found");
            }
            return await catbox.uploadFile({ path: filePath });
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

adams({ 
    nomCom: "url", 
    categorie: "General", 
    reaction: "🔗",
    description: "Get shareable URL for any media"
}, async (origineMessage, zk, commandeOptions) => {
    const { msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) {
        return repondre({
            text: "❌ Please reply to a media message",
            ...createContext(origineMessage, {
                title: "Usage Error",
                body: "Reply to an image/video/audio"
            })
        });
    }

    let mediaPath, mediaType;

    try {
        // Handle different media types
        if (msgRepondu.videoMessage) {
            if (msgRepondu.videoMessage.fileLength > 50 * 1024 * 1024) {
                return repondre({
                    text: "❌ Video exceeds 50MB limit",
                    ...createContext(origineMessage, {
                        title: "Size Limit",
                        body: "Maximum 50MB videos"
                    })
                });
            }
            mediaPath = await downloadMedia(msgRepondu.videoMessage, 'video');
            mediaType = 'video';
        } 
        else if (msgRepondu.imageMessage) {
            mediaPath = await downloadMedia(msgRepondu.imageMessage, 'image');
            mediaType = 'image';
        } 
        else if (msgRepondu.audioMessage) {
            mediaPath = await processAudio(msgRepondu.audioMessage);
            mediaType = 'audio';
        } 
        else {
            return repondre({
                text: "❌ Unsupported media type",
                ...createContext(origineMessage, {
                    title: "Media Error",
                    body: "Only images/videos/audio"
                })
            });
        }

        // Upload with retry logic
        const catboxUrl = await uploadToCatbox(mediaPath);
        
        // Success response
        await repondre({
            text: `🔗 ${mediaType.toUpperCase()} URL:\n${catboxUrl}`,
            ...createContext(origineMessage, {
                title: "Media URL Ready",
                body: `Click to download ${mediaType}`,
                thumbnail: mediaType === 'image' ? catboxUrl : undefined
            })
        });

    } catch (error) {
        console.error('URL command failed:', error);
        await repondre({
            text: `❌ Error: ${error.message}`,
            ...createContext(origineMessage, {
                title: "Processing Failed",
                body: "Please try again later"
            })
        });
    } finally {
        // Safe cleanup
        try {
            if (mediaPath && fs.existsSync(mediaPath)) {
                fs.unlinkSync(mediaPath);
            }
        } catch (cleanupError) {
            console.error('Cleanup failed:', cleanupError);
        }
    }
});
