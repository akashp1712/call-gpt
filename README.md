# Call GPT

A voice-based AI assistant that uses Twilio for telephony, with support for multiple LLM and TTS services. This project allows you to make and receive phone calls with an AI assistant powered by different language models and text-to-speech services.

## Features

- Make and receive phone calls using Twilio
- Process speech using Deepgram or ElevenLabs
- Generate responses using OpenAI or Claude
- Configurable to use different LLM and TTS services
- Modular architecture for easy extension with new services

## Architecture

The project uses a modular architecture with the following components:
- `twilio`: Handles the Twilio API calls
- `speech`: Handles speech processing using Deepgram or ElevenLabs
- `llm`: Handles LLM interactions using OpenAI or Claude
- `tts`: Handles TTS generation using Deepgram or ElevenLabs
- `call`: Handles the call flow, including speech processing, LLM interaction, and TTS generation
- `server`: Handles the server-side logic, including Twilio webhook handling and call processing  


## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Twilio account
- One of the following LLM API accounts:
  - OpenAI API account
  - Anthropic Claude API account
- One of the following TTS API accounts:
  - Deepgram API account
  - ElevenLabs API account

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/call-gpt.git
   cd call-gpt

2. Install dependencies:
   ```bash
   npm install
  
3. Create a `.env` file in the root directory and add your credentials:
   ```bash
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   LLM_SERVICE=openai
   TTS_SERVICE=deepgram
   OPENAI_API_KEY=your_openai_api_key
   CLAUDE_API_KEY=your_claude_api_key
   DEEPGRAM_API_KEY=your_deepgram_api_key
   DEEPGRAM_VOICE_ID=your_deepgram_voice_id
   XI_API_KEY=your_xi_api_key
   XI_VOICE_ID=your_xi_voice_id
   XI_MODEL_ID=your_xi_model_id
   XI_LANGUAGE_CODE=your_xi_language_code

4. Start the server:
   ```bash
   npm start
  
## Service Configuration
### LLM Services
The application supports multiple LLM (Large Language Model) services:

1. OpenAI : Uses OpenAI's GPT models for generating responses
   
   - Pros: Widely used, good performance for general tasks
   - Cons: Can be more expensive for high usage
2. Claude : Uses Anthropic's Claude models for generating responses
   
   - Pros: Good at following instructions, competitive pricing
   - Cons: May have different capabilities than GPT models
To configure which LLM service to use, set the LLM_SERVICE environment variable to either openai or claude .

### TTS Services
The application supports multiple TTS (Text-to-Speech) services:

1. Deepgram : Uses Deepgram's TTS service for converting text to speech
   
   - Pros: Good quality, competitive pricing
   - Cons: Limited voice options compared to specialized TTS services
2. ElevenLabs : Uses ElevenLabs' TTS service for converting text to speech
   
   - Pros: High-quality voices, more natural-sounding speech
   - Cons: May be more expensive for high usage
To configure which TTS service to use, set the TTS_SERVICE environment variable to either deepgram or elevenlabs .

## Developer Guide
### Project Structure
```plaintext
/
├── functions/             # Function calling implementations
│   ├── function-manifest.js  # List of available functions
│   └── [function-name].js    # Individual function implementations
├── services/              # Service implementations
│   ├── llm/               # Language Model services
│   │   ├── base-llm-service.js
│   │   ├── gpt-service.js
│   │   └── claude-service.js
│   ├── tts/               # Text-to-Speech services
│   │   ├── base-tts-service.js
│   │   ├── tts-service.js
│   │   └── elevenlabs-tts-service.js
│   └── service-factory.js # Factory for creating services
├── routes/                # Express routes
├── app.js                 # Main application file
├── server.js              # Server setup
├── .env                   # Environment variables (create from .env.example)
└── .env.example           # Example environment variables
 ```

 ### Adding a New LLM Service
1. Create a new file in the services/llm/ directory, e.g., new-llm-service.js
2. Extend the BaseLLMService class:
   
   ```javascript
   const { BaseLLMService } = require('./base-llm-service');
   
   class NewLLMService extends BaseLLMService {
     constructor() {
       super();
       // Initialize your service
     }
     
     setCallSid(callSid) {
       // Implement this method
     }
     
     async completion(text, interactionCount, role = 'user') {
       // Implement this method
       // Make sure to emit 'gptreply' event with the response
     }
     
     async generateSummary() {
       // Implement this method
     }
   }
   
   module.exports = { NewLLMService };
    ```

3. Update the service-factory.js file to include your new service:

  ```javascript
  const { NewLLMService } = require('./llm/new-llm-service');

  // In the createLLMService method:
  case 'new-llm':
    return new NewLLMService();
 ```
4. Update the .env.example file to include your new service's environment variables


### Adding a New TTS Service
1. Create a new file in the services/tts/ directory, e.g., new-tts-service.js
2. Extend the BaseTTSService class:
   
   ```javascript
   const { BaseTTSService } = require('./base-tts-service');
   
   class NewTTSService extends BaseTTSService {
     constructor() {
       super();
       // Initialize your service
     }
     
     async generate(gptReply, interactionCount) {
       // Implement this method
       // Make sure to emit 'speech' event with the audio data
     }
   }
   
   module.exports = { NewTTSService };
    ```
3. Update the service-factory.js file to include your new service:
   
   ```javascript
   const { NewTTSService } = require('./tts/new-tts-service');
   
   // In the createTTSService method:
   case 'new-tts':
     return new NewTTSService();
    ```
4. Update the .env.example file to include your new service's environment variables

### Event Flow
1. User speaks on the phone call
2. Speech is converted to text
3. Text is sent to the LLM service via completion() method
4. LLM service emits gptreply event with the response
5. TTS service listens for gptreply event and generates speech via generate() method
6. TTS service emits speech event with the audio data
7. Audio data is sent back to the phone call
## Troubleshooting
### Common Issues
1. API Key Issues
   
   - Error: "API key not set" or "Invalid API key"
   - Solution: Check that you've set the correct API key in your .env file
2. Service Selection Issues
   
   - Error: "Unknown LLM/TTS service type"
   - Solution: Check that you've set LLM_SERVICE and TTS_SERVICE to valid values
3. Twilio Connection Issues
   
   - Error: "Could not connect to Twilio"
   - Solution: Check your Twilio credentials and ensure your server is accessible from the internet
### Debugging
To enable debug logging, set the DEBUG environment variable:

## API Reference
### LLM Service API
The LLM service provides the following methods:

- setCallSid(callSid) : Sets the call SID for the current call
- updateUserContext(role, content) : Updates the user context with a new message
- completion(text, interactionCount, role) : Generates a completion for the given text
- generateSummary() : Generates a summary of the conversation
### TTS Service API
The TTS service provides the following methods:

- generate(gptReply, interactionCount) : Generates speech for the given GPT reply
## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
