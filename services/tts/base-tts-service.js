const EventEmitter = require('events');

class BaseTTSService extends EventEmitter {
  constructor() {
    super();
    this.nextExpectedIndex = 0;
    this.speechBuffer = {};
  }

  async generate(gptReply, interactionCount) {
    // To be implemented by child classes
    throw new Error('Method not implemented');
  }
}

module.exports = { BaseTTSService };