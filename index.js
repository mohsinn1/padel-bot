const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs'); 

// CONFIGURATION
const GROUP_NAME = "PEDAL TEST"; 
const SCORES_FILE = "./scores.json";

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        // 👇 This line fixes the "Could not find browser" error
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});
client.on('qr', (qr) =>{console.clear(); qrcode.generate(qr, { small: true })});

client.on('ready', () => {
    console.log('✅ Bot is Online!');
    // Load scores immediately to show we are ready
    const current = JSON.parse(fs.readFileSync(SCORES_FILE));
    console.log(`📊 Loaded Scores: Laizi & Mochi: ${current["Laizi & Mochi"]} | Chicken Banana: ${current["Chicken Banana"]}`);
});

client.on('message_create', async (msg) => {
    const chat = await msg.getChat();
    
    // Filter: Must be the right group
    if (!chat.isGroup || chat.name !== GROUP_NAME) return;

    // Check Command
    if (msg.body.toLowerCase().startsWith('won by')) {
        
        // 1. Parse the winner
        const parts = msg.body.split(/Won by /i); 
        let winnerRaw = parts[1];
        let winner = winnerRaw ? winnerRaw.trim() : "Unknown";

        // 2. Fix Name Variations
        if (winner.toLowerCase() === 'laizi and mochi') winner = 'Laizi & Mochi';
        if (winner.toLowerCase() === 'chicken banana') winner = 'Chicken Banana';


        // 3. Load CURRENT scores from file (in case they changed manually)
        let scores = JSON.parse(fs.readFileSync(SCORES_FILE));

        // 4. Update if team exists
        if (scores[winner] !== undefined) {
            scores[winner]++;
            
            // SAVE to file immediately
            fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));

            // Generate Description
            const newDesc = `🎾 *Weekend Padel* 🎾\n\n` +
                            `🏆 Current Standings:\n` +
                            `Laizi & Mochi: ${scores["Laizi & Mochi"]}\n` +
                            `Chicken Banana: ${scores["Chicken Banana"]}\n\n` +
                            `Last Updated: ${new Date().toLocaleDateString()}`;
            
            try {
                await chat.setDescription(newDesc);
                await msg.reply(`✅ Recorded! ${winner} now has ${scores[winner]} wins.`);
                console.log(`Updated score for ${winner}`);
            } catch (err) {
                console.log("❌ Error: Bot needs Admin rights.");
            }
        } else {
             await msg.reply(`❌ Unknown Team.`);
        }
    }
});

client.initialize();
