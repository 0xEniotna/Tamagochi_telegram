import { Telegraf, Telegram } from 'telegraf';
import * as dotenv from 'dotenv';
dotenv.config();

console.log('Starting bot setup...');

const token = process.env.TELEGRAM_BOT_TOKEN;
const username = process.env.TELEGRAM_BOT_USERNAME;
const name = process.env.TELEGRAM_BOT_NAME;

if (!token || !username || !name) {
  throw new Error('One or more bot properties are not set');
}

console.log('Bot token:', token);
console.log('Bot username:', username);
console.log('Bot name:', name);

// Create a custom Telegram instance pointing to the test network
const telegram = new Telegram(token, {
  apiRoot: 'https://api.test.telegram.org',
});

// Initialize Telegraf with the custom Telegram client
const bot = new Telegraf(token, { telegram });

// Register listeners for commands and messages
bot.start((ctx) => ctx.reply('Welcome! Up and running.'));
bot.on('message', (ctx) => ctx.reply('Got another message!'));

// Start the bot
bot.launch().then(() => {
  console.log('Bot is up and running!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
