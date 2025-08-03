const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');

// Auth state will be saved here
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startSession() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    // Save credentials
    sock.ev.on('creds.update', saveState);

    // Connection update handling
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("📸 Scan this QR code using WhatsApp (Linked Devices).");
        }

        if (connection === 'open') {
            console.log('✅ Successfully paired!');
            console.log(`📱 Your bot is connected as: ${sock.user.name || 'Unknown'} (${sock.user.id.split(':')[0]})`);
            console.log('🔒 Auth saved to auth_info.json\n');
            // process.exit(); // Uncomment if you want to exit after pair
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(`❌ Disconnected. Reason: ${DisconnectReason[reason] || 'Unknown'}`);

            // Auto reconnect except on logout
            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔁 Reconnecting...");
                startSession();
            } else {
                console.log("👋 Session ended. Please re-run to scan QR again.");
                process.exit(0);
            }
        }
    });

    // Optional: Listen to new messages (can remove for just pairing)
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg?.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

        if (text?.toLowerCase() === "ping") {
            await sock.sendMessage(sender, { text: "🏓 pong!" });
        }
    });
}

startSession();
