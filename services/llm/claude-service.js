const axios = require('axios');
const https = require('https');
const { BaseLLMService } = require('./base-llm-service');
const tools = require('../../functions/function-manifest');

// Import all functions included in function manifest
const availableFunctions = {};
tools.forEach((tool) => {
  let functionName = tool.function.name;
  availableFunctions[functionName] = require(`../../functions/${functionName}`);
});

class ClaudeService extends BaseLLMService {
  constructor() {
    super();
    this.apiUrl = 'https://api.anthropic.com/v1/messages';
    this.apiKey = process.env.CLAUDE_API_KEY;

    if (!this.apiKey) {
      console.error('CLAUDE_API_KEY environment variable is not set');
      throw new Error('CLAUDE_API_KEY environment variable is not set');
    }

    this.systemMessage = 'You are an outbound sales representative selling Apple Airpods. You have a youthful and cheery personality. Keep your responses as brief as possible but make every attempt to keep the caller on the phone without being rude. Don\'t ask more than 1 question at a time. Don\'t make assumptions about what values to plug into functions. Ask for clarification if a user request is ambiguous. Speak out all prices to include the currency. Please help them decide between the airpods, airpods pro and airpods max by asking questions like \'Do you prefer headphones that go in your ear or over the ear?\'. If they are trying to choose between the airpods and airpods pro try asking them if they need noise canceling. Once you know which model they would like ask them how many they would like to purchase and try to get them to place an order.  Keep your responses brief. Add a \'•\' symbol after each sentence , including short sentences within a longer response. This includes after period, question mark, exclamation point) to indicate natural pauses for text-to-speech conversion.';

    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
  }

  setCallSid(callSid) {
    this.systemMessage += ` callSid: ${callSid}`;
  }

  async completion(text, interactionCount, role = 'user') {
    this.updateUserContext(role, text);

    let messagesToSend = [...this.userContext];

    // Ensure the first message is always from the user
    if (messagesToSend[0].role !== 'user') {
      messagesToSend.unshift({ role: 'user', content: 'Hello, I\'m interested in buying jewelry.' });
    }

    // Ensure the last message is from the user
    if (messagesToSend[messagesToSend.length - 1].role !== 'user') {
      messagesToSend.push({ role: 'user', content: 'Please continue.' });
    }

    const requestData = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: messagesToSend,
      system: this.systemMessage
    };

    const headers = {
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    };

    try {
      const response = await axios.post(this.apiUrl, requestData, {
        headers,
        httpsAgent: this.httpsAgent
      });

      const content = response.data.content[0].text;

      console.log('Generated content:', content);

      this.updateUserContext('assistant', content);

      const claudeReply = {
        partialResponseIndex: this.partialResponseIndex,
        partialResponse: content
      };

      this.emit('gptreply', claudeReply, interactionCount);

      console.log(`Claude -> user context length: ${this.userContext.length}`);
    } catch (error) {
      console.error('Error calling Claude API:', error.message);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  }

  async generateSummary() {
    const summaryPrompt = `Based on the conversation history, please provide:
    1. A brief summary of the call (2-3 sentences)
    2. Overall sentiment of the customer (positive, neutral, or negative)
    3. 2-3 action items or next steps

    Use the following JSON format:
    { sentiment: "", summary: "", action_items: [] }
    `;

    const requestData = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [...this.userContext, { role: 'user', content: summaryPrompt }],
      system: this.systemMessage
    };

    const headers = {
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    };

    try {
      const response = await axios.post(this.apiUrl, requestData, {
        headers,
        httpsAgent: this.httpsAgent
      });

      console.log('Summary API Response:', JSON.stringify(response.data, null, 2));

      const summary = response.data.content[0].text;
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error.message);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      return 'Error generating summary';
    }
  }
}

module.exports = { ClaudeService };