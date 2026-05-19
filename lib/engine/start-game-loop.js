import Engine from '@/lib/engine';

/**
 * # 带速度控制的游戏主循环（Game Loop）
 *
 * 使用 `requestAnimationFrame` 驱动的核心渲染循环， 控制游戏的下落节奏、输入处理、渲染和动画更新。
 *
 * ## 帧循环流程
 *
 * 每一帧按以下顺序执行：
 *
 * | 步骤 | 操作                     | 说明                                         |
 * | ---- | ------------------------ | -------------------------------------------- |
 * | 1    | 防止死亡螺旋             | 限制 delta 上限为 1000ms，防止切后台回来卡死 |
 * | 2    | Scheduler.tick()         | 驱动调度器，执行到期的定时任务               |
 * | 3    | Replay.syncPlayElapsed() | 同步回放逻辑时钟                             |
 * | 4    | Replay.update()          | 更新回放系统，注入待重放的命令               |
 * | 5    | Gamepad.update()         | 更新手柄输入状态                             |
 * | 6    | CommandQueue.flush()     | 执行命令队列中的所有待执行命令               |
 * | 7    | Game.tick()              | 执行游戏逻辑（下落/碰撞/消行）               |
 * | 8    | Animations.update()      | 更新动画状态                                 |
 * | 9    | UI.tickHud()             | 更新 HUD 动画                                |
 * | 10   | UI.render()              | 渲染游戏界面                                 |
 * | 11   | Animations.render()      | 叠加渲染动画特效                             |
 * | 12   | requestAnimationFrame()  | 请求下一帧                                   |
 *
 * ## 固定时间步长
 *
 * 游戏逻辑（下落）不是每帧都执行，而是根据当前等级的速度 （`Game.getSpeed()`）来控制执行频率：
 *
 * - 低等级时速度慢，下落间隔大（约 1000ms）
 * - 高等级时速度快，下落间隔小（最低 120ms）
 *
 * 这确保了游戏难度与等级挂钩，同时避免了帧率波动对游戏速度的影响。
 *
 * ## 回放特殊处理
 *
 * 当 `Replay.playing` 为 true 时，跳过游戏逻辑 tick， 因为回放系统会通过注入 command 来驱动游戏状态。
 *
 * @function startGameLoop
 * @param {number} timestamp - RequestAnimationFrame 传入的当前时间戳（毫秒）
 * @returns {void}
 */
const startGameLoop = (timestamp) => {
  // 首次运行时初始化时间基准
  if (!Engine.lastTickTime) {
    Engine.lastTickTime = timestamp;
    Engine.fixedAccumulator = timestamp;
  }

  const { Game, Scheduler } = Engine;
  const { UI, Replay, Gamepad, Animations, CommandQueue } = Game;

  // 检查是否有阻塞动画（如消行动画、倒计时、升级特效）
  const isBlocked = Animations.hasBlocking();

  // 计算距离上次逻辑更新的时间差
  const stepDelta = timestamp - Engine.fixedAccumulator;

  // 计算帧间隔时间（秒）
  const prev = Engine.lastTickTime ?? timestamp;
  let delta = (timestamp - prev) / 1000;

  /**
   * ======== 步骤 1：防止“死亡螺旋” ========
   *
   * 当用户切换标签页再切回来时，requestAnimationFrame 会暂停， 导致 delta 累积到一个极大的值。限制 delta 上限为
   * 1000ms， 避免游戏在切回时瞬间执行大量逻辑导致卡死。
   */
  if (delta > 1000) {
    delta = 1000;
  }

  // 更新上一帧时间戳
  Engine.lastTickTime = timestamp;

  /**
   * ======== 步骤 2：驱动调度器 ========
   *
   * 执行所有到期的定时任务（delay、interval）。 这包括 AI 的决策循环、音效序列等。
   */
  Scheduler.tick(timestamp);

  /**
   * ======== 步骤 3：同步回放逻辑时钟 ========
   *
   * 给 playElapsed 加上 delta 上限， 保证切换标签页后回放能平滑加速追赶，不会瞬间跳过太多帧。
   */
  Replay.syncPlayElapsed({
    timestamp: Engine.lastTickTime,
    isBlocked,
  });

  /**
   * ======== 步骤 4：回放更新 ========
   *
   * 如果正在回放，Replay.update() 会根据回放时钟将到期的命令 注入到命令队列中。这是回放的核心驱动逻辑。
   */
  Replay.update({
    speed: Game.getSpeed(),
    timestamp: Engine.lastTickTime,
  });

  /**
   * ======== 步骤 5：手柄状态更新 ========
   *
   * 每帧读取手柄输入状态，将新的输入转换为 command 入队。
   */
  Gamepad.update(timestamp);

  /**
   * ======== 步骤 6：执行命令队列 ========
   *
   * 将本帧累积的所有 command（来自键盘、手柄、AI、回放） 一次性执行，确保所有输入在同一帧内生效。
   */
  CommandQueue.flush();

  /**
   * ======== 步骤 7：游戏逻辑更新 ========
   *
   * 仅当以下条件全部满足时才执行：
   *
   * - 不在回放中（回放由 Replay.update 驱动）
   * - 距离上次逻辑更新的时间 >= 当前等级的下落间隔
   *
   * 这实现了基于等级的下落速度控制。
   */
  if (
    (!Engine.fixedAccumulator || stepDelta > Game.getSpeed()) &&
    !Replay.playing
  ) {
    // 执行游戏逻辑：方块自动下落、碰撞检测、消行等
    Game.tick(isBlocked);

    // 更新逻辑时间基准
    Engine.fixedAccumulator = timestamp;
  }

  /**
   * ======== 步骤 8：更新动画状态 ========
   *
   * 更新所有注册的动画（消行特效、升级特效等）的状态。
   */
  Animations.update(delta);

  /**
   * ======== 步骤 9：更新 HUD 动画 ========
   *
   * 更新分数、等级等 HUD 显示的数字动画。
   */
  UI.tickHud(delta);

  /**
   * ======== 步骤 10：渲染游戏界面 ========
   *
   * 绘制棋盘、当前方块、预览方块等核心游戏画面。
   */
  UI.render();

  /**
   * ======== 步骤 11：叠加渲染动画特效 ========
   *
   * 在游戏界面上叠加渲染消行闪光、升级特效等动画层。
   */
  Animations.render();

  /**
   * ======== 步骤 12：请求下一帧 ========
   *
   * 递归调用自身，形成持续的帧循环。
   */
  Engine.rafId = requestAnimationFrame(startGameLoop);
};

export default startGameLoop;
