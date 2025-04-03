const { adams } = require('../Ibrahim/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const { Catbox } = require('node-catbox');
const path = require('path');
const { createContext } = require('../utils/helper');

const catbox = new Catbox();
const botJid = `${adams.user?.id.split(':')[0]}@s.whatsapp.net`;

// Enhanced media download with proper type handling
async function downloadMedia(mediaMessage) {
    let mediaType;
    if (mediaMessage.mimetype) {
        if (mediaMessage.mimetype.includes('image')) mediaType = 'image';
        else if (mediaMessage.mimetype.includes('video')) mediaType = 'video';
        else if (mediaMessage.mimetype.includes('audio')) mediaType = 'audio';
    }
    mediaType = mediaType || 'document';

    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
    const buffer = await streamToBuffer(stream);
    
    // Generate appropriate file extension
    let extension = 'bin';
    if (mediaMessage.mimetype) {
        extension = mediaMessage.mimetype.split('/')[1] || 
                   (mediaMessage.mimetype.includes('audio') ? 'mp3' : 'bin');
    }
    
    const filePath = path.join(__dirname, `temp_${Date.now()}.${extension}`);
    await fs.writeFile(filePath, buffer);
    return { filePath, mediaType };
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
        throw new Error(`Upload failed: ${err.message}`);
    }
}

// Enhanced audio conversion with proper encoding
async function convertAudio(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .audioCodec('libmp3lame')
            .audioBitrate(128)
            .toFormat('mp3')
            .on('error', reject)
            .on('end', resolve)
            .save(outputPath);
    });
}

adams({ nomCom: "url", categorie: "General", reaction: "🔗" }, async (origineMessage, zk, commandeOptions) => {
    const { msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) {
        return repondre({
            text: "❌ Please reply to a media message",
            ...createContext(origineMessage, {
                title: "Usage Error",
                body: "Reply to image/video/audio/document"
            })
        });
    }

    // Detect media type
    const mediaMessage = msgRepondu.imageMessage || msgRepondu.videoMessage || 
                        msgRepondu.audioMessage || msgRepondu.documentMessage;
    if (!mediaMessage) {
        return repondre({
            text: "❌ Unsupported media type",
            ...createContext(origineMessage, {
                title: "Media Error",
                body: "Only images/videos/audio/documents"
            })
        });
    }

    let mediaPath, mediaType, finalPath;

    try {
        // Download the media
        const downloadResult = await downloadMedia(mediaMessage);
        mediaPath = downloadResult.filePath;
        mediaType = downloadResult.mediaType;

        // Special handling for audio
        if (mediaType === 'audio') {
            finalPath = `${mediaPath}.mp3`;
            await convertAudio(mediaPath, finalPath);
            fs.unlinkSync(mediaPath); // Remove original
        } else {
            finalPath = mediaPath;
        }

        // Upload to Catbox
        const catboxUrl = await uploadToCatbox(finalPath);

        // Prepare response based on media type
        let responseText;
        switch (mediaType) {
            case 'image':
                responseText = `🖼️ Image URL:\n${catboxUrl}`;
                break;
            case 'video':
                responseText = `🎥 Video URL:\n${catboxUrl}`;
                break;
            case 'audio':
                responseText = `🔊 Audio URL (MP3):\n${catboxUrl}`;
                break;
            default:
                responseText = `📄 Document URL:\n${catboxUrl}`;
        }

        await repondre({
            text: responseText,
            ...createContext(origineMessage, {
                title: "Media URL Generated",
                body: "Link will expire after some time"
            })
        });

    } catch (error) {
        console.error('URL command error:', error);
        await repondre({
            text: `❌ Error: ${error.message}`,
            ...createContext(origineMessage, {
                title: "Processing Failed",
                body: "Please try again"
            })
        });
    } finally {
        // Cleanup temporary files
        if (mediaPath && fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);
        if (finalPath && finalPath !== mediaPath && fs.existsSync(finalPath)) {
            fs.unlinkSync(finalPath);
        }
    }
});
