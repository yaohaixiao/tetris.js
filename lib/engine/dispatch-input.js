import Command from '@/lib/core/command/command.js';
import { CommandEvents, ReplayEvents } from '@/lib/events/event-catalog.js';

/**
 * # 输入分发器（Input Dispatcher）
 *
 * 将原始输入（键盘、手柄、AI）统一转换为 Command 并推入执行管线， 是整个输入系统的入口和核心枢纽。
 *
 * ## 核心职责
 *
 * 1. **输入拦截**：在动画阻塞期间（倒计时、升级动画等）禁止输入
 * 2. **Command 构建**：将原始输入信息包装为标准 Command 对象
 * 3. **入队执行**：将 Command 推入命令队列，等待后续 flush 执行
 * 4. **Replay 录制**：如果录制开启，将 Command 和时间戳写入回放数据
 *
 * ## 数据流向
 *
 *     键盘/手柄/AI 输入
 *       → Engine._subscribe → dispatch:input 事件
 *       → dispatchInput()
 *         → 拦截检查（动画阻塞？）
 *         → new Command(action, payload)
 *         → command:queue:<id>:enqueue（入队执行）
 *         → replay:<id>:add:record（回放录制）
 *
 * ## 输入来源
 *
 * | device   | 说明        |
 * | -------- | ----------- |
 * | keyboard | 键盘输入    |
 * | gamepad  | 手柄输入    |
 * | ai       | AI 自动操作 |
 *
 * @example
 *   // 键盘左箭头输入
 *   dispatchInput(
 *     { device: 'keyboard', action: 'MOVE_LEFT', payload: { Game } },
 *     { isBlocked: false, ms: 1200 },
 *   );
 *
 *   // AI 硬降输入
 *   dispatchInput(
 *     { device: 'ai', action: 'DROP', payload: { Game } },
 *     { isBlocked: false, ms: 3500 },
 *   );
 *
 * @function dispatchInput
 * @param {object} input - 输入信息
 * @param {object} context - 执行上下文对象
 * @returns {void}
 */
const dispatchInput = (input, context) => {
  const { action, payload } = input;
  const { isBlocked, ms } = context;

  /**
   * ======== 输入拦截层 ========
   *
   * 在以下关键动画期间禁止所有输入：
   *
   * - Countdown（倒计时动画）：防止玩家在倒计时结束前操作
   * - Level-up（升级动画）：防止升级特效期间误操作
   *
   * 同时过滤掉空的 action（未映射的按键等）
   */
  if (isBlocked || !action) {
    return;
  }

  /** ======== Command 构建 ======== */
  const { Game } = payload;
  // 将原始输入包装为标准 Command 对象
  const cmd = new Command(action, payload);
  const uuid = Game.id;
  const CE = CommandEvents(uuid);
  const RE = ReplayEvents(uuid);

  /** ======== 入队执行 ======== */
  // 将 Command 推入命令队列，等待后续的 flush 执行
  Game.emit(CE.ENQUEUE, { cmd });

  /**
   * ======== Replay 记录层 ========
   *
   * 如果回放录制已开启，将 Command 和时间戳写入回放数据。 ms 为扣除暂停时间后的纯游玩时长。
   *
   * 注意：这里属于 side-effect，但暂时保留在 dispatcher 中， 未来可考虑抽取为独立的 replay middleware。
   */
  Game.emit(RE.ADD_RECORD, {
    ms,
    cmd,
  });
};

export default dispatchInput;
