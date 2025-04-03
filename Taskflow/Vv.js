const { adams } = require('../Ibrahim/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { createContext } = require('../utils/helper');

adams({ 
    nomCom: "download", 
    categorie: "Media", 
    reaction: "⬇️",
    description: "Download any media file with context"
}, async (origineMessage, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;

    // Validate replied message
    if (!msgRepondu || !ms?.key) {
        return repondre({
            text: "❌ Please reply to a media message",
            ...createContext(origineMessage, {
                title: "Usage Error",
                body: "Reply to media with !download"
            })
        }, { quoted: ms });
    }

    // Safely extract media message
    const mediaMessage = msgRepondu.imageMessage || 
                        msgRepondu.videoMessage || 
                        msgRepondu.audioMessage || 
                        msgRepondu.stickerMessage || 
                        msgRepondu.documentMessage;

    if (!mediaMessage) {
        return repondre({
            text: "❌ No media found in replied message",
            ...createContext(origineMessage, {
                title: "Media Error",
                body: "Only images/videos/audio supported"
            })
        }, { quoted: ms });
    }

    // Determine media type and properties
    let mediaType, fileExtension, downloadType;
    if (msgRepondu.imageMessage) {
        mediaType = 'image';
        downloadType = 'image';
        fileExtension = mediaMessage.mimetype?.split('/')[1] || 'jpg';
    } 
    else if (msgRepondu.videoMessage) {
        mediaType = 'video';
        downloadType = 'video';
        fileExtension = mediaMessage.mimetype?.split('/')[1] || 'mp4';
        
        // Check video size (50MB limit)
        if (mediaMessage.fileLength > 50 * 1024 * 1024) {
            return repondre({
                text: "❌ Video exceeds 50MB limit",
                ...createContext(origineMessage, {
                    title: "Size Limit",
                    body: "Maximum 50MB videos"
                })
            }, { quoted: ms });
        }
    }
    else if (msgRepondu.audioMessage) {
        mediaType = 'audio';
        downloadType = 'audio';
        fileExtension = 'mp3'; // Will convert to MP3
    }
    else if (msgRepondu.stickerMessage) {
        mediaType = 'sticker';
        downloadType = msgRepondu.stickerMessage.isAnimated ? 'video' : 'image';
        fileExtension = msgRepondu.stickerMessage.isAnimated ? 'webm' : 'webp';
    }
    else if (msgRepondu.documentMessage) {
        mediaType = 'document';
        downloadType = 'document';
        fileExtension = mediaMessage.fileName?.split('.').pop() || 'bin';
    }

    try {
        // Prepare download
        const tempDir = path.join(__dirname, 'temp_downloads');
        await fs.ensureDir(tempDir);
        const fileName = `${mediaType}_${Date.now()}.${fileExtension}`;
        const filePath = path.join(tempDir, fileName);

        // Download media
        const stream = await downloadContentFromMessage(mediaMessage, downloadType);
        const buffer = await streamToBuffer(stream);
        await fs.writeFile(filePath, buffer);

        // Convert audio if needed
        let finalPath = filePath;
        if (mediaType === 'audio') {
            const mp3Path = path.join(tempDir, `${mediaType}_${Date.now()}.mp3`);
            await convertToMp3(filePath, mp3Path);
            await fs.unlink(filePath);
            finalPath = mp3Path;
            fileExtension = 'mp3';
        }

        // Prepare message based on media type
        let messagePayload = {
            caption: `⬇️ *${mediaType.toUpperCase()} DOWNLOAD*\n` +
                     `📁 ${path.basename(finalPath)}\n` +
                     `🕒 ${new Date().toLocaleTimeString()}`,
            ...createContext(origineMessage, {
                title: `Downloaded ${mediaType}`,
                body: `Saved as ${path.basename(finalPath)}`,
                thumbnail: mediaType === 'image' ? finalPath : undefined
            })
        };

        // Set correct media property based on type
        if (mediaType === 'image' || (mediaType === 'sticker' && !msgRepondu.stickerMessage.isAnimated)) {
            messagePayload.image = { url: finalPath };
        } 
        else if (mediaType === 'video' || (mediaType === 'sticker' && msgRepondu.stickerMessage.isAnimated)) {
            messagePayload.video = { url: finalPath };
        }
        else if (mediaType === 'audio') {
            messagePayload.audio = { url: finalPath };
            messagePayload.mimetype = 'audio/mpeg';
        }
        else if (mediaType === 'document') {
            messagePayload.document = { url: finalPath };
            messagePayload.mimetype = mediaMessage.mimetype;
            messagePayload.fileName = mediaMessage.fileName || `download.${fileExtension}`;
        }

        await zk.sendMessage(origineMessage, messagePayload, { quoted: ms });

        // Clean up
        await fs.unlink(finalPath);

    } catch (error) {
        console.error('Download error:', error);
        repondre({
            text: `❌ Download failed: ${error.message}`,
            ...createContext(origineMessage, {
                title: "Error Occurred",
                body: "Try again later"
            })
        }, { quoted: ms });
    }
});

// Helper functions
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

async function convertToMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .audioCodec('libmp3lame')
            .toFormat('mp3')
            .on('end', () => resolve())
            .on('error', reject)
            .save(outputPath);
    });
}
