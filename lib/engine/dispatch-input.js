import Command from '@/lib/core/command/command.js';
import { CommandEvents, ReplayEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 输入分发器
 *
 * ============================================================
 *
 * 将原始输入（键盘、手柄、AI）统一转换为 Command 并推入执行管线， 是整个输入系统的入口和核心枢纽。
 *
 * ## 核心职责
 *
 * 1. 输入拦截：在动画阻塞期间禁止输入
 * 2. Command 构建：将原始输入包装为标准 Command 对象
 * 3. 入队执行：将 Command 推入命令队列
 * 4. Replay 录制：如果录制开启，将 Command 写入回放数据
 *
 * ## 数据流向
 *
 * 键盘/手柄/AI 输入 → Engine._subscribe → dispatch:input 事件 → dispatchInput() →
 * 拦截检查（动画阻塞？） → new Command(action, payload) → command:queue:<id>:enqueue（入队执行）
 * → replay:<id>:add:record（回放录制）
 *
 * ## 输入来源
 *
 * | device   | 说明        |
 * | :------- | :---------- |
 * | keyboard | 键盘输入    |
 * | gamepad  | 手柄输入    |
 * | ai       | AI 自动操作 |
 *
 * @function dispatchInput
 * @param {object} input - 输入信息
 * @param {object} input.payload - 输入负载（含 Game 实例引用）
 * @param {string} input.action - 动作名称
 * @param {object} context - 执行上下文对象
 * @param {boolean} context.isBlocked - 是否被动画阻塞
 * @param {number} context.ms - 回放时间偏移
 * @returns {void}
 */
const dispatchInput = (input, context) => {
  const { action, payload } = input;
  const { isBlocked, ms } = context;

  // 输入拦截：动画阻塞期间或空 action 时跳过
  if (isBlocked || !action) {
    return;
  }

  const { Game } = payload;
  const cmd = new Command(action, payload);
  const uuid = Game.id;
  const CE = CommandEvents(uuid);
  const RE = ReplayEvents(uuid);

  // 入队执行
  Game.emit(CE.ENQUEUE, { cmd });

  // 回放录制：将 Command 和时间戳写入回放数据
  Game.emit(RE.ADD_RECORD, { cmd, ms });
};

export default dispatchInput;
