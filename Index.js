// Load environment variables
require('dotenv').config();

// Import custom module
const { loginToBlackWolf } = require('./maga');

console.log("🧠 Black Wolf Bot Powered by Shashika");

loginToBlackWolf();

// ------------------------
// Future features idea:
// - connect to WhatsApp using Baileys
// - setup message listener
// - command handler
// ------------------------
