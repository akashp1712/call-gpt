const EventEmitter = require('events');

class BaseLLMService extends EventEmitter {
  constructor() {
    super();
    this.userContext = [];
    this.partialResponseIndex = 0;
  }

  setCallSid(callSid) {
    // To be implemented by child classes
  }

  updateUserContext(role, content) {
    this.userContext.push({ role, content });
  }

  async completion(text, interactionCount, role = 'user') {
    // To be implemented by child classes
    throw new Error('Method not implemented');
  }

  async generateSummary() {
    // To be implemented by child classes
    throw new Error('Method not implemented');
  }
}

module.exports = { BaseLLMService };