import Replay from '@/lib/engine/replay.js';
import CommandQueue from '@/lib/command/command-queue.js';
import Command from '@/lib/command/command.js';
import { hasBlockingAnimation } from '@/lib/animations/system.js';

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
 * @returns {void}
 */
const dispatchInput = (input) => {
  const { action } = input;

  /**
   * ======== 输入拦截层 ======== 在关键动画期间禁止输入：
   *
   * - Countdown（倒计时）
   * - Level-up（升级动画）
   */
  const isBlocked = hasBlockingAnimation(['countdown', 'level-up']);

  if (isBlocked || !action) {
    return;
  }

  /** ======== Command 构建 ======== */
  const cmd = new Command(action);

  /** ======== 入队执行 ======== */
  CommandQueue.enqueue(cmd);

  /** ======== Replay 记录层 ======== 这里属于 side-effect，但暂时保留在 dispatcher */
  if (Replay.recording) {
    Replay.data.push({
      frame: Replay.frame,
      cmd,
    });
  }
};

export default dispatchInput;
