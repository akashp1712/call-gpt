const { Buffer } = require('node:buffer');
const fetch = require('node-fetch');
const { BaseTTSService } = require('./base-tts-service');

class ElevenLabsTTSService extends BaseTTSService {
  constructor() {
    super();
  }

  async generate(gptReply, interactionCount) {
    const { partialResponseIndex, partialResponse } = gptReply;

    if (!partialResponse) { return; }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${process.env.XI_VOICE_ID}/stream?output_format=ulaw_8000&optimize_streaming_latency=3`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': process.env.XI_API_KEY,
            'Content-Type': 'application/json',
            accept: 'audio/wav',
          },
          body: JSON.stringify({
            model_id: process.env.XI_MODEL_ID || 'eleven_monolingual_v1',
            text: partialResponse,
            language_code: process.env.XI_LANGUAGE_CODE || 'en'
          }),
        }
      );

      if (response.status === 200) {
        const audioArrayBuffer = await response.arrayBuffer();
        this.emit('speech', partialResponseIndex, Buffer.from(audioArrayBuffer).toString('base64'), partialResponse, interactionCount);
      } else {
        console.log('Eleven Labs Error:');
        console.log(response);
      }
    } catch (err) {
      console.error('Error occurred in ElevenLabs TTS service');
      console.error(err);
    }
  }
}

module.exports = { ElevenLabsTTSService };