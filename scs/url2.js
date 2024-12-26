const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const { adams } = require("../Ibrahim/adams");
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const ffmpeg = require("fluent-ffmpeg");
const yts = require('yt-search');

async function convertToMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat("mp3")
            .on("error", (err) => reject(err))
            .on("end", () => resolve(outputPath))
            .save(outputPath);
    });
}

async function getYouTubeInfo(query) {
    try {
        const searchResults = await yts(query);
        if (!searchResults || !searchResults.videos.length) {
            throw new Error('No video found matching the query.');
        }

        const video = searchResults.videos[0]; // Get the top result
        return {
            title: video.title,
            owner: video.author.name,
            url: video.url,
            views: video.views,
            duration: video.timestamp,
        };
    } catch (err) {
        throw new Error('Error fetching video info: ' + err.message);
    }
}

adams({ nomCom: "inf", categorie: "General", reaction: "👨🏿‍💻" }, async (origineMessage, zk, commandeOptions) => {
    const { msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) {
        repondre('Please reply to a video or audio file.');
        return;
    }

    let mediaPath, mediaType;

    if (msgRepondu.videoMessage) {
        mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
        mediaType = 'video';
    } else if (msgRepondu.audioMessage) {
        mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
        mediaType = 'audio';

        const outputPath = `${mediaPath}.mp3`;

        try {
            // Convert audio to MP3 format
            await convertToMp3(mediaPath, outputPath);
            fs.unlinkSync(mediaPath); // Remove the original audio file
            mediaPath = outputPath; // Update the path to the converted MP3 file
        } catch (error) {
            console.error("Error converting audio to MP3:", error);
            repondre('Failed to process the audio file.');
            return;
        }
    } else {
        repondre('Unsupported media type. Reply with a video or audio file.');
        return;
    }

    try {
        // Use the file name as the query
        const fileName = mediaPath.split('/').pop();
        const query = fileName.replace(/\.[^/.]+$/, ''); // Remove file extension

        const videoInfo = await getYouTubeInfo(query);

        repondre(
            `YouTube Video Info:\n` +
            `Title: ${videoInfo.title}\n` +
            `Owner: ${videoInfo.owner}\n` +
            `Duration: ${videoInfo.duration}\n` +
            `Views: ${videoInfo.views}\n` +
            `URL: ${videoInfo.url}`
        );

        // Clean up the temporary file
        fs.unlinkSync(mediaPath);
    } catch (error) {
        console.error('Error fetching YouTube info:', error);
        repondre('Failed to fetch video information.');
    }
});
