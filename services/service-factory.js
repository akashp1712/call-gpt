const { ClaudeService } = require('./llm/claude-service');
// Import other LLM services here

const { ElevenLabsTTSService } = require('./tts/elevenlabs-tts-service');
// Import other TTS services here

class ServiceFactory {
  static createLLMService(type) {
    switch (type.toLowerCase()) {
      case 'claude':
        return new ClaudeService();
      // Add other LLM services here
      default:
        throw new Error(`Unknown LLM service type: ${type}`);
    }
  }

  static createTTSService(type) {
    switch (type.toLowerCase()) {
      case 'elevenlabs':
        return new ElevenLabsTTSService();
      // Add other TTS services here
      default:
        throw new Error(`Unknown TTS service type: ${type}`);
    }
  }
}

module.exports = { ServiceFactory };