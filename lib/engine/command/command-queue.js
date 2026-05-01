/**
 * # 命令队列（Command Queue）
 *
 * 用于缓存所有待执行的 Command， 并在合适的时机（通常是 game tick / frame）统一执行。
 *
 * 典型用途：
 *
 * - Input buffering（输入缓存）
 * - Replay playback（回放）
 * - AI decision batching（AI 批处理）
 *
 * 设计特点：
 *
 * - FIFO 队列（先进先出）
 * - Flush() 会一次性执行所有命令
 */
const CommandQueue = {
  /**
   * ## 命令队列（FIFO）
   *
   * @type {object[]}
   */
  queue: [],

  /**
   * ## 入队一个 Command
   *
   * @param {object} command - 要执行的命令
   */
  enqueue(command) {
    this.queue.push(command);
  },

  /**
   * ## 执行并清空队列中的所有 Command
   *
   * 当前行为：
   *
   * - 一次性执行全部 command
   * - 不做时间分帧控制
   *
   * @param {object} engine - 游戏引擎实例
   */
  flush(engine) {
    const { queue } = this;

    while (queue.length > 0) {
      const cmd = queue.shift();
      cmd.execute(engine);
    }
  },

  /** ## 清空队列（丢弃所有未执行命令） */
  clear() {
    this.queue.length = 0;
  },
};

export default CommandQueue;
