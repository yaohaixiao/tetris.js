const CommandQueue = {
  queue: [],

  enqueue(command) {
    this.queue.push(command);
  },

  flush(engine) {
    const { queue } = this;

    while (queue.length > 0) {
      const cmd = queue.shift();
      cmd.execute(engine);
    }
  },

  clear() {
    this.queue.length = 0;
  },
};

export default CommandQueue;
