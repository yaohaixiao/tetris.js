import tick from '@/lib/game/logic/tick.js';

/**
 * ============================================================
 *
 * # 每帧刷新
 *
 * ============================================================
 *
 * 执行当前 Game 实例的一帧完整更新流程。 由 Engine.tick 遍历调用。
 *
 * ## 帧更新流程
 *
 * | 步骤 | 操作                     | 说明                                   |
 * | :--- | :----------------------- | :------------------------------------- |
 * | 1    | Animations.hasBlocking() | 检查是否有阻塞动画，影响输入和逻辑更新 |
 * | 2    | Replay.syncPlayElapsed() | 同步回放逻辑时钟，阻塞期间回放时钟暂停 |
 * | 3    | Replay.update()          | 更新回放系统，注入待重放的命令         |
 * | 4    | Gamepad.update()         | 更新手柄输入状态                       |
 * | 5    | Keyboard.update()        | 更新键盘输入状态                       |
 * | 6    | CommandQueue.flush()     | 执行命令队列中的所有待执行命令         |
 * | 7    | this.tick()              | 执行游戏逻辑（下落/碰撞/消行）         |
 * | 8    | Animations.flush()       | 合并/清理动画队列，移除已完成的动画    |
 * | 9    | UI.tickHud()             | 更新 HUD 动画（分数跳动、连击显示）    |
 * | 10   | UI.render()              | 渲染游戏画面                           |
 * | 11   | Animations.render()      | 叠加渲染动画特效                       |
 *
 * ## 固定时间步长
 *
 * 游戏逻辑（下落）不是每帧都执行， 而是根据当前等级的速度来控制执行频率：
 *
 * - 低等级时速度慢，下落间隔大（约 1000ms）
 * - 高等级时速度快，下落间隔小（最低 120ms）
 *
 * 每个 Game 实例使用独立的时间累积器， 双人对战时两个 Game 各自独立计算下落时机。
 *
 * ## Battle 模式事件隔离
 *
 * 每个 Game 的 CommandQueue 使用独立的 UUID 事件 scope，AI 的命令只会进入 AI Game 的
 * CommandQueue，Human 的命令只会进入 Human Game 的 CommandQueue。
 *
 * @function flush
 * @param {object} runtime - 游戏运行时对象
 * @param {number} timestamp - 当前时间戳（毫秒）
 * @param {number} lastTickTime - 上一帧的时间戳
 * @param {Map} gameAccumulators - 每个 Game 实例的时间累积器 Map
 * @returns {void}
 */
const flush = (runtime, timestamp, lastTickTime, gameAccumulators) => {
  const { UI, Replay, Gamepad, Keyboard, Animations, CommandQueue } = runtime;

  // 步骤 1：检查阻塞动画
  const isBlocked = Animations.hasBlocking();

  // 步骤 2：同步回放逻辑时钟
  Replay.syncPlayElapsed({
    timestamp: lastTickTime,
    isBlocked,
  });

  // 步骤 3：回放更新
  Replay.update({
    speed: runtime.getSpeed(),
    timestamp: lastTickTime,
  });

  // 步骤 4：手柄状态更新
  Gamepad?.update?.(timestamp);

  // 步骤 5：键盘状态更新
  Keyboard?.update?.();

  // 步骤 6：执行命令队列
  CommandQueue.flush();

  // 步骤 7：游戏逻辑更新（固定时间步长）
  const accumulator = gameAccumulators.get(runtime) || timestamp;
  const stepDelta = timestamp - accumulator;

  if ((!accumulator || stepDelta > runtime.getSpeed()) && !Replay.playing) {
    tick(runtime, isBlocked);
    gameAccumulators.set(runtime, timestamp);
  }

  // 步骤 8：合并/清理动画队列
  Animations.flush();

  // 步骤 9：更新 HUD 动画
  UI.tickHud();

  // 步骤 10：渲染游戏画面
  UI.render();

  // 步骤 11：叠加渲染动画特效
  Animations.render();
};

export default flush;
