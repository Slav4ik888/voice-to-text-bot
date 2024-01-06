import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { removeFile } from './remove-files.js';
import { createFilename } from './create-filename.js';


const __dirname = dirname(fileURLToPath(import.meta.url));


class OggConverter {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path)
  }


  async create(url, filename) {
    try {
      const oggPath = resolve(__dirname, '../../__temp/voices', `${filename}.ogg`);

      const response = await axios({
        method: 'get',
        url,
        responseType: 'stream'
      });

      
      return new Promise(async (res, rej) => {
        const stream = createWriteStream(oggPath);
        response.data.pipe(stream);

        stream.on('error', (err) => {
          stream.close();
          rej(`Reject OggConverter.create ${err}`)
        });
        stream.on('finish', () => res(oggPath));
      })
    }
    catch (e) {
      console.log('Error in OggConverter.create: ', e.message);
    }
  }


  toMp3(inputPath, userId) {
    try {
      const outputPath = resolve(dirname(inputPath), `${userId}.mp3`);

      return new Promise((res, rej) => {
        ffmpeg(inputPath)
          // .inputOption('-t 2000')
          .output(outputPath)
          .on('end', () => {
            removeFile(inputPath);
            res(outputPath);
          })
          .on('error', (err) => rej(err.message))
          .run()
      })
    }
    catch (e) {
      console.log('Error in OggConverter.toMp3: ', e.message);
    }
  }

  mp3Loop(mp3Path, duration, loops, i = 0) {
    try {
      return new Promise((res, rej) => {
        
        if (i === loops) return res(loops); // End
        if (i > loops) return rej()

        // Calculate the start time and duration for the current part
        const startTime = i * 60; // in seconds

        // Define the output file name and path
        const outputFile = createFilename(mp3Path, i);

        // Create a new ffmpeg instance for the current part
        const command = ffmpeg(mp3Path)
          .setStartTime(startTime)
          .setDuration(duration)
          .toFormat('mp3')
          .on('error', (err) => {
            console.log('An error occurred: ' + err.message);
          })
          .on('end', () => {
            // console.log('Processed part ' + i);
            res(this.mp3Loop(mp3Path, duration, loops, i + 1))
          });

        // Run the command to split the audio file
        command.save(outputFile);
      });
    }
    catch (e) {
      console.log('Error in OggConverter.mp3Loop: ', e.message);
    }
  }

  async splitMp3(mp3Path, allDuration) {
    const duration = 60; // in seconds
    const loops = Math.ceil(allDuration / duration);

    return this.mp3Loop(mp3Path, duration, loops);
  }
}

export const ogg = new OggConverter();
