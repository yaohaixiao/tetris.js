import Command from '@/lib/core/command/command.js';
import CommandQueue from '@/lib/core/command/command-queue.js';
import EventBus from '@/lib/core/event-bus';

/**
 * # 输入分发器（Input Dispatcher）
 *
 * 职责：
 *
 * - 接收输入 action
 * - 转换为 Command
 * - 入队执行
 * - 记录 replay（如开启）
 *
 * @function dispatchInput
 * @param {object} input - 输入信息
 * @param {string} input.action - 输入动作类型
 * @param {object} context - 执行上下文对象
 * @returns {void}
 */
const dispatchInput = (input, context) => {
  const { action, payload } = input;
  const { isBlocked, ms } = context;

  /**
   * ======== 输入拦截层 ======== 在关键动画期间禁止输入：
   *
   * - Countdown（倒计时）
   * - Level-up（升级动画）
   */
  if (isBlocked || !action) {
    return;
  }

  payload.isBlocked = isBlocked;

  /** ======== Command 构建 ======== */
  const cmd = new Command(action, payload);

  /** ======== 入队执行 ======== */
  CommandQueue.enqueue(cmd);

  /**
   * ======== Replay 记录层 ========
   *
   * 这里属于 side-effect，但暂时保留在 dispatcher
   */
  EventBus.emit('replay:add:record', {
    // 扣除暂停时间，得到纯净的“游玩时长”  - Replay.totalPausedDuration
    ms,
    cmd,
  });
};

export default dispatchInput;
