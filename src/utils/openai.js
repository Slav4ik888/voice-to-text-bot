import { Configuration, OpenAIApi } from 'openai';
import { createReadStream } from 'fs';
import { createFilename } from './create-filename.js';



class OpenAI {
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async transcriptionLoop(ctx, mp3Path, loops, i = 0) {
    try {
      
      if (i === loops) return // End
      if (i > loops) return console.log('Fucking error in OpenAI.transcriptionLoop');
      

      const filename = createFilename(mp3Path, i)

      // const file = await createReadStream(mp3Path);
      const response = await this.openai.createTranscription(
        createReadStream(filename),
        'whisper-1'
      );

      await ctx.reply(response.data.text);

      return this.transcriptionLoop(ctx, mp3Path, loops, i + 1)
    }
    catch (e) {
      console.log('e: ', e);
      console.log('e.statusText: ', e.statusText);
      console.log('Error in OpenAI.transcriptionLoop: ', e.message);
    }
  }
      
  async transcription(ctx, mp3Path, loops) {
    try {
      return this.transcriptionLoop(ctx, mp3Path, loops)
    }
    catch (e) {
      console.log('e: ', e);
      console.log('e.statusText: ', e.statusText);
      console.log('Error in OpenAI.transcription: ', e.message);
    }
  }
}

export const openai = new OpenAI(process.env.OPENAI_API_KEY);
