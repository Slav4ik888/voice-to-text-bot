import './utils/dotenv.js';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import { ogg } from './utils/ogg.js';
import { openai } from './utils/openai.js';
import { showHowUsed, showText } from './utils/show-console.js';


console.log('env: ', process.env.NODE_ENV);


const bot = new Telegraf(process.env.TELEGRAMM_BOT_TOKEN);

bot.command('start', async (ctx) => {
  await ctx.reply('Пришлите голосовое сообщение и я переведу его в текст');
});

bot.on(message('audio'), async (ctx) => {
  
  try {
    await ctx.reply(code('Audio cообщение принял, обрабатываю...'))
    // await ctx.reply(JSON.stringify(ctx.update.message, null, 2));
    const
      link = await ctx.telegram.getFileLink(ctx.update.message.audio.file_id),
      userId = String(ctx.message.from.id);
    
    showHowUsed(ctx.message.from, ctx.update.message.audio);

    const
      oggPath = await ogg.create(link.href, userId),
      mp3Path = await ogg.toMp3(oggPath, userId),
      text    = await openai.transcription(mp3Path);

    showText(userId, text);
    await ctx.reply(text);
  }
  catch (e) {
    console.log('Error in audio message: ', e.message);
    await ctx.reply(e.message);
  }
});


bot.on(message('voice'), async (ctx) => {
  try {
    await ctx.reply(code('Voice cообщение принял, обрабатываю...'))
    // await ctx.reply(JSON.stringify(ctx.message.voice, null, 2));
    const
      link = await ctx.telegram.getFileLink(ctx.message.voice.file_id),
      userId = String(ctx.message.from.id);
    
    showHowUsed(ctx.message.from, ctx.message.voice);
  
    const
      oggPath = await ogg.create(link.href, userId),
      mp3Path = await ogg.toMp3(oggPath, userId),
      text    = await openai.transcription(mp3Path);

    showText(userId, text);

    await ctx.reply(text);
  }
  catch (e) {
    console.log('Error in voice message: ', e.message);
    await ctx.reply(e.message);
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
// git add . && git commit -m "2023-05-23" && git push -u origin main
