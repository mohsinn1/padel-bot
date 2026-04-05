const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const P = require("pino");
const qrcode = require("qrcode-terminal");

const TARGET_GROUP_NAME = "PEDAL TEST";
const SCORES_FILE = "./scores.json";

if (!fs.existsSync(SCORES_FILE)) {
  fs.writeFileSync(
    SCORES_FILE,
    JSON.stringify({ "Team One": 0, "Team Two": 0 }),
  );
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_baileys");

  // Fetch latest version to avoid 405 error
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`Using WhatsApp v${version.join(".")}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
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
      console.log(`Bot is Online and Monitoring Group Name: "${TARGET_GROUP_NAME}"`);
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

    if (remoteJid.endsWith("@g.us")) {
      try {
        const groupMetadata = await sock.groupMetadata(remoteJid);
        
        // Only proceed if the group name matches exactly
        if (groupMetadata.subject !== TARGET_GROUP_NAME) return;

        if (text.toLowerCase().startsWith("won by")) {
          const parts = text.split(/Won by /i);
          let winnerRaw = parts[1];
          let winner = winnerRaw ? winnerRaw.trim() : "Unknown";

          // Name Normalization
          if (winner.toLowerCase().includes("one")) winner = "Team One";
          if (winner.toLowerCase().includes("two")) winner = "Team Two";

          let scores = JSON.parse(fs.readFileSync(SCORES_FILE));

          if (scores[winner] !== undefined) {
            scores[winner]++;
            fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));

            const newDesc =
              `Weekend Padel\n\n` +
              `Current Standings:\n` +
              `Team One: ${scores["Team One"]}\n` +
              `Team Two: ${scores["Team Two"]}\n`;

            await sock.groupUpdateDescription(remoteJid, newDesc);
            await sock.sendMessage(remoteJid, {
              text: `Recorded! ${winner} now has ${scores[winner]} wins.`,
            });
          } else {
            await sock.sendMessage(remoteJid, {
              text: `Unknown Team: "${winner}"`,
            });
          }
        }
      } catch (err) { }
    }
  });
}

connectToWhatsApp();
