import Base from '@/lib/core';

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
class CommandQueue extends Base {
  /**
   * ## 构造函数
   *
   * @class
   * @param {object} options - 配置（依赖的执行上下文）对象
   */
  constructor(options) {
    super(options);

    /**
     * ## 命令队列（FIFO）
     *
     * @type {object[]}
     */
    this.queue = [];
  }

  /**
   * ## 入队一个 Command
   *
   * @param {object} command - 要执行的命令
   */
  enqueue(command) {
    this.queue.push(command);
  }

  /**
   * ## 执行并清空队列中的所有 Command
   *
   * 当前行为：
   *
   * - 一次性执行全部 command
   * - 不做时间分帧控制
   */
  flush() {
    const { queue } = this;

    while (queue.length > 0) {
      const cmd = queue.shift();
      cmd.execute();
    }
  }

  /** ## 清空队列（丢弃所有未执行命令） */
  clear() {
    this.queue.length = 0;
  }

  subscribe() {
    const uuid = this.Game.id;

    this.on(`command:queue:${uuid}:clear`, this._onClear);
    this.on(`command:queue:${uuid}:enqueue`, this._onEnqueue);
  }

  unsubscribe() {
    const uuid = this.Game.id;

    this.off(`command:queue:${uuid}:clear`, this._onClear);
    this.off(`command:queue:${uuid}:enqueue`, this._onEnqueue);
  }

  _onClear = () => {
    this.clear();
  };

  _onEnqueue = ({ cmd }) => {
    this.enqueue(cmd);
  };
}

export default CommandQueue;
