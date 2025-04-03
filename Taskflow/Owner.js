const { adams } = require('../Ibrahim/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const { Catbox } = require('node-catbox');
const path = require('path');
const { createContext } = require('../utils/helper');

const catbox = new Catbox();

// Enhanced audio download and conversion
async function processAudio(audioMessage) {
    try {
        // Download audio
        const audioPath = await downloadMedia(audioMessage);
        const mp3Path = `${audioPath}.mp3`;
        
        // Convert to MP3 with better settings
        await new Promise((resolve, reject) => {
            ffmpeg(audioPath)
                .audioCodec('libmp3lame')
                .audioBitrate(128)
                .toFormat('mp3')
                .on('end', resolve)
                .on('error', reject)
                .save(mp3Path);
        });
        
        fs.unlinkSync(audioPath); // Remove original
        return mp3Path;
    } catch (error) {
        console.error('Audio processing error:', error);
        throw new Error('Failed to process audio');
    }
}

// Improved media download function
async function downloadMedia(mediaMessage) {
    const type = mediaMessage.mimetype.includes('image') ? 'image' : 
                mediaMessage.mimetype.includes('video') ? 'video' : 'audio';
    
    const stream = await downloadContentFromMessage(mediaMessage, type);
    const buffer = await streamToBuffer(stream);
    
    // Create temp directory if not exists
    const tempDir = path.join(__dirname, 'temp_media');
    await fs.ensureDir(tempDir);
    
    const ext = type === 'audio' ? 'ogg' : mediaMessage.mimetype.split('/')[1];
    const filePath = path.join(tempDir, `media_${Date.now()}.${ext}`);
    
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

async function uploadToCatbox(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error("File does not exist");
    }

    try {
        const response = await catbox.uploadFile({ path: filePath });
        return response;
    } catch (err) {
        console.error('Catbox upload error:', err);
        throw new Error("Failed to upload file");
    }
}

adams({ 
    nomCom: "url", 
    categorie: "General", 
    reaction: "🔗",
    description: "Get shareable URL for media files"
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
            mediaPath = await downloadMedia(msgRepondu.videoMessage);
            mediaType = 'video';
        } 
        else if (msgRepondu.imageMessage) {
            mediaPath = await downloadMedia(msgRepondu.imageMessage);
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

        // Upload to Catbox
        const catboxUrl = await uploadToCatbox(mediaPath);
        
        // Send response with context
        await repondre({
            text: `🔗 ${mediaType.toUpperCase()} URL:\n${catboxUrl}`,
            ...createContext(origineMessage, {
                title: "Media URL Ready",
                body: `Shared ${mediaType} file`,
                thumbnail: mediaType === 'image' ? catboxUrl : undefined
            })
        });

    } catch (error) {
        console.error('URL command error:', error);
        repondre({
            text: `❌ Error: ${error.message}`,
            ...createContext(origineMessage, {
                title: "Processing Failed",
                body: "Please try again"
            })
        });
    } finally {
        // Cleanup temp files
        if (mediaPath && fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath).catch(() => {});
        }
    }
});
