import './utils/dotenv.js';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import { ogg } from './utils/ogg.js';
import { openai } from './utils/openai.js';


console.log('env: ', process.env.NODE_ENV);


const bot = new Telegraf(process.env.TELEGRAMM_BOT_TOKEN);

bot.command('start', async (ctx) => {
  await ctx.reply('Пришлите голосовое сообщение и я переведу его в текст');
});


bot.on(message('voice'), async (ctx) => {
  try {
    await ctx.reply(code('Сообщение принял, обрабатываю...'))
    // await ctx.reply(JSON.stringify(ctx.message.voice, null, 2));
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = String(ctx.message.from.id);

    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);

    const text = await openai.transcription(mp3Path);
    await ctx.reply(text);
  }
  catch (e) {
    console.log('Error in voice message: ', e.message);
  }
});


bot.launch();

// =================================================

console.log(`Starting Voice_to_text_bot...`);

process.once('SIGINT', () => {
  console.log('[SIGINT] stop bot!');
  bot.stop('SIGINT');
}); // If nodejs stopped => we will stop bot

process.once('SIGTERM', () => {
  console.log('[SIGTERM] stop bot!');
  bot.stop('SIGTERM');
});



// t.me/voice_to_text_slv4ik888_bot
// git add . && git commit -m "init" && git push origin main
