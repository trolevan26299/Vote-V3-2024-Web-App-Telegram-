const { Telegraf } = require('telegraf');

const TOKEN = '6479578095:6397893668:AAE5yVvctjApm97fAFThhRH7quWlIaYIa0g';
const bot = new Telegraf(TOKEN);

const web_link = 'https://vote-v3.vercel.app';

bot.start((ctx) =>
  ctx.reply('Welcome :)))))', {
    reply_markup: {
      keyboard: [[{ text: 'web app', web_app: { url: web_link } }]],
    },
  })
);

bot.launch();
