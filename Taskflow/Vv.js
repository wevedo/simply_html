const { adams } = require('../Ibrahim/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

adams({ 
    nomCom: "download", 
    categorie: "Media", 
    reaction: "⬇️",
    description: "Download any media file (images, videos, audio, stickers, documents)"
}, async (origineMessage, zk, commandeOptions) => {
    const { msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) {
        return repondre("❌ Please reply to a media message (image, video, audio, sticker, or document)");
    }

    // Determine media type and prepare download
    let mediaType, fileExtension, mediaMessage;
    
    if (msgRepondu.imageMessage) {
        mediaType = 'image';
        mediaMessage = msgRepondu.imageMessage;
        fileExtension = mediaMessage.mimetype.split('/')[1] || 'jpg';
    } 
    else if (msgRepondu.videoMessage) {
        mediaType = 'video';
        mediaMessage = msgRepondu.videoMessage;
        fileExtension = mediaMessage.mimetype.split('/')[1] || 'mp4';
        
        // Check video size limit (50MB)
        if (mediaMessage.fileLength > 50 * 1024 * 1024) {
            return repondre("❌ Video is too large (max 50MB)");
        }
    }
    else if (msgRepondu.audioMessage) {
        mediaType = 'audio';
        mediaMessage = msgRepondu.audioMessage;
        fileExtension = 'mp3'; // We'll convert to MP3
    }
    else if (msgRepondu.stickerMessage) {
        mediaType = 'sticker';
        mediaMessage = msgRepondu.stickerMessage;
        fileExtension = mediaMessage.isAnimated ? 'webp' : 'webp';
    }
    else if (msgRepondu.documentMessage) {
        mediaType = 'document';
        mediaMessage = msgRepondu.documentMessage;
        fileExtension = mediaMessage.fileName.split('.').pop() || 'bin';
    }
    else {
        return repondre("❌ Unsupported media type. Please reply to an image, video, audio, sticker, or document");
    }

    try {
        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, 'temp');
        await fs.ensureDir(tempDir);
        
        // Download the media
        const fileName = `${mediaType}_${Date.now()}.${fileExtension}`;
        const filePath = path.join(tempDir, fileName);
        
        const stream = await downloadContentFromMessage(mediaMessage, mediaType);
        const buffer = await streamToBuffer(stream);
        await fs.writeFile(filePath, buffer);

        // Convert audio to MP3 if needed
        let finalPath = filePath;
        if (mediaType === 'audio') {
            const mp3Path = path.join(tempDir, `${mediaType}_${Date.now()}.mp3`);
            await convertToMp3(filePath, mp3Path);
            await fs.unlink(filePath); // Remove original
            finalPath = mp3Path;
        }

        // Send the file back to user
        await zk.sendMessage(origineMessage, { 
            [mediaType === 'image' ? 'image' : 
             mediaType === 'video' ? 'video' : 
             mediaType === 'audio' ? 'audio' : 'document']: {
                url: finalPath
            },
            mimetype: mediaMessage.mimetype,
            caption: `⬇️ Downloaded ${mediaType}\n📁 ${path.basename(finalPath)}`
        }, { quoted: msgRepondu });

        // Clean up
        await fs.unlink(finalPath);

    } catch (error) {
        console.error('Download error:', error);
        repondre(`❌ Failed to download media: ${error.message}`);
    }
});

// Helper function to convert stream to buffer
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

// Audio conversion function
async function convertToMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .audioCodec('libmp3lame')
            .toFormat('mp3')
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err))
            .save(outputPath);
    });
}
