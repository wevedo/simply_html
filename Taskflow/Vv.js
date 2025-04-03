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

    // Determine media type
    let mediaType, fileExtension;
    if (msgRepondu.imageMessage) {
        mediaType = 'image';
        fileExtension = mediaMessage.mimetype?.split('/')[1] || 'jpg';
    } 
    else if (msgRepondu.videoMessage) {
        mediaType = 'video';
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
        fileExtension = 'mp3'; // Will convert to MP3
    }
    else if (msgRepondu.stickerMessage) {
        mediaType = 'sticker';
        fileExtension = mediaMessage.isAnimated ? 'webp' : 'webp';
    }
    else if (msgRepondu.documentMessage) {
        mediaType = 'document';
        fileExtension = mediaMessage.fileName?.split('.').pop() || 'bin';
    }

    try {
        // Prepare download
        const tempDir = path.join(__dirname, 'temp_downloads');
        await fs.ensureDir(tempDir);
        const fileName = `${mediaType}_${Date.now()}.${fileExtension}`;
        const filePath = path.join(tempDir, fileName);

        // Download media
        const stream = await downloadContentFromMessage(mediaMessage, mediaType);
        const buffer = await streamToBuffer(stream);
        await fs.writeFile(filePath, buffer);

        // Convert audio if needed
        let finalPath = filePath;
        if (mediaType === 'audio') {
            const mp3Path = path.join(tempDir, `${mediaType}_${Date.now()}.mp3`);
            await convertToMp3(filePath, mp3Path);
            await fs.unlink(filePath);
            finalPath = mp3Path;
        }

        // Send with rich context
        const context = createContext(origineMessage, {
            title: `Downloaded ${mediaType}`,
            body: `Saved as ${path.basename(finalPath)}`,
            thumbnail: mediaType === 'image' ? finalPath : undefined
        });

        await zk.sendMessage(origineMessage, {
            [mediaType]: { url: finalPath },
            mimetype: mediaMessage.mimetype,
            caption: `⬇️ *${mediaType.toUpperCase()} DOWNLOAD*\n` +
                     `📁 ${path.basename(finalPath)}\n` +
                     `🕒 ${new Date().toLocaleTimeString()}`,
            ...context
        }, { quoted: ms });

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
