import tick from '@/lib/game/logic/tick.js';

/**
 * ## 每帧刷新（Flush）
 *
 * 执行当前 Game 实例的一帧完整更新流程。原本在 Engine.tick 中以内联方式处理每个 Game， 现在将这部分逻辑独立到 Game 模块中，由
 * Engine.tick 遍历调用。
 *
 * ### 为什么独立到 Game 模块？
 *
 * 1. **职责分离**：Engine 只负责调度循环，Game 负责自己的帧更新逻辑
 * 2. **可测试性**：可以单独对 Game.flush 进行单元测试，无需启动完整的 Engine
 * 3. **代码组织**：Game 相关的所有逻辑内聚在 Game 类中，更易维护
 *
 * ### 帧更新流程
 *
 * | 步骤 | 操作                       | 说明                                           |
 * | ---- | -------------------------- | ---------------------------------------------- |
 * | 1    | `Animations.hasBlocking()` | 检查是否有阻塞动画，影响输入和逻辑更新         |
 * | 2    | `Replay.syncPlayElapsed()` | 同步回放逻辑时钟，阻塞期间回放时钟暂停         |
 * | 3    | `Replay.update()`          | 更新回放系统，注入待重放的命令到 CommandQueue  |
 * | 4    | `Gamepad.update()`         | 更新手柄输入状态（可选链，设备不存在时跳过）   |
 * | 5    | `Keyboard.update()`        | 更新键盘输入状态（可选链，设备不存在时跳过）   |
 * | 6    | `CommandQueue.flush()`     | 执行命令队列中的所有待执行命令                 |
 * | 7    | `this.tick()`              | 执行游戏逻辑（下落/碰撞/消行），按速度间隔执行 |
 * | 8    | `Animations.flush()`       | 合并/清理动画队列，移除已完成的动画            |
 * | 9    | `UI.tickHud()`             | 更新 HUD 动画（分数跳动、连击显示）            |
 * | 10   | `UI.render()`              | 渲染游戏画面（棋盘、方块、ghost、网格背景）    |
 * | 11   | `Animations.render()`      | 叠加渲染动画特效（消行闪烁、升级烟花等）       |
 *
 * ### 调用方式
 *
 * 由 Engine.tick 遍历 Engine.Games 数组调用：
 *
 * ```js
 * for (const Game of Games) {
 *   Game.flush(timestamp, Engine.lastTickTime, Engine.gameAccumulators);
 * }
 * ```
 *
 * ### 固定时间步长
 *
 * 游戏逻辑（下落）不是每帧都执行，而是根据当前等级的速度 （`this.getSpeed()`）来控制执行频率：
 *
 * - 低等级时速度慢，下落间隔大（约 1000ms）
 * - 高等级时速度快，下落间隔小（最低 120ms）
 *
 * 每个 Game 实例使用独立的时间累积器（通过 gameAccumulators Map 传入）， 双人对战时两个 Game
 * 各自独立计算下落时机，互不影响。
 *
 * ### Battle 模式事件隔离
 *
 * 每个 Game 的 CommandQueue 使用独立的 UUID 事件 scope， AI 的命令只会进入 AI Game 的
 * CommandQueue， Human 的命令只会进入 Human Game 的 CommandQueue。 这确保了双人对战时命令不会串扰。
 *
 * @function flush
 * @param {object} runtime - 游戏运行时对象
 * @param {number} timestamp - RequestAnimationFrame 传入的当前时间戳（毫秒）
 * @param {number} lastTickTime - 上一帧的时间戳，用于回放时间计算
 * @param {Map} gameAccumulators - 每个 Game 实例的时间累积器 Map， Key 为 Game 实例，Value
 *   为上次逻辑更新的时间戳
 * @returns {void}
 */
const flush = (runtime, timestamp, lastTickTime, gameAccumulators) => {
  // 解构当前 Game 实例的所有子模块，用于后续步骤
  const { UI, Replay, Gamepad, Keyboard, Animations, CommandQueue } = runtime;

  /*
   * ==================== 步骤 1：检查阻塞动画 ====================
   *
   * 检查是否有阻塞动画正在播放。阻塞动画包括：
   * - clear-lines：消行动画播放中
   * - countdown：倒计时动画播放中
   * - level-up：升级特效播放中
   *
   * 阻塞期间：
   * - 回放时钟暂停（syncPlayElapsed 传入 isBlocked）
   * - 游戏逻辑可能跳过（tick 传入 isBlocked）
   * - 输入被忽略（在 dispatchInput 中检查）
   */
  const isBlocked = Animations.hasBlocking();

  /*
   * ==================== 步骤 2：同步回放逻辑时钟 ====================
   *
   * 根据当前时间戳和阻塞状态，同步回放系统的逻辑时钟。
   *
   * 回放时钟的作用：
   * - 记录游戏实际运行的时间（排除阻塞和暂停）
   * - 回放时按此时钟重新执行录制的输入
   *
   * 阻塞期间回放时钟暂停，确保回放时的时间轴与实际游戏体验一致。
   */
  Replay.syncPlayElapsed({
    timestamp: lastTickTime,
    isBlocked,
  });

  /*
   * ==================== 步骤 3：回放更新 ====================
   *
   * 更新回放系统。如果当前处于回放模式（Replay.playing === true），
   * 回放系统会根据录制的时间轴，将对应时间点的输入命令注入到 CommandQueue 中。
   *
   * speed 参数用于控制回放速度（倍速回放）。
   */
  Replay.update({
    speed: runtime.getSpeed(),
    timestamp: lastTickTime,
  });

  /*
   * ==================== 步骤 4：手柄状态更新 ====================
   *
   * 读取最新的手柄输入状态（按钮、摇杆、方向键）。
   * 使用可选链（?.）安全调用，设备不存在时跳过。
   *
   * 手柄输入会被转换为 game command 并进入 CommandQueue，
   * 在步骤 6 中统一执行。
   */
  Gamepad?.update?.(timestamp);

  /*
   * ==================== 步骤 5：键盘状态更新 ====================
   *
   * 读取最新的键盘输入状态。
   * 使用可选链（?.）安全调用，设备不存在时跳过。
   *
   * 键盘输入会被转换为 game command 并进入 CommandQueue，
   * 在步骤 6 中统一执行。
   */
  Keyboard?.update?.();

  /*
   * ==================== 步骤 6：执行命令队列 ====================
   *
   * 将本帧累积的所有 command（来自键盘、手柄、AI、回放）
   * 一次性执行，确保所有输入在同一帧内生效。
   *
   * ### 命令来源
   *
   * - 键盘输入：方向键移动、空格硬降、ESC 暂停等
   * - 手柄输入：ABXY 按钮、DPad 方向键、摇杆
   * - AI 输入：AIController.loop() 决策后发送的指令
   * - 回放输入：Replay.update() 注入的录制指令
   *
   * ### Battle 模式事件隔离
   *
   * 每个 Game 的 CommandQueue 使用独立的 UUID 事件 scope：
   * `command:queue:<uuid>:enqueue`
   *
   * 这确保：
   * - AI 的命令只会进入 AI Game 的 CommandQueue
   * - Human 的命令只会进入 Human Game 的 CommandQueue
   * - 双人对战时命令不会串扰
   */
  CommandQueue.flush();

  /*
   * ==================== 步骤 7：游戏逻辑更新 ====================
   *
   * 获取当前 Game 的时间累积器。累积器记录上次执行游戏逻辑的时间戳。
   * 通过比较当前时间与上次执行时间的差值，决定是否执行本次逻辑更新。
   *
   * ### 固定时间步长机制
   *
   * 游戏逻辑（重力下落、碰撞检测、锁定、消行）不是每帧都执行，
   * 而是根据当前等级的速度（this.getSpeed()）来控制执行频率。
   *
   * 仅当以下条件全部满足时才执行：
   * 1. 不在回放中（回放由 Replay.update 驱动，不走重力下落逻辑）
   * 2. 距离上次逻辑更新的时间 >= 当前等级的下落间隔
   *
   * 这实现了基于等级的下落速度控制：
   * - 等级 1：约 1000ms 执行一次 tick（每 16 帧左右）
   * - 等级 10：约 200ms 执行一次 tick（每 3-4 帧）
   * - 等级 20+：约 120ms 执行一次 tick（每 2 帧）
   */
  // 获取当前 Game 的时间累积器，首次运行时使用当前 timestamp
  const accumulator = gameAccumulators.get(runtime) || timestamp;
  // 计算距离上次逻辑更新的时间差
  const stepDelta = timestamp - accumulator;

  if ((!accumulator || stepDelta > runtime.getSpeed()) && !Replay.playing) {
    /*
     * 执行游戏逻辑：
     * - 重力下落：方块向下移动一格
     * - 碰撞检测：检查是否与已有方块或边界重叠
     * - 锁定：方块到达底部后锁定到棋盘
     * - 消行：检测完整行并消除
     * - 生成新方块：从 7-bag 中取出下一个方块
     *
     * isBlocked 参数传入 tick，阻塞动画期间可能跳过某些逻辑。
     */
    tick(runtime, isBlocked);

    // 更新累积器时间戳，记录本次逻辑更新的时间
    gameAccumulators.set(runtime, timestamp);
  }

  /*
   * ==================== 步骤 8：合并/清理动画队列 ====================
   *
   * AnimationSystem.flush() 执行以下操作：
   * - 移除已完成（disposed === true）的动画实例
   * - 合并同一 layer 的动画
   * - 清理过期引用
   *
   * 此操作在每帧执行，确保动画队列不会无限增长。
   */
  Animations.flush();

  /*
   * ==================== 步骤 9：更新 HUD 动画 ====================
   *
   * UI.tickHud() 更新 HUD 元素的动画状态：
   * - 分数跳动动画（得分时数字放大再缩回）
   * - 连击显示动画（Combo 文字渐隐）
   * - 计时器更新（游戏运行时间）
   *
   * HUD 动画独立于游戏逻辑，每帧都更新。
   */
  UI.tickHud();

  /*
   * ==================== 步骤 10：渲染游戏画面 ====================
   *
   * UI.render() 绘制游戏画面：
   * - 棋盘背景网格
   * - 已锁定的方块
   * - 当前活动方块
   * - Ghost piece（预览落点）
   * - 棋盘边框
   *
   * 渲染顺序从底层到顶层，确保正确的遮挡关系。
   */
  UI.render();

  /*
   * ==================== 步骤 11：叠加渲染动画特效 ====================
   *
   * Animations.render() 在游戏画面上叠加渲染所有活动动画：
   * - 消行闪烁（ClearLinesAnimation）
   * - 升级烟花（LevelUpAnimation）
   * - 垃圾行预警（GarbageWarningAnimation）
   * - 垃圾行闪烁（GarbagePushAnimation）
   * - 落地高亮（LandingFlashAnimation）
   * - 暂停呼吸灯（PausedAnimation）
   *
   * 动画按 layer 排序渲染，高 layer 的动画覆盖低 layer。
   */
  Animations.render();
};

export default flush;
