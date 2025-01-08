import { Bot } from 'grammy';
import 'dotenv/config';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
}

const bot = new Bot(token, {
  client: {
    environment: 'test',
  },
  botInfo: {
    id: parseInt(token.split(':')[0]),
    is_bot: true,
    first_name: 'TamagotchiTestBot',
    username: 'TamagotchiTestBot',
    can_join_groups: false,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
    can_connect_to_business: false,
    has_main_web_app: true,
  },
});

bot.command('start', (ctx) => ctx.reply('Hello! Im the bot!'));

bot.api
  .getMe()
  .then((botInfo) => {
    console.log('Successfully connected to bot:', botInfo.username);

    // Add commands
    bot.command('start', (ctx) => ctx.reply('Hello! Bot is working!'));

    return bot.start({
      onStart: (info) => {
        console.log('🤖 Bot started as @' + info.username);
      },
    });
  })
  .catch((err) => {
    console.error('Connection error:', err.message);
    if (err.description) {
      console.error('Error description:', err.description);
    }
    process.exit(1);
  });
