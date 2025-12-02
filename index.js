const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// --- CONFIGURATION ---
const GROUP_NAME = "PEDAL TEST"; // MUST MATCH YOUR GROUP NAME EXACTLY

// --- DATA HANDLING ---
// Since we are on a virtual computer, we default to 0 every time we restart.
// You can set the starting score manually here if you want:
let scores = { "Laizi & Mochi": 5, "Chicken Banana": 1 };

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('\n=== SCAN THIS QR CODE ===');
    qrcode.generate(qr, { small: true });
    console.log('=========================\n');
});

client.on('ready', () => {
    console.log('✅ Padel Bot is Online! Ready to update scores.');
});

client.on('message', async (msg) => {
    if (msg.body.startsWith('!win')) {
        const chat = await msg.getChat();
        
        // Security check
        if (!chat.isGroup || chat.name !== GROUP_NAME) return;

        const winnerRaw = msg.body.split('!win ')[1];
        const winner = winnerRaw ? winnerRaw.trim() : null;

        if (winner === 'Laizi And Mochi' || winner === 'Chicken Banana') {
            // Update Score
            scores[winner]++;
            
            // Create Description
            const newDesc = `🎾 *Weekend Padel * 🎾\n\n` +
                            `🏆 Current Standings:\n` +
                            `Laizi And Mochi: ${scores["Team A"]}\n` +
                            `Chicken Banana: ${scores["Team B"]}\n\n` +
                            `Last Updated: ${new Date().toLocaleDateString()}`;

            try {
                await chat.setDescription(newDesc);
                await msg.reply(`✅ Score updated! ${winner} now has ${scores[winner]} wins.`);
            } catch (err) {
                await msg.reply("❌ Error: Make sure I am an Admin!");
            }
        } else {
            await msg.reply("❌ Use: !win Team A OR !win Team B");
        }
    }
});

client.initialize();
