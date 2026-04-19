import dispatchCommand from '@/lib/command/dispatch-command.js';

class Command {
  constructor(type, payload = {}) {
    this.type = type;
    this.payload = payload;
  }

  execute(engine) {
    dispatchCommand(this, engine);
  }
}

export default Command;
