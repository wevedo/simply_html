const path = require('path');
const fs = require('fs-extra');

async function loadCommands(commandRegistry) {
    const commandsDir = path.join(__dirname, '..', 'commands');
    
    console.log('\n» Loading commands...');
    
    try {
        const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
        
        for (const file of files) {
            try {
                const cmdPath = path.join(commandsDir, file);
                delete require.cache[require.resolve(cmdPath)];
                const command = require(cmdPath);
                
                if (!command.name || !command.execute) {
                    console.log(`Invalid command file: ${file}`);
                    continue;
                }
                
                commandRegistry.set(command.name.toLowerCase(), command);
                console.log(`Loaded: ${command.name.padEnd(15)} ${file}`);
                
            } catch (e) {
                console.log(`Failed ${file}: ${e.message}`);
            }
        }
    } catch (dirError) {
        console.log(`Command directory error: ${dirError.message}`);
    }
}

module.exports = loadCommands;
