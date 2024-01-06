import { createFilename } from './create-filename.js';
import { ogg } from './ogg.js';
import { openai } from './openai.js';
import { removeFile } from './remove-files.js';
import { showHowUsed } from './show-console.js';


export const transforming = async (ctx, data, link) => {
  try {
    const 
      userId = String(ctx.message.from.id);
      
    showHowUsed(ctx.message.from, data);
  
    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);
    const loops = await ogg.splitMp3(mp3Path, data.duration);

    await openai.transcription(ctx, mp3Path, loops);

    removeFile(mp3Path);
    for (let i = 0; i < loops; i++) {
      const filename = createFilename(mp3Path, i)
      removeFile(filename);
    }
  } catch (e) {
    console.log('Error in transforming: ', e.message);
    await ctx.reply(e.message);
  }
}
