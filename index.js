const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const P = require("pino");
const qrcode = require("qrcode-terminal");

const TARGET_GROUP_NAME = "PEDAL SHYT"; // 👈 Monitoring by Name now
const SCORES_FILE = "./scores.json";

if (!fs.existsSync(SCORES_FILE)) {
  fs.writeFileSync(
    SCORES_FILE,
    JSON.stringify({ "Laizi & Mochi": 0, "Chicken Banana": 0 }),
  );
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_baileys");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log("\nScan this QR Code:");
      qrcode.generate(qr, { small: true });
    }
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) connectToWhatsApp();
    } else if (connection === "open") {
      console.log(
        `✅ Bot is Online | Monitoring Group Name: "${TARGET_GROUP_NAME}"`,
      );
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const remoteJid = msg.key.remoteJid;
    const text = (
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ""
    ).trim();

    // Check if it's a group message first
    if (remoteJid.endsWith("@g.us")) {
      try {
        // Fetch current group details to check the name
        const groupMetadata = await sock.groupMetadata(remoteJid);

        // ONLY proceed if the group name matches exactly
        if (groupMetadata.subject !== TARGET_GROUP_NAME) return;

        if (text.toLowerCase().startsWith("won by")) {
          console.log(
            `📩 Command received in "${groupMetadata.subject}": "${text}"`,
          );

          const parts = text.split(/Won by /i);
          let winnerRaw = parts[1];
          let winner = winnerRaw ? winnerRaw.trim() : "Unknown";

          // Name Normalization
          if (winner.toLowerCase().includes("laizi")) winner = "Laizi & Mochi";
          if (winner.toLowerCase().includes("chicken"))
            winner = "Chicken Banana";

          let scores = JSON.parse(fs.readFileSync(SCORES_FILE));

          if (scores[winner] !== undefined) {
            // Update Scores
            scores[winner]++;
            fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));

            const newDesc =
              `🎾 *Weekend Padel* 🎾\n\n` +
              `🏆 Current Standings:\n` +
              `Laizi & Mochi: ${scores["Laizi & Mochi"]}\n` +
              `Chicken Banana: ${scores["Chicken Banana"]}\n\n` +
              `Last Updated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

            // Update Description (Assuming member permissions allow this)
            await sock.groupUpdateDescription(remoteJid, newDesc);

            await sock.sendMessage(remoteJid, {
              text: `✅ Recorded! ${winner} now has ${scores[winner]} wins.`,
            });
            console.log(`✅ Success: Updated for ${winner}`);
          } else {
            await sock.sendMessage(remoteJid, {
              text: `❌ Unknown Team: "${winner}"`,
            });
          }
        }
      } catch (err) {
        // Silently ignore errors from other groups or metadata fetch failures
        if (text.toLowerCase().startsWith("won by")) {
          console.error("❌ Error processing command:", err.message);
        }
      }
    }
  });
}

connectToWhatsApp();
