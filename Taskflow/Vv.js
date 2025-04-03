const { adams } = require('../Ibrahim/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { createContext } = require('../utils/helper');

// Verify FFmpeg installation
ffmpeg.getAvailableFormats((err, formats) => {
  if (err) {
    console.error('❌ FFmpeg not installed or not in PATH!');
    console.error('Install FFmpeg: https://ffmpeg.org/download.html');
  } else {
    console.log('✅ FFmpeg is available:', Object.keys(formats).length, 'formats supported');
  }
});

adams({ 
    nomCom: "download", 
    categorie: "Media", 
    reaction: "⬇️",
    description: "Download any media file"
}, async (origineMessage, zk, commandeOptions) => {
    const { ms, repondre, msgRepondu } = commandeOptions;

    if (!msgRepondu || !ms?.key) {
        return repondre({
            text: "❌ Please reply to a media message",
            ...createContext(origineMessage, {
                title: "Usage Error",
                body: "Reply to media with !download"
            })
        }, { quoted: ms });
    }

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
    let mediaType, fileExtension, downloadType;
    if (msgRepondu.imageMessage) {
        mediaType = 'image';
        downloadType = 'image';
        fileExtension = 'jpg';
    } 
    else if (msgRepondu.videoMessage) {
        mediaType = 'video';
        downloadType = 'video';
        fileExtension = 'mp4';
    }
    else if (msgRepondu.audioMessage) {
        mediaType = 'audio';
        downloadType = 'audio';
        fileExtension = 'mp3';
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
        const tempDir = path.join(__dirname, 'temp_downloads');
        await fs.ensureDir(tempDir);
        const fileName = `${mediaType}_${Date.now()}.${fileExtension}`;
        const filePath = path.join(tempDir, fileName);

        // Download media
        const stream = await downloadContentFromMessage(mediaMessage, downloadType);
        const buffer = await streamToBuffer(stream);
        await fs.writeFile(filePath, buffer);

        // Handle audio conversion
        let finalPath = filePath;
        if (mediaType === 'audio') {
            const mp3Path = path.join(tempDir, `audio_${Date.now()}.mp3`);
            
            await new Promise((resolve, reject) => {
                ffmpeg(filePath)
                    .output(mp3Path)
                    .audioCodec('libmp3lame')
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });
            
            await fs.unlink(filePath);
            finalPath = mp3Path;
        }

        // Prepare message
        const messagePayload = {
            [mediaType === 'image' ? 'image' : 
             mediaType === 'video' ? 'video' : 
             mediaType === 'audio' ? 'audio' : 'document']: {
                url: finalPath
            },
            mimetype: mediaMessage.mimetype || 
                    (mediaType === 'audio' ? 'audio/mpeg' : 
                     mediaType === 'image' ? 'image/jpeg' : 
                     mediaType === 'video' ? 'video/mp4' : 'application/octet-stream'),
            caption: `⬇️ Downloaded ${mediaType}`,
            ...createContext(origineMessage, {
                title: `Downloaded ${mediaType}`,
                body: `Saved as ${path.basename(finalPath)}`
            })
        };

        await zk.sendMessage(origineMessage, messagePayload, { quoted: ms });
        await fs.unlink(finalPath);

    } catch (error) {
        console.error('Download error:', error);
        repondre({
            text: `❌ Download failed: ${error.message}`,
            ...createContext(origineMessage, {
                title: "Error",
                body: "See console for details"
            })
        }, { quoted: ms });
    }
});

// Helper functions
function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}
