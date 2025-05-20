# Call GPT System Architecture

This document describes the modular architecture of the Call GPT system, which allows for pluggable LLM (Language Model) and TTS (Text-to-Speech) services.

## Overview

Call GPT uses a modular architecture that separates different concerns into independent components:

1. **Twilio Integration**: Handles phone call setup and audio streaming
2. **Speech Processing**: Converts speech to text and text to speech
3. **Language Model Services**: Generates responses based on user input
4. **Service Factory**: Creates appropriate service instances based on configuration

This architecture allows you to easily switch between different LLM and TTS services without changing the core application logic.

## Component Diagram
```plaintext
┌─────────────────────────────────────────────────────────────┐
│                       Application                           │
└───────────────────────────┬─────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Factory                         │
└───────────┬─────────────────────────────────┬───────────────┘
│                                 │
▼                                 ▼
┌───────────────────────────┐     ┌───────────────────────────┐
│      LLM Services         │     │      TTS Services         │
├───────────────────────────┤     ├───────────────────────────┤
│                           │     │                           │
│  ┌─────────────────────┐  │     │  ┌─────────────────────┐  │
│  │  Base LLM Service   │  │     │  │  Base TTS Service   │  │
│  └─────────┬───────────┘  │     │  └─────────┬───────────┘  │
│            │              │     │            │              │
│  ┌─────────┴───────────┐  │     │  ┌─────────┴───────────┐  │
│  │                     │  │     │  │                     │  │
│  │  ┌───────────────┐  │  │     │  │  ┌───────────────┐  │  │
│  │  │  GPT Service  │  │  │     │  │  │  TTS Service  │  │  │
│  │  └───────────────┘  │  │     │  │  │  (Deepgram)   │  │  │
│  │                     │  │     │  │  └───────────────┘  │  │
│  │  ┌───────────────┐  │  │     │  │                     │  │
│  │  │Claude Service │  │  │     │  │  ┌───────────────┐  │  │
│  │  └───────────────┘  │  │     │  │  │  ElevenLabs   │  │  │
│  │                     │  │     │  │  │  TTS Service  │  │  │
│  └─────────────────────┘  │     │  │  └───────────────┘  │  │
│                           │     │  │                     │  │
└───────────────────────────┘     └───────────────────────────┘
```


## Directory Structure
```
/services
/llm                  # Language Model services
base-llm-service.js # Base class for all LLM services
gpt-service.js      # OpenAI GPT implementation
claude-service.js   # Anthropic Claude implementation
/tts                  # Text-to-Speech services
base-tts-service.js # Base class for all TTS services
tts-service.js      # Deepgram TTS implementation
elevenlabs-tts-service.js # ElevenLabs TTS implementation
service-factory.js    # Factory to create appropriate services

```

## Service Factory

The Service Factory is responsible for creating the appropriate service instances based on the configuration. It provides a clean interface for the application to get the services it needs without having to know the implementation details.

```javascript
const { ServiceFactory } = require('./services/service-factory');

// Create services based on environment variables
const llmService = ServiceFactory.createLLMService(process.env.LLM_SERVICE || 'openai');
const ttsService = ServiceFactory.createTTSService(process.env.TTS_SERVICE || 'deepgram');
 ```

## Base Services
### Base LLM Service
The Base LLM Service defines the interface that all LLM services must implement. It provides common functionality like managing user context and emitting events.

Key methods:

- setCallSid(callSid) : Sets the call SID for the current call
- updateUserContext(role, content) : Updates the user context with a new message
- completion(text, interactionCount, role) : Generates a completion for the given text
- generateSummary() : Generates a summary of the conversation
  
### Base TTS Service
The Base TTS Service defines the interface that all TTS services must implement. It provides common functionality like managing speech buffers and emitting events.

Key methods:
- generate(gptReply, interactionCount) : Generates speech for the given GPT reply

## Event Flow
The application uses an event-driven architecture to communicate between components:

1. User speaks on the phone call
2. Speech is converted to text
3. Text is sent to the LLM service via completion() method
4. LLM service emits gptreply event with the response
5. TTS service listens for gptreply event and generates speech via generate() method
6. TTS service emits speech event with the audio data
7. Audio data is sent back to the phone call

## Adding New Services
### Adding a New LLM Service
1. Create a new file in the services/llm/ directory, e.g., new-llm-service.js
2. Extend the BaseLLMService class
3. Implement the required methods
4. Update the service-factory.js file to include your new service
5. Update the .env.example file to include your new service's environment variables

### Adding a New TTS Service
1. Create a new file in the services/tts/ directory, e.g., new-tts-service.js
2. Extend the BaseTTSService class
3. Implement the required methods
4. Update the service-factory.js file to include your new service
5. Update the .env.example file to include your new service's environment variables

## Configuration
The application uses environment variables to configure which services to use:

- LLM_SERVICE : The LLM service to use (options: openai , claude )
- TTS_SERVICE : The TTS service to use (options: deepgram , elevenlabs )
Each service also has its own configuration options, which are documented in the main README.md file.

## Sequence Diagram
```plaintext
┌─────┐          ┌─────────┐          ┌───────────┐          ┌───────────┐
│User │          │Twilio   │          │LLM Service│          │TTS Service│
└──┬──┘          └────┬────┘          └─────┬─────┘          └─────┬─────┘
   │                  │                     │                      │
   │ Speak            │                     │                      │
   │─────────────────>│                     │                      │
   │                  │                     │                      │
   │                  │ Speech to Text      │                      │
   │                  │────────────────────>│                      │
   │                  │                     │                      │
   │                  │                     │ Generate Response    │
   │                  │                     │─────────────────────>│
   │                  │                     │                      │
   │                  │                     │                      │ Generate Speech
   │                  │<────────────────────┼──────────────────────│
   │                  │                     │                      │
   │ Hear Response    │                     │                      │
   │<─────────────────│                     │                      │
   │                  │                     │                      │
 ```

This sequence diagram shows the flow of a typical interaction with the Call GPT system.

## Conclusion
The modular architecture of Call GPT allows for easy extension and customization. By separating concerns into independent components and using a factory pattern to create service instances, the application can be configured to use different LLM and TTS services without changing the core logic.

This ARCHITECTURE.md file provides a detailed overview of the modular architecture of your Call GPT system. It includes diagrams, explanations of the components, and instructions for extending the system with new services. This complements your existing README.md file by focusing specifically on the architecture rather than the general usage and setup instructions.
