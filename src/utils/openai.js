import { Configuration, OpenAIApi } from 'openai';
import { createReadStream } from 'fs';


class OpenAI {
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async transcription(mp3Path) {
    try {
      // const file = await createReadStream(mp3Path);
      const response = await this.openai.createTranscription(
        createReadStream(mp3Path),
        'whisper-1'
      );

      return response.data.text
    }
    catch (e) {
      console.log('Error in OpenAI.transcription: ', e.message);
    }
  }
}

export const openai = new OpenAI(process.env.OPENAI_API_KEY);
