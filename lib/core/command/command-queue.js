import Base from '@/lib/core';

/**
 * # 命令队列（Command Queue）
 *
 * 用于缓存所有待执行的 Command，并在合适的时机统一执行。
 *
 * ## 典型用途
 *
 * - **Input buffering**（输入缓存）：缓存玩家快速输入的命令，逐帧执行
 * - **Replay playback**（回放）：回放系统将录制的命令入队，按时间顺序执行
 * - **AI decision batching**（AI 批处理）：AI 生成的动作序列入队后逐帧发送
 *
 * ## 设计特点
 *
 * - **FIFO 队列**（先进先出）：保证命令按入队顺序执行
 * - **Flush 一次性执行**：每帧将所有待执行命令一次性清空
 * - **事件驱动**：通过 EventBus 监听 `command:queue:<uuid>:enqueue` 等事件
 *
 * ## 生命周期
 *
 * | 事件                           | 说明                   |
 * | ------------------------------ | ---------------------- |
 * | `command:queue:<uuid>:enqueue` | 将命令加入队列         |
 * | `command:queue:<uuid>:clear`   | 清空队列（游戏重置时） |
 *
 * @class CommandQueue
 */
class CommandQueue extends Base {
  /**
   * ## 构造函数
   *
   * 初始化空队列。
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Game - 游戏主实例
   */
  constructor(options) {
    super(options);

    /**
     * ## 命令队列（FIFO）
     *
     * 存储待执行的 Command 实例。
     *
     * @type {object[]}
     */
    this.queue = [];
  }

  /**
   * ## 入队一个 Command
   *
   * 将命令添加到队列末尾，等待后续 flush 时执行。
   *
   * @param {object} command - 要入队的命令实例
   * @returns {void}
   */
  enqueue(command) {
    this.queue.push(command);
  }

  /**
   * ## 执行并清空队列中的所有 Command
   *
   * 按入队顺序（FIFO）逐个执行命令，执行完毕后队列为空。 当前实现为一次性执行全部命令，不做时间分帧控制。
   *
   * @returns {void}
   */
  flush() {
    const { queue } = this;

    // 循环取出队列头部命令并执行
    while (queue.length > 0) {
      const cmd = queue.shift();
      cmd.execute();
    }
  }

  /**
   * ## 清空队列
   *
   * 丢弃所有未执行的命令。通常在游戏重置或切换模式时调用。
   *
   * @returns {void}
   */
  clear() {
    this.queue.length = 0;
  }

  /**
   * ## 订阅命令队列事件
   *
   * 绑定 `command:queue:<uuid>:enqueue` 和 `command:queue:<uuid>:clear` 事件。
   *
   * @returns {void}
   */
  subscribe() {
    const uuid = this.Game.id;

    this.on(`command:queue:${uuid}:clear`, this._onClear);
    this.on(`command:queue:${uuid}:enqueue`, this._onEnqueue);
  }

  /**
   * ## 取消订阅命令队列事件
   *
   * @returns {void}
   */
  unsubscribe() {
    const uuid = this.Game.id;

    this.off(`command:queue:${uuid}:clear`, this._onClear);
    this.off(`command:queue:${uuid}:enqueue`, this._onEnqueue);
  }

  /**
   * ## 处理清空队列事件
   *
   * @private
   * @returns {void}
   */
  _onClear = () => {
    this.clear();
  };

  /**
   * ## 处理命令入队事件
   *
   * @private
   * @param {object} params - 事件参数
   * @param {object} params.cmd - 要入队的命令实例
   * @returns {void}
   */
  _onEnqueue = ({ cmd }) => {
    this.enqueue(cmd);
  };
}

export default CommandQueue;
