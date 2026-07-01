# Runtime

简体中文 | [English](./03-runtime.md)

> Runtime 并不是一个模块，而是整个游戏运行期间所有系统协同工作的核心。

## 什么是 Runtime？

很多开发者第一次接触游戏开发时，都会直接开始编写（我也是一样）游戏逻辑。例如：

- 监听键盘
- 更新棋盘
- 绘制 Canvas
- 播放音效

随着功能不断增加。代码也会越来越多。最终，一个游戏通常会包含：

- 输入
- 游戏逻辑
- 渲染
- 音效
- 动画
- Replay
- AI
- Battle

如果这些模块彼此直接调用，整个项目很快就会变得难以维护。因此，需要有一个统一的组织者，这个组织者，就是 Runtime。

<p align="center">
    <img src="assets/img/runtime.png" alt="Runtime">
</p>

它并不是负责某一个具体功能，而是负责让所有系统能够按照统一的规则协同工作。

## Runtime 的职责

Runtime 并不会决定俄罗斯方块怎么玩、它也不会负责绘制画面、更不会参与 AI 搜索。它真正负责的是：

- 管理游戏生命周期
- 驱动 Game Loop
- 分发 Command
- 更新游戏状态
- 调度各个系统
- 保证所有模块共享同一套时间轴

![Runtime Architecture Diagram](assets/img/runtime-diagram.png)

换句话说，Runtime 更像整个游戏的大脑。其它系统只需要完成自己的职责，而不用关心整个游戏如何组织运行。

## 一个游戏为什么需要 Runtime？

假设一个最简单的俄罗斯方块。整个流程可能只有：

```text
setInterval()
↓
更新棋盘
↓
Canvas 重绘
```

当项目很小时，这样的实现已经足够。但是，随着：

- AI
- Replay
- Battle
- Scheduler
- Audio
- Animation

更多功能模块的不断加入，游戏已经不再只有更新棋盘，它开始拥有越来越多需要协同工作的系统。如果没有 Runtime，这些模块最终都会互相依赖，而 Runtime 的出现，就是为了让它们彼此解耦。

## Runtime 如何组织整个游戏？

Runtime 可以理解成整个游戏的调度中心。游戏启动以后，所有模块都会围绕 Runtime 工作。整个执行流程可以简化为：

```text
Input
↓
Command
↓
Runtime
↓
Gameplay
↓
Store
↓
Renderer
↓
Audio
↓
Animation
```

对于 Runtime 来说，Command 来自哪里并不重要。可能来自：

- Keyboard
- Gamepad
- Touch
- Replay
- AI
- Battle

Runtime 唯一关心的是：**执行 Command**。因此，整个游戏始终只有一套执行流程。

## Game Loop

Runtime 的核心是 **Game Loop**，Game
Loop 是整个游戏不断运行的心跳。每一次循环 Runtime 都会完成：

1. 处理输入
2. 执行 Command
3. 更新游戏状态
4. 推进游戏时间
5. 调度 Scheduler
6. 更新动画
7. 更新音频
8. 渲染画面

<p align="center">
    <img src="assets/img/game-loop.png" alt="Runtime">
</p>

整个游戏始终围绕这一循环不断运行，Game
Loop 并不关心具体模块如何实现，它只负责组织执行顺序。

### tetris.js 的 Game Loop 实现

```js
const Engine = {
  /**
   * # 带速度控制的游戏主循环（Game Loop）
   *
   * 使用 `requestAnimationFrame` 驱动的核心渲染循环，控制游戏的下落节奏、输入处理、渲染和动画更新。
   *
   * ## 帧循环流程（每个 Game 实例）
   *
   * | 步骤 | 操作                       | 说明                                           |
   * | ---- | -------------------------- | ---------------------------------------------- |
   * | 1    | `Scheduler.tick()`         | 驱动调度器，执行到期的定时任务（含 AI loop）   |
   * | 2    | `Replay.syncPlayElapsed()` | 同步回放逻辑时钟                               |
   * | 3    | `Replay.update()`          | 更新回放系统，注入待重放的命令                 |
   * | 4    | `Gamepad.update()`         | 更新手柄输入状态                               |
   * | 5    | `Keyboard.update()`        | 更新键盘输入状态                               |
   * | 6    | `CommandQueue.flush()`     | 执行命令队列中的所有待执行命令                 |
   * | 7    | `Game.tick()`              | 执行游戏逻辑（下落/碰撞/消行），按速度间隔执行 |
   * | 8    | `Animations.flush()`       | 合并/清理动画队列，移除已完成的动画            |
   * | 9    | `UI.tickHud()`             | 更新 HUD 动画（分数跳动、连击显示）            |
   * | 10   | `UI.render()`              | 渲染游戏画面（棋盘、方块、ghost、网格）        |
   * | 11   | `Animations.render()`      | 叠加渲染动画特效（消行、升级、垃圾行预警等）   |
   * | 12   | `requestAnimationFrame()`  | 请求下一帧，形成循环                           |
   *
   * ## 固定时间步长
   *
   * 游戏逻辑（下落）不是每帧都执行，而是根据当前等级的速度 （`Game.getSpeed()`）来控制执行频率：
   *
   * - 低等级时速度慢，下落间隔大（约 1000ms）
   * - 高等级时速度快，下落间隔小（最低 120ms）
   *
   * ## 双人对战
   *
   * 每个 Game 使用独立的时间累积器（gameAccumulators Map）， 两个 Game 各自独立计算下落时机，互不影响。 P1 可能等级
   * 5（快），P2 可能等级 2（慢），各自按自己的节奏下落。
   *
   * @param {number} timestamp - RequestAnimationFrame 传入的当前时间戳（毫秒）
   * @returns {void}
   */
  tick: (timestamp) => {
    const { Games, Scheduler } = Engine;

    // 首次运行时初始化时间基准，为每个 Game 实例设置初始累积器时间戳
    if (!Engine.lastTickTime) {
      Engine.lastTickTime = timestamp;

      for (const Game of Games) {
        Engine.gameAccumulators.set(Game, timestamp);
      }
    }

    // 更新上一帧时间戳，供后续计算 delta time
    Engine.lastTickTime = timestamp;

    /*
     * ==================== 步骤 1：驱动调度器 ====================
     *
     * 执行所有到期的定时任务（delay、interval、sequence）。
     * 这包括：
     * - AI 的决策循环（AIController.loop）
     * - 音效序列
     * - 动画时序（如垃圾行预警的闪烁定时器）
     *
     * AI 的 loop 在此处被 Scheduler 触发，而非在 Game.tick 中。
     */
    Scheduler.tick(timestamp);

    /* ==================== 步骤 2-11：每个 Game 实例的帧更新 ==================== */
    for (const Game of Games) {
      Game.flush(timestamp, Engine.lastTickTime, Engine.gameAccumulators);
    }

    // 更新全局逻辑时间基准
    Engine.fixedAccumulator = timestamp;

    // 步骤 12：请求下一帧，形成游戏循环
    Engine.rafId = requestAnimationFrame(Engine.tick);
  },
};
```

可以用看到 tetris.js 的 Game Loop 非常干净，就是使用 `requestAnimationFrame`
驱动的核心渲染循环。真正做到了不关心具体模块如何实现，它只负责组织执行顺序：

- Scheduler：负责定时任务的执行；
- Game.flush：每个 Game 实例的帧更新；

### flush：Runtime 的核心

```js
import tick from '@/lib/game/logic/tick.js';

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
```

可以看到 flush 是 Game
Loop 的核心逻辑，执行当前 Game 实例的一帧完整更新所有流程。

## Command Dispatch

Runtime 中所有操作，最终都会转换成 Command。例如：

- Move Left
- Move Right
- Rotate
- Hard Drop
- Hold
- Pause

以用户按键操作为例，当用户按下某个按钮时，Keyboard Controller 监听 `keydown`
事件：

```js
_onKeydown = (e) => {
  const { Game, Store, Player } = this;
  // 获取按键标识并转为小写
  const key = e.key?.toLowerCase();

  // 键盘禁用或无按键时跳过
  if (!key || this.disabled) {
    return this;
  }

  // 解析按键对应的动作
  const action = resolveKeyboardAction(key);

  // 按键被屏蔽时跳过
  if (this._isBlocked(key) || !action) {
    return this;
  }

  /** 对战模式，AI 玩家在 playing 时跳过。 注意：这里重复检查了 AI 玩家条件， 与 _isBlocked 中的检查形成双重保护。 */
  if (Store.getMode() === 'playing' && Player.name === 'ai') {
    return this;
  }

  /**
   * 左右方向键：启动 DAS/ARR 自动重复移动。
   *
   * 按下左/右键时：
   *
   * - 设置移动方向
   * - 重置 DAS/ARR 计时器
   * - 标记为键盘触发
   *
   * 第一帧的移动在下方立即执行。
   */
  if (key === 'arrowleft') {
    this.dasState.direction = -1; // 向左
    this.dasState.dasTimer = 0; // 开始 DAS 计时
    this.dasState.arrTimer = 0; // 重置 ARR 计时
    this.dasState.active = true; // 标记为键盘触发
  } else if (key === 'arrowright') {
    this.dasState.direction = 1; // 向右
    this.dasState.dasTimer = 0; // 开始 DAS 计时
    this.dasState.arrTimer = 0; // 重置 ARR 计时
    this.dasState.active = true; // 标记为键盘触发
  }

  const events = GameEvents(Game.id);

  /** 立即执行第一次移动。 无论是否是方向键，第一次按键立即响应，不需要等待 DAS 延迟。 */
  this.emit(events.DISPATCH_INPUT, {
    device: 'keyboard',
    action,
    payload: { Game },
  });

  return this;
};
```

通过 `resolveKeyboardAction` 方法将用户的按键和游戏指令进行匹配：

```js
const resolveKeyboardAction = (key, mode) => {
  // 空键值直接返回，避免无效处理
  if (!key) {
    return;
  }

  // 统一转换为小写，实现大小写不敏感的匹配
  const normalizedKey = key.toLowerCase();

  /**
   * 根据游戏模式动态调整方向键上的行为：
   *
   * - 选择界面（game-mode / battle-mode / exit-game）：↑ 用于移动光标
   * - 游戏中（playing）：↑ 用于旋转方块
   *
   * 其他模式下保持默认映射（ROTATE）。
   */
  if (mode === 'game-mode' || mode === 'battle-mode' || mode === 'exit-game') {
    KEYBOARDS_ACTION_MAP.arrowup = 'MOVE_UP';
  } else if (mode === 'playing') {
    KEYBOARDS_ACTION_MAP.arrowup = 'ROTATE';
  }

  // 从映射表中查找对应的动作指令
  return KEYBOARDS_ACTION_MAP[normalizedKey];
};
```

这里的关键是用过 `KEYBOARDS_ACTION_MAP` 映射按键的指令：

```js
const KEYBOARDS_ACTION_MAP = {
  // 强制退出/返回
  escape: 'EXIT',

  // ========== 方块操作 ==========
  arrowleft: 'MOVE_LEFT', // 向左移动方块
  arrowright: 'MOVE_RIGHT', // 向右移动方块
  arrowdown: 'MOVE_DOWN', // 向下加速移动（软降）
  arrowup: 'ROTATE', // 旋转方块（或在菜单中向上移动光标）
  ' ': 'DROP', // 空格键：方块直接落底（硬降）

  // ========== 游戏控制 ==========
  s: 'SWITCH_CONTROLLER', // 切换控制器（玩家 ↔ AI）
  m: 'TOGGLE_MUSIC', // 切换音乐开关
  p: 'TOGGLE_PAUSED', // 暂停/继续游戏
  r: 'RESTART', // 重新开始游戏
  q: 'QUIT', // 退出游戏

  // ========== 缓存方块 ==========
  c: 'HOLD', // 将当前方块存入 Hold 区

  // ========== 关卡选择 ==========
  1: 'LEVEL_ONE', // 第 1 关
  2: 'LEVEL_TWO', // 第 2 关
  3: 'LEVEL_THREE', // 第 3 关
  4: 'LEVEL_FOUR', // 第 4 关
  5: 'LEVEL_FIVE', // 第 5 关
  6: 'LEVEL_SIX', // 第 6 关
  7: 'LEVEL_SEVEN', // 第 7 关
  8: 'LEVEL_EIGHT', // 第 8 关
  9: 'LEVEL_NINE', // 第 9 关
  t: 'LEVEL_TEN', // T 键：第 10 关

  // ========== 难度选择 ==========
  e: 'EASY', // 简单难度
  n: 'NORMAL', // 普通难度
  h: 'HARD', // 困难难度
  x: 'EXPERT', // 专家难度

  // ========== 界面导航 ==========
  b: 'BACK', // 返回上一级
  enter: 'CONFIRM', // 确认操作
};
```

而生成指令 Command 则是监听 `events.DISPATCH_INPUT` 的处理函数来处理的：

```js
const Engine = {
  // 省略其他逻辑...
  _onDispatchInput: (input) => {
    const { payload } = input;
    const { Game } = payload;
    const { Animations, Replay } = Game;

    // 检查是否有阻塞动画（消行、倒计时、升级），输入被忽略
    const isBlocked = Animations.hasBlocking([
      'clear-lines',
      'countdown',
      'level-up',
    ]);

    // 计算回放时间偏移：当前时间 - 回放开始时间
    const ms = Engine.lastTickTime - Replay.startTime;

    // 将输入事件分派到对应的输入处理器
    dispatchInput(input, {
      isBlocked,
      ms,
    });
  },
};
```

最终将指令生成 Command 的就是 `dispatchInput`：

```js
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
```

这些 Command 并没有来源的概念。它们可能来自：

- 玩家
- Replay
- AI

### Replay 生成的指令

Replay 会在方块自由下落的时候，生成 `AUTO_TICK` 的指令：

```js
const tick = (runtime, isBlocked) => {
  const mode = runtime.Store.getMode();

  /**
   * ======== 步骤 1：模式检查 ========
   *
   * 非进行中/回放模式，或动画阻塞期间不执行下落。
   */
  if ((mode !== 'playing' && mode !== 'replay') || isBlocked) {
    return;
  }

  const AE = AudioEvents();
  const GE = GameEvents(runtime.id);

  /**
   * ======== 步骤 2：回放录制 ========
   *
   * Playing 模式下将自动下落也记录到回放系统。
   */
  if (mode === 'playing') {
    runtime.emit(GE.DISPATCH_INPUT, {
      device: 'replay',
      action: 'AUTO_TICK',
      payload: { Game: runtime },
    });
  }
  // 省略其他逻辑...
};
```

### AI 生成质量

AI 在进行棋盘决策演算后，也会生成游戏指令：

```js
loop = () => {
  if (!this.enabled) {
    return;
  }

  const { Game, Animations, Scheduler } = this;
  const state = Game.Store.getState();

  /*
   * ==================== 状态检查 ====================
   *
   * 游戏中断（非 playing 模式）或动画阻塞时，100ms 后重试。
   * 阻塞动画包括：消行动画、倒计时动画、升级动画等。
   * 这些动画期间方块无法操作，AI 应等待动画结束。
   */
  if (state.mode !== 'playing' || Animations.hasBlocking()) {
    this.aiSchedulerId = Scheduler.delay(this.loop, 100);
    return;
  }

  const difficulty = this.getDifficultyConfig();

  /*
   * ==================== 决策阶段 ====================
   *
   * 当动作队列为空（上一轮动作已全部执行完毕）且 Worker 空闲时，
   * 发起新一轮 AI 决策。
   *
   * think() 返回最佳移动对象 { x, y, placeOn, actions }，
   * 将 actions 数组浅拷贝到 this.actions 队列中。
   *
   * 当前使用主线程同步模式：think() 直接返回结果。
   * Worker 模式下（!this.worker 为 false），
   * think() 返回 undefined，结果由 _onWorkerMessage 异步填充。
   */
  if (this.actions.length === 0 && !this.workerBusy) {
    const best = this.think(state, difficulty);

    if (!this.worker) {
      this.actions = best ? [...best.actions] : [];
    }
  }

  /*
   * ==================== 动作执行阶段 ====================
   *
   * 从队列头部取出一个动作执行。
   * 每帧只执行一个动作，保证动作序列按顺序逐帧执行。
   *
   * 如果队列为空但 Worker 正在计算中，继续等待（Worker 模式）。
   * 如果队列为空且没有在计算，说明本轮决策未产生动作，直接返回。
   */
  const action = this.actions.shift();

  // 没有动作但 Worker 正在计算中，继续等待
  if (!action && this.workerBusy) {
    this.aiSchedulerId = Scheduler.delay(this.loop, difficulty.delay);
    return;
  }

  if (!action) {
    return;
  }

  /*
   * ==================== 发送动作 ====================
   *
   * 通过 Game ID 隔离的 dispatch:input 事件发送动作。
   *
   * 事件名格式：game:<uuid>:dispatch:input
   * Engine._subscribe() 中为每个 Game 实例单独订阅了此事件，
   * 确保 Battle 模式下 human Game 不会收到 AI 的输入。
   *
   * 事件流：
   *   emit(DISPATCH_INPUT)
   *   → Engine._onDispatchInput
   *   → dispatchInput()
   *   → CommandQueue.enqueue()
   *   → CommandQueue.flush()
   *   → cmd.execute()
   *   → dispatchCommand()
   *   → action handler（如 GAME_PLAYING_ACTIONS.DROP）
   */
  const events = GameEvents(Game.id);

  this.emit(events.DISPATCH_INPUT, {
    device: 'ai',
    action,
    payload: { Game },
  });

  /*
   * ==================== 调度下一次循环 ====================
   *
   * 延迟时间使用难度配置的 delay：
   * - Easy: 480ms
   * - Normal: 380ms
   * - Hard: 200ms
   * - Expert: 130ms
   *
   * 注意：loop() 每 200ms（Hard）触发一次，但每帧只执行一个动作。
   * 这意味着 AI 可以在 200ms 内执行约 12 帧 ≈ 12 个动作（如果动作序列够长）。
   * 实际上动作序列通常 4-8 个动作，在下次 loop 触发前就能执行完毕。
   */
  this.aiSchedulerId = Scheduler.delay(this.loop, difficulty.delay);
};
```

Runtime 则通过 Command Queue 负责按照统一规则依次执行它们：

```js
class CommandQueue extends Base {
  // 省略其他逻辑...
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
}
```

再看看 Command 的执行逻辑：

```js
class Command extends Base {
  // 省略其他逻辑...
  /**
   * ## 执行命令
   *
   * 将命令通过 `dispatch:command` 事件交给统一的 dispatch 系统处理。 Command
   * 本身不执行业务逻辑，只负责通知调度系统"有一个操作需要执行"。
   *
   * ### 执行流程
   *
   * 1. Command 通过 EventBus 发送 `dispatch:command` 事件
   * 2. Engine 层监听该事件，调用 `dispatchCommand` 函数
   * 3. `dispatchCommand` 根据当前游戏模式（mode）路由到对应的 action handler
   * 4. Action handler 执行业务逻辑（如移动方块、暂停游戏等）
   *
   * @example
   *   const cmd = new Command('ROTATE', { Game: game });
   *   cmd.execute(); // 触发一次旋转操作
   *
   * @returns {void}
   */
  execute() {
    const { action, payload } = this;
    const { Game } = payload;
    const events = GameEvents(Game.id);

    /*
     * 通过 EventBus 发送 dispatch:command 事件：
     *
     * Engine._subscribe() 中监听此事件并调用 dispatchCommand 处理
     */
    this.emit(events.DISPATCH_COMMAND, {
      action,
      payload,
    });
  }
}
```

最后由 `` 来映射指令和并触发实际处理逻辑：

```js
import GAME_MODE_ACTIONS from '@/lib/game/actions/game-mode-actions.js';
import BATTLE_MODE_ACTIONS from '@/lib/game/actions/battle-mode-actions.js';
import MAIN_MENU_ACTIONS from '@/lib/game/actions/main-menu-actions.js';
import DIFFICULT_ACTIONS from '@/lib/game/actions/difficulty-actions.js';
import GAME_PLAYING_ACTIONS from '@/lib/game/actions/game-playing-actions.js';
import PAUSED_ACTIONS from '@/lib/game/actions/paused-actions.js';
import GAME_OVER_ACTIONS from '@/lib/game/actions/game-over-actions.js';
import REPLAY_ACTIONS from '@/lib/game/actions/replay-actions.js';
import BATTLE_OVER_ACTIONS from '@/lib/game/actions/battle-over-actions.js';
import EXIT_GAME_ACTIONS from '@/lib/game/actions/exit-game-actions.js';

/**
 * # 状态 → Action 映射表
 *
 * 将游戏的每种模式（mode）映射到对应的 action handler 集合。 这是**状态机路由**的核心：根据当前游戏状态决定哪些操作是合法的。
 *
 * ## 设计模式
 *
 * - **State Machine Router**：mode 决定合法操作集
 * - **Command Dispatcher**：action 名称决定具体执行哪个 handler
 *
 * ## 模式与 Action 集合对应关系
 *
 * | mode          | Action 集合          | 说明                              |
 * | ------------- | -------------------- | --------------------------------- |
 * | `game-mode`   | GAME_MODE_ACTIONS    | 游戏模式选择：单人/对战           |
 * | `battle-mode` | BATTLE_MODE_ACTIONS  | 对战类型选择：VS AI / VS HUMAN    |
 * | `main-menu`   | MAIN_MENU_ACTIONS    | 主菜单：等级选择                  |
 * | `difficulty`  | DIFFICULT_ACTIONS    | 难度选择：easy/normal/hard/expert |
 * | `playing`     | GAME_PLAYING_ACTIONS | 游戏中：移动、旋转、硬降等        |
 * | `paused`      | PAUSED_ACTIONS       | 暂停中：继续、重新开始、退出      |
 * | `exit-game`   | EXIT_GAME_ACTIONS    | 退出菜单：继续游戏、退出游戏      |
 * | `game-over`   | GAME_OVER_ACTIONS    | 游戏结束：重新开始、退出          |
 * | `replay`      | REPLAY_ACTIONS       | 回放中：观看、确认退出            |
 * | `battle-over` | BATTLE_OVER_ACTIONS  | 对战结束：对战重新开始            |
 *
 * ### exit-game 模式
 *
 * Single 模式下按 ESC 键触发，显示退出菜单覆盖层：
 *
 * - RESUME GAME：关闭菜单，恢复 playing 模式
 * - EXIT GAME：退出到游戏模式选择界面（game-mode）
 *
 * Battle 模式下 ESC 键触发的是认输（surrender），不走此模式。
 *
 * @constant {object} ACTIONS_MAP
 */
const ACTIONS_MAP = {
  'game-mode': GAME_MODE_ACTIONS,
  'battle-mode': BATTLE_MODE_ACTIONS,
  'main-menu': MAIN_MENU_ACTIONS,
  difficulty: DIFFICULT_ACTIONS,
  playing: GAME_PLAYING_ACTIONS,
  paused: PAUSED_ACTIONS,
  replay: REPLAY_ACTIONS,
  'game-over': GAME_OVER_ACTIONS,
  'battle-over': BATTLE_OVER_ACTIONS,
  'exit-game': EXIT_GAME_ACTIONS,
};

/**
 * # Command 分发器（Dispatch Command）
 *
 * 将 Command 根据当前游戏状态（mode）路由到对应的 action handler 执行。
 *
 * ## 核心职责
 *
 * - **不执行业务逻辑**：dispatchCommand 自身不包含任何游戏操作逻辑
 * - **只负责路由 + 分发**：根据 mode 找到对应的 action 集合，再根据 action 名称找到 handler
 * - **状态隔离**：不同 mode 下同名 action 可以有不同的行为（如 main-menu 和 playing 下的方向键）
 *
 * ## 执行流程
 *
 * 1. 从 Command 中提取 `action` 和 `payload`
 * 2. 根据 `mode` 查找对应的 action handler 集合
 * 3. 如果当前 mode 没有定义 actions，忽略该命令
 * 4. 根据 `action` 名称找到对应的 handler
 * 5. 如果 handler 存在，调用并传入 `payload`
 *
 * ### 示例：exit-game 模式下的路由
 *
 *     dispatchCommand(cmd, { mode: 'exit-game' })
 *       → ACTIONS_MAP['exit-game'] → EXIT_GAME_ACTIONS
 *         → EXIT_GAME_ACTIONS['MOVE_UP'] → 移动光标到 RESUME GAME
 *         → EXIT_GAME_ACTIONS['MOVE_DOWN'] → 移动光标到 EXIT GAME
 *         → EXIT_GAME_ACTIONS['CONFIRM'] → 执行当前选项（恢复或退出）
 *
 * @example
 *   // 在 playing 模式下执行左移命令
 *   const cmd = new Command('MOVE_LEFT', { Game: gameInstance });
 *   dispatchCommand(cmd, { mode: 'playing' });
 *   // 路由到 GAME_PLAYING_ACTIONS['MOVE_LEFT'](payload)
 *
 * @function dispatchCommand
 * @param {object} cmd - 要执行的命令
 * @param {object} options - 扩展参数对象
 * @param {string} options.mode - 当前游戏模式，用于路由
 * @returns {void}
 */
const dispatchCommand = (cmd, options) => {
  const { mode } = options;
  const { action, payload } = cmd;

  // 获取当前 mode 对应的 action 集合
  const actions = ACTIONS_MAP[mode];

  // 如果当前状态没有定义 actions，直接忽略
  if (!actions) {
    return;
  }

  // 根据 command action 找到对应 handler
  const handler = actions[action];

  // 执行 handler（如果存在）：使用可选链操作符，handler 为 undefined 时安全跳过
  handler?.(payload);
};

export default dispatchCommand;
```

可以看到无论是 Replay 或是 AI 都完全共享的同一套执行流程，不用再各自实现一套自己的逻辑了。

## Store

Runtime 并不会直接保存所有数据，真正的游戏状态由 Store 管理。例如：

- Board
- Current Piece
- Hold
- Next Queue
- Score
- Level
- Combo
- Back-to-Back

### GameState

tetris.js 使用 GameState 保存游戏的状态信息：

```js
const GameState = {
  /**
   * ## 游戏模式选择索引
   *
   * 在游戏模式选择界面（game-mode）中，光标当前所在的位置。 用于上下移动选择不同的游戏模式。
   *
   * - `0`：单人模式（SINGLE）
   * - `1`：对战模式（VERSUS）
   *
   * @default 0
   * @type {number}
   */
  modeIndex: 0,

  /**
   * ## 对战模式选择索引
   *
   * 在对战模式选择界面（battle-mode）中，光标当前所在的位置。 用于上下移动选择不同的对战类型。
   *
   * - `0`：人机对战（HUMAN vs AI）
   * - `1`：双人对战（HUMAN vs HUMAN）
   *
   * @default 0
   * @type {number}
   */
  battleIndex: 0,

  /**
   * ## 退出游戏选择索引
   *
   * 在退出游戏菜单界面（exit-game）中，光标当前所在的位置。 用于上下移动选择不同的退出选项。
   *
   * - `0`：RESUME GAME（继续游戏）
   * - `1`：EXIT GAME（退出游戏）
   *
   * @default 0
   * @type {number}
   */
  exitIndex: 0,

  /*
   * ==================== 控制者 ====================
   */

  /**
   * ## 当前控制者身份
   *
   * 标识当前由谁控制游戏操作。
   *
   * - `'human'`：人类玩家操作（键盘、手柄、触屏）
   * - `'ai'`：AI 自动操作
   *
   * 可通过按 S 键（键盘）或 RB 键（手柄）切换。
   *
   * @default 'human'
   * @type {string}
   */
  controller: 'human',

  /*
   * ==================== 棋盘数据 ====================
   */

  /**
   * ## 游戏初始化时的棋盘数据
   *
   * 用于回放（replay）模式恢复初始状态。 在 `setBeginningState()` 时设置为初始棋盘，之后不再修改。
   *
   * @default [ ]
   * @type {string[][]}
   */
  beginningBoard: [],

  /**
   * ## 游戏棋盘
   *
   * 20 行 × 10 列的二维数组。 每个格子的值为颜色字符串（如 `"#00c8ff"`），空字符串 `""` 表示空格。 棋盘底部为第 19
   * 行，顶部为第 0 行。
   *
   * @default [ ]
   * @type {string[][]}
   */
  board: [],

  /*
   * ==================== 方块数据 ====================
   */

  /**
   * ## 当前活动方块对象
   *
   * 包含方块的形状（shape）、位置（cx, cy）、颜色等信息。 `null` 表示没有活动方块（游戏未开始或方块已锁定）。
   *
   * @default null
   * @type {object | null}
   */
  curr: null,

  /**
   * ## 当前方块 X 坐标（列索引）
   *
   * 方块左上角在棋盘中的列位置。取值范围通常为 0-9。
   *
   * @default 0
   * @type {number}
   */
  cx: 0,

  /**
   * ## 当前方块 Y 坐标（行索引）
   *
   * 方块左上角在棋盘中的行位置。0 为棋盘顶部。
   *
   * @default 0
   * @type {number}
   */
  cy: 0,

  /**
   * ## 下一个预览方块对象
   *
   * 在当前方块锁定时，`next` 方块会成为新的 `curr` 方块。 `null` 表示尚未生成。
   *
   * @default null
   * @type {object | null}
   */
  next: null,

  /**
   * ## 暂存（Hold）方块对象
   *
   * 玩家通过 Hold 操作将当前方块存入暂存区。 下次 Hold 操作时取出使用。 `null` 表示暂存区为空。
   *
   * @default null
   * @type {object | null}
   */
  hold: null,

  /*
   * ==================== 特殊消行 ====================
   */

  /**
   * ## T-Spin 检测结果
   *
   * 记录最后一次操作是否触发了 T-Spin。
   *
   * - `{ isTSpin: true, isTSpinMini: false }`：标准 T-Spin
   * - `{ isTSpin: false, isTSpinMini: true }`：T-Spin Mini
   * - `null`：未触发 T-Spin
   *
   * @default null
   * @type {object | null}
   */
  tSpin: null,

  /**
   * ## Back-to-Back 连续特殊消行标记
   *
   * 当连续两次消行都是特殊消行（T-Spin 或 Tetris）时触发。 给予额外计分奖励。
   *
   * @default false
   * @type {boolean}
   */
  backToBack: false,

  /*
   * ==================== 计分数据 ====================
   */

  /**
   * ## 当前得分
   *
   * 每次消行后根据消除行数和当前等级计算并累加。
   *
   * @default 0
   * @type {number}
   */
  score: 0,

  /**
   * ## 累计消除行数
   *
   * 所有消行的行数总和，用于计算等级提升。
   *
   * @default 0
   * @type {number}
   */
  lines: 0,

  /**
   * ## 当前等级
   *
   * 从 1 开始，最高 256 级。 等级越高方块下落越快，计分倍率也越高。
   *
   * @default 1
   * @type {number}
   */
  level: 1,

  /**
   * ## 连击计数
   *
   * 连续消行的次数。每次消行 combo +1，未消行则清零。 Combo 越高额外加分越多。
   *
   * @default 0
   * @type {number}
   */
  combo: 0,

  /**
   * ## 连击累计得分
   *
   * 当前连击序列中累计获得的额外加分。
   *
   * @default 0
   * @type {number}
   */
  comboScore: 0,

  /**
   * ## 历史最高分
   *
   * 从 localStorage 加载，游戏结束时如果当前分数超过此值则更新。
   *
   * @default 0
   * @type {number}
   */
  highScore: 0,

  /*
   * ==================== 等级系统 ====================
   */

  /**
   * ## 升级基准行数
   *
   * 用于计算升级进度。升级所需行数 = baseLines + levelUpSteps。 每次升级后 baseLines 更新为当前 lines 值。
   *
   * @default 0
   * @type {number}
   */
  baseLines: 0,

  /**
   * ## 每升一级需要消除的行数
   *
   * 初始为 10 行，随等级提升逐渐增加，最高单级需消除 60 行。
   *
   * @default 10
   * @type {number}
   */
  levelUpSteps: 10,

  /*
   * ==================== 消行数据 ====================
   */

  /**
   * ## 当前待消除的满行行号数组
   *
   * 存储所有已填满需要消除的行号。 消行动画结束后清空。
   *
   * @default [ ]
   * @type {number[]}
   */
  clearLines: [],

  /*
   * ==================== 游戏设置 ====================
   */

  /**
   * ## 游戏难度
   *
   * 影响初始棋盘垃圾行数量和 AI 行为。
   *
   * - `'easy'`：简单（0 行初始垃圾）
   * - `'normal'`：普通（3 行初始垃圾）
   * - `'hard'`：困难（6 行初始垃圾）
   * - `'expert'`：专家（9 行初始垃圾）
   *
   * @default 'easy'
   * @type {string}
   */
  difficulty: 'easy',

  /**
   * ## 游戏模式
   *
   * 标识游戏当前所处的阶段/界面。
   *
   * - `'game-mode'`：游戏模式选择界面（选择单人/对战）
   * - `'battle-mode'`：对战模式选择界面（选择 HUMAN vs AI / HUMAN vs HUMAN）
   * - `'main-menu'`：主菜单/等级选择界面
   * - `'difficulty'`：难度选择界面
   * - `'playing'`：游戏中
   * - `'paused'`：游戏暂停
   * - `'game-over'`：游戏结束
   * - `'replay'`：游戏回放
   *
   * @default 'game-mode'
   * @type {string}
   */
  mode: 'game-mode',

  /*
   * ==================== 外设状态 ====================
   */

  /**
   * ## 游戏手柄是否已连接
   *
   * 用于 UI 显示手柄连接状态和通知提示。
   *
   * @default false
   * @type {boolean}
   */
  gamepadConnected: false,
};

export default GameState;
```

### GameStore 操作 GameState 数据

但 tetris.js 并不是直接操作 GameState，而是使用专门的 GameStore 模块管理操作 GameState 的数据：

```js
import placeGarbageOnBoard from '@/lib/state/utils/place-garbage-on-board.js';
import isFunction from '@/lib/utils/types/is-function.js';

class GameStore {
  constructor(options) {
    this.initialize(options);
  }

  initialize(options) {
    const { GameState, cols, rows } = options;

    this.defaults = structuredClone(GameState);
    this.options = { cols, rows };
    this.state = structuredClone(GameState);
  }

  getState() {
    return this.state;
  }

  setState(patch) {
    this.state = {
      ...this.state,
      ...(isFunction(patch) ? patch(this.state) : patch),
    };
  }

  resetState() {
    this.state = structuredClone(this.defaults);
  }

  getModeIndex() {
    return this.state.modeIndex;
  }

  setModeIndex(index) {
    this.state.modeIndex = index;
  }

  getBattleIndex() {
    return this.state.battleIndex;
  }

  setBattleIndex(index) {
    this.state.battleIndex = index;
  }

  getExitIndex() {
    return this.state.exitIndex;
  }

  setExitIndex(index) {
    this.state.exitIndex = index;
  }

  getBoard() {
    return this.state.board;
  }

  resetBoard() {
    const { cols, rows } = this.options;

    this.state.board = Array.from({ length: rows }, () =>
      Array.from({ length: cols }).fill(0),
    );
  }

  generateBoard() {
    const DIFFICULTY_GARBAGE_ROWS = {
      easy: 0,
      normal: 3,
      hard: 6,
      expert: 9,
    };

    const { options, state } = this;
    const { board, difficulty } = state;

    const garbageRows = DIFFICULTY_GARBAGE_ROWS[difficulty] || 0;

    placeGarbageOnBoard(board, garbageRows, options.cols);

    return board;
  }

  setBeginningBoard(board) {
    this.state.beginningBoard = structuredClone(board);
  }

  getBeginningBoard() {
    return structuredClone(this.state.beginningBoard);
  }

  getController() {
    return this.state.controller;
  }

  setController(controller) {
    this.state.controller = controller;
  }

  setGamepadConnected(connected) {
    this.state.gamepadConnected = connected;
  }

  isGamepadConnected() {
    return this.state.gamepadConnected;
  }

  getDifficulty() {
    return this.state.difficulty;
  }

  setDifficulty(difficulty = 'easy') {
    this.state.difficulty = difficulty;
  }

  getBaseLines() {
    return this.state.baseLines;
  }

  setBaseLines(lines) {
    this.state.baseLines = lines;
  }

  getClearLines() {
    return this.state.clearLines;
  }

  setClearLines(lines) {
    this.state.clearLines = lines;
  }

  getHub() {
    const { source, lines, level, combo, comboScore } = this.state;
    return { source, lines, level, combo, comboScore };
  }

  setHud(hud) {
    const { score, lines, level, combo, comboScore } = hud;
    this.state.score = score;
    this.state.lines = lines;
    this.state.level = level;
    this.state.combo = combo;
    this.state.comboScore = comboScore;
  }

  getScore() {
    return this.state.score;
  }

  setHighScore(highScore) {
    this.state.highScore = highScore;
  }

  getHighScore() {
    return this.state.highScore;
  }

  getLevel() {
    return this.state.level;
  }

  setLevel(level) {
    this.state.level = level;
  }

  getMode() {
    return this.state.mode;
  }

  setMode(mode) {
    this.state.mode = mode;
  }
}

export default GameStore;
```

只需要在 Runtime 初始化的时候创建 GameStore，之后 Runtime 就可以通过它操作 GameState 了：

```js
class Game extends Base {
  initialize() {
    const { Elements, Block, Scheduler, Player } = this;
    const { Controls } = Elements;

    this.id =
      crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const Store = new GameStore({
      ...Elements.Canvas,
      Player,
      GameState,
    });

    this.effect = null;

    this.bag = [];

    this.Store = Store;

    this.Animations = new AnimationSystem({
      Game: this,
      Player,
    });

    this.CommandQueue = new CommandQueue({
      Game: this,
      Player,
    });

    this.UI = new UI({
      Game: this,
      Store,
      Elements,
      Block,
      Player,
    });

    const isVersus = this.isVersus();

    if ((isVersus && Player.name === 'ai') || !isVersus) {
      this.AI = new AIController({
        Game: this,
        Store,
        Scheduler,
        Animations: this.Animations,
        Player,
      });
    }

    this.Keyboard = new KeyboardController({
      Game: this,
      Store,
      Player,
    });

    this._initializeGamepadController();

    if (!isVersus) {
      this.Touch = new TouchController({
        Game: this,
        Store,
        Controls,
        Player,
      });
    }

    this.Replay = new ReplayController({
      Game: this,
      Store,
      Scheduler,
      Player,
    });

    this.Router = new GameRouter({
      Animations: this.Animations,
      AI: this.AI,
      CommandQueue: this.CommandQueue,
      Game: this,
      Replay: this.Replay,
      Store,
      UI: this.UI,
      Player,
    });

    this.launch();
  }
}
```

### GameStore 实际的调用方式

这里以游戏中实现消除方块的 `clearLines`
函数为范本，看看 Runtime 是如何调用 Store 操作游戏状态数据的：

```js
import findFullLines from '@/lib/game/logic/find-full-lines.js';
import { GameEvents, UIEvents } from '@/lib/events/event-catalog.js';

const clearLines = (runtime) => {
  const { id, Store } = runtime;

  /**
   * ======== 步骤 1：查找满行 ========
   *
   * 从底部向上扫描棋盘，找出所有被填满的行。
   */
  const linesToClear = findFullLines(runtime);

  /**
   * ======== 步骤 2：无满行则返回 ========
   *
   * 没有可消除的行，无需后续处理。
   */
  if (linesToClear.length === 0) {
    const UE = UIEvents(id);
    const hudState = { combo: 0 };

    // 没有消行，重置 combo
    Store.setState(hudState);
    runtime.emit(UE.UPDATE_HUD, hudState);

    return;
  }

  /**
   * ======== 步骤 3：存入 Store ========
   *
   * 将满行行号写入 `state.clearLines`， 供 `ClearLinesAnimation` 和 `applyClearLines` 使用。
   */
  Store.setClearLines(linesToClear);

  /**
   * ======== 步骤 4：触发消行动画 ========
   *
   * 启动 `ClearLinesAnimation` 闪烁特效。 动画 720ms 结束后自动调用 `applyClearLines` 完成消行。
   */
  const GE = GameEvents(id);
  runtime.emit(GE.START_CLEAR_LINES, { linesToClear });
};

export default clearLines;
```

Runtime 负责更新状态，AI、Renderer(UI)、Router、Input(Keyboard/Gamepad/Touch)、Replay 等系统则根据状态完成自己的工作，这种职责划分使系统之间保持较低耦合。

## Scheduler

除了游戏逻辑，很多行为都具有时间属性。例如：音效播放、延迟生成 Garbage、倒计时特效，这些任务如果全部使用
`setTimeout()`，很难保证节奏一致。

项目真正需要的并不是更多的 Timer，而是一套统一任务管理时间的机制。Scheduler 不关心具体执行什么任务，它只负责：

- 什么时候执行；
- 是否需要延迟；
- 是否可以取消；
- 是否应该暂停；
- 是否跟随 Runtime 一起继续运行。

所有需要"等待"的行为，都统一交由 Scheduler 调度。

### Scheduler 实现

让我们一起看看 Scheduler 模块的实现，我们就是知道 Scheduler 是如何统一调度所有需要"等待"的行为的：

```js
/**
 * # Scheduler（任务调度器）
 *
 * 游戏核心的任务调度引擎，替代 `setTimeout`/`setInterval`， 由外部 Game Loop 每帧通过 `tick()` 驱动。
 *
 * ## 核心特性
 *
 * - **绝对时间模型（Absolute Time）**：任务绑定绝对时间戳，不依赖 `tick` 初始化
 * - **有序任务队列（Sorted Queue）**：按 `time + order` 排序，保证执行顺序稳定
 * - **时间漂移修复（Interval Drift Fix）**：Interval 从 `nextTime` 精确计算，避免累积误差
 * - **补帧保护（Catch-up Protection）**：限制单次 `tick` 最大补帧数，防止切后台后卡死
 *
 * ## 任务类型
 *
 * | 类型     | 方法         | 说明                   |
 * | -------- | ------------ | ---------------------- |
 * | delay    | `delay()`    | 一次性延迟任务         |
 * | interval | `interval()` | 周期性重复任务         |
 * | sequence | `sequence()` | 按时间偏移的顺序任务链 |
 *
 * ## 设计理念
 *
 * - **不依赖 RAF**：由外部 `startGameLoop` 驱动，与渲染循环解耦
 * - **稳定排序**：同一时间任务按 `order` 执行，保证音效序列等场景的时序一致
 * - **Lazy Cleanup**：取消任务仅标记 `cancelled`，在 `tick` 末尾统一清理
 *
 * @class Scheduler
 */
class Scheduler {
  /**
   * ## 构造函数
   *
   * 初始化空任务队列、ID 计数器和顺序计数器。
   */
  constructor() {
    /**
     * ## 任务队列
     *
     * 按 `time + order` 升序排列的有序数组。 替代 Map 实现，避免全遍历，保证时间顺序和执行稳定性。
     *
     * @type {object[]}
     */
    this.tasks = [];

    /**
     * ## 下一个任务 ID
     *
     * 自增计数器，每个任务分配唯一 ID。
     *
     * @type {number}
     */
    this.nextId = 1;

    /**
     * ## 顺序计数器
     *
     * 同一时间点的任务按 `order` 升序执行，保证稳定排序。
     *
     * @type {number}
     */
    this.order = 0;

    /**
     * ## 当前逻辑时间
     *
     * 由 `tick(gameTime)` 每帧更新。
     *
     * @type {number}
     */
    this.now = performance.now();

    /**
     * ## 延迟清理标记
     *
     * 有任务被取消时设为 `true`，在下次 `tick` 末尾统一清理。
     *
     * @type {boolean}
     */
    this.dirty = false;

    /**
     * ## 最大补帧数
     *
     * 单次 `tick` 中 Interval 任务的最大补执行次数，防止长时间暂停后瞬间爆帧。
     *
     * @type {number}
     */
    this.maxCatchUp = 5;
  }

  /* ================== 公共 API ================== */

  /**
   * ## 创建延迟任务
   *
   * 替代 `setTimeout`，在当前逻辑时间 + 指定延迟后执行一次回调。
   *
   * @example
   *   const id = scheduler.delay(() => console.log('done'), 100);
   *
   * @param {Function} fn - 回调函数
   * @param {number} [delay=0] - 延迟时间（毫秒）。默认值为 `0`. Default is `0`
   * @returns {number} 任务 ID，可用于 `cancel()`
   */
  delay(fn, delay = 0) {
    const id = this.nextId++;

    this._insertTask({
      id,
      type: 'delay',
      fn,
      time: this.now + delay,
      cancelled: false,
      order: this.order++,
    });

    return id;
  }

  /**
   * ## 创建周期任务
   *
   * 替代 `setInterval`，按指定间隔周期性执行回调。
   *
   * @example
   *   const id = scheduler.interval(() => console.log('tick'), 200);
   *
   * @param {Function} fn - 回调函数
   * @param {number} [interval=1000] - 执行间隔（毫秒）。默认值为 `1000`. Default is `1000`
   * @returns {number} 任务 ID，可用于 `cancel()`
   */
  interval(fn, interval = 1000) {
    const id = this.nextId++;

    this._insertTask({
      id,
      type: 'interval',
      fn,
      interval,
      time: this.now + interval,
      nextTime: this.now + interval,
      cancelled: false,
      order: this.order++,
    });

    return id;
  }

  /**
   * ## 创建任务序列
   *
   * 按时间偏移顺序执行多个任务。每个任务可指定相对于序列起始时间的延迟。 内部使用 `delay()` 实现，直接绑定绝对时间，不依赖 `tick`
   * 初始化。
   *
   * @example
   *   scheduler.sequence([
   *     { fn: () => playNote('C4') },
   *     { fn: () => playNote('E4'), delay: 260 },
   *     { fn: () => playNote('G4'), delay: 260 },
   *   ]);
   *
   * @param {{ fn: Function; delay?: number }[]} list - 任务列表
   * @param {Function} list[].fn - 回调函数
   * @param {number} [list[].delay=0] - 该任务相对于上一个任务的延迟（毫秒）。默认值为 `0`. Default is
   *   `0`
   * @returns {number[]} 所有任务的 ID 数组
   */
  sequence(list) {
    const ids = [];
    let t = 0;

    for (const item of list) {
      const { fn, delay = 0 } = item;
      t += delay;
      ids.push(this.delay(fn, t));
    }

    return ids;
  }

  /**
   * ## 取消任务
   *
   * 通过任务 ID 标记任务为取消状态。 取消的任务不会立即删除，而是在下一次 `tick()` 时批量清理。
   *
   * @param {number} id - 要取消的任务 ID
   * @returns {void}
   */
  cancel(id) {
    const task = this.tasks.find((t) => t.id === id);

    if (!task) {
      return;
    }

    task.cancelled = true;
    this.dirty = true;
  }

  /**
   * ## 清空所有任务
   *
   * 立即删除所有任务并清除脏标记。 通常在游戏重启或模式切换时调用。
   *
   * @returns {void}
   */
  clear() {
    this.tasks.length = 0;
    this.dirty = false;
  }

  /**
   * ## 驱动调度器
   *
   * 由外部 Game Loop 每帧调用，传入当前游戏时间。 遍历到期任务并执行，最后清理已取消的任务。
   *
   * @param {number} [gameTime=performance.now()] - 当前游戏时间戳（毫秒）。默认值为
   *   `performance.now()`. Default is `performance.now()`
   * @returns {void}
   */
  tick(gameTime = performance.now()) {
    this.now = gameTime;

    if (this.tasks.length === 0) return;

    this._executeDueTasks(gameTime);
    this._cleanup();
  }

  /**
   * ## 获取任务数量
   *
   * Debug 辅助方法，用于测试和调试。
   *
   * @returns {number} 当前任务队列中的任务数量
   */
  size() {
    return this.tasks.length;
  }

  /* ================== 核心引擎（私有） ================== */

  /**
   * ## 插入任务并保持队列有序
   *
   * 使用插入排序将任务按 `time + order` 升序排列。 同一时间点的任务按 `order` 保证执行顺序稳定。
   *
   * @private
   * @param {object} task - 任务对象
   * @returns {void}
   */
  _insertTask(task) {
    const { tasks } = this;
    let i = tasks.length;

    /**
     * 插入排序：从队尾向前找到正确位置
     *
     * 排序规则：
     *
     * 1. `time` 小的在前
     * 2. `time` 相同时 `order` 小的在前
     */
    while (i > 0) {
      const prev = tasks[i - 1];

      if (
        prev.time < task.time ||
        (prev.time === task.time && prev.order <= task.order)
      ) {
        break;
      }

      tasks[i] = tasks[i - 1];
      i--;
    }

    tasks[i] = task;
  }

  /**
   * ## 执行所有到期任务
   *
   * 从队头依次取出 `time <= gameTime` 的任务，按类型分发处理。
   *
   * @private
   * @param {number} gameTime - 当前游戏时间戳
   * @returns {void}
   */
  _executeDueTasks(gameTime) {
    while (this.tasks.length > 0 && this.tasks[0].time <= gameTime) {
      const task = this.tasks.shift();

      if (task.cancelled) continue;

      if (task.type === 'delay') {
        this._runDelayTask(task);
      } else if (task.type === 'interval') {
        this._runIntervalTask(task, gameTime);
      }
    }
  }

  /**
   * ## 执行 Delay 任务
   *
   * 一次性任务，执行后即结束。
   *
   * @private
   * @param {object} task - 延迟任务对象
   * @returns {void}
   */
  _runDelayTask(task) {
    task.fn(task);
  }

  /**
   * ## 执行 Interval 任务
   *
   * 周期任务，执行后更新 `nextTime` 并重新插入队列。 包含补帧保护：长时间暂停后最多补 `maxCatchUp` 次， 超过后重置
   * `nextTime` 为当前时间，防止瞬间爆帧。
   *
   * @private
   * @param {object} task - 周期任务对象
   * @param {number} gameTime - 当前游戏时间戳
   * @returns {void}
   */
  _runIntervalTask(task, gameTime) {
    let catchUp = 0;

    /** 补帧循环： 如果 `nextTime` 落后于当前时间，连续补执行， 最多 `maxCatchUp` 次，防止长时间暂停后爆炸。 */
    while (
      task.nextTime <= gameTime &&
      !task.cancelled &&
      catchUp < this.maxCatchUp
    ) {
      catchUp++;
      task.fn(task);
      task.nextTime += task.interval;
    }

    /** 达到补帧上限：重置 nextTime 为当前时间， 放弃追赶，避免瞬间执行大量回调。 */
    if (catchUp >= this.maxCatchUp) {
      task.nextTime = gameTime + task.interval;
    }

    // 未取消则重新插入队列等待下次触发
    if (!task.cancelled) {
      // 同步 time
      task.time = task.nextTime;
      this._insertTask(task);
    }
  }

  /**
   * ## 批量清理已取消的任务
   *
   * 延迟清理机制：有脏标记时才执行清理。 过滤掉所有 `cancelled === true` 的任务。
   *
   * @private
   * @returns {void}
   */
  _cleanup() {
    if (!this.dirty) return;

    this.tasks = this.tasks.filter((t) => !t.cancelled);
    this.dirty = false;
  }
}

export default Scheduler;
```

Scheduler 的逻辑其实很简单，通过 `this.tasks = []` 存储任务列队，通过
`sequence`、`delay` 和 `interval` 向列队中添加任务。

```js
class Scheduler {
  /**
   * ## 执行所有到期任务
   *
   * 从队头依次取出 `time <= gameTime` 的任务，按类型分发处理。
   *
   * @private
   * @param {number} gameTime - 当前游戏时间戳
   * @returns {void}
   */
  _executeDueTasks(gameTime) {
    while (this.tasks.length > 0 && this.tasks[0].time <= gameTime) {
      const task = this.tasks.shift();

      if (task.cancelled) continue;

      if (task.type === 'delay') {
        this._runDelayTask(task);
      } else if (task.type === 'interval') {
        this._runIntervalTask(task, gameTime);
      }
    }
  }
}
```

`const task = this.tasks.shift();`
则保证任务以 FIFO 的执行顺序，先进入列队的任务先执行。至于任务时间与 Game
Loop 主循环的同步则是通过 `tick` 方法实现的：

```js
class Scheduler {
  /**
   * ## 驱动调度器
   *
   * 由外部 Game Loop 每帧调用，传入当前游戏时间。 遍历到期任务并执行，最后清理已取消的任务。
   *
   * @param {number} [gameTime=performance.now()] - 当前游戏时间戳（毫秒）。默认值为
   *   `performance.now()`. Default is `performance.now()`
   * @returns {void}
   */
  tick(gameTime = performance.now()) {
    this.now = gameTime;

    if (this.tasks.length === 0) return;

    this._executeDueTasks(gameTime);
    this._cleanup();
  }
}
```

Scheduler 就实现了一套统一任务管理时间的机制，Scheduler 因此成为 Runtime 的一部分，所有需要等待执行的任务，都会统一进入 Scheduler。

### Scheduler 初始化

Scheduler 在系统启动的时候初始的，是一个全局的任务调度系统：

```js
const Engine = {
  // 省略其他逻辑...
  initialize: (options = {}) => {
    const { isRelaunch = false } = options;

    /*
     * ==================== 步骤 1：创建引擎全局状态管理器 ====================
     *
     * EngineStore 合并默认 EngineState 和传入的 options，
     * 通过 structuredClone 深拷贝确保状态独立性。
     * 后续所有模块通过 Engine.Store 访问全局配置。
     */
    const Store = new EngineStore(options);

    // 挂载 Store 到 Engine 静态属性
    Engine.Store = Store;

    /*
     * ==================== 步骤 2：创建界面渲染器并渲染 DOM ====================
     *
     * EngineRenderer 根据 Store 中的 Mode 和 Players 配置
     * 生成对应数量和结构的 HTML 模板，一次性注入根容器。
     *
     * Single 模式：渲染 1 套棋盘 + HUD + 控制按钮
     * Versus 模式：渲染 2 套棋盘 + HUD + Battle 覆盖层
     */
    Engine.Renderer = new EngineRenderer({
      Store,
    });

    // 绘制游戏的所有 DOM 界面（棋盘、HUD、按钮等）
    Engine.Renderer.render();

    // 从 Store 获取完整状态
    const state = Store.getState();

    // 解构核心配置，用于后续创建 Game 和 BattleController
    const { Players, Mode, Elements } = state;

    /*
     * ==================== 步骤 3：创建全局调度器 ====================
     *
     * Scheduler 是所有时间驱动逻辑的核心，包括：
     * - AI 的决策循环（AIController.loop）
     * - 音效序列
     * - 动画时序（delay / sequence）
     *
     * 挂载在 Engine 上，供所有子模块共享引用。
     */
    Engine.Scheduler = new Scheduler();

    /*
     * ==================== 步骤 4：标准化配置 ====================
     *
     * 将 Scheduler 注入配置，并标记默认启用 AI 模式。
     * 扩展运算符确保原始 state 不被修改。
     *
     * isAIPlayer = true 表示在 Single 模式下默认创建 AI 控制器，
     * 玩家可通过 S 键切换 human ↔ ai。
     */
    const normalizedOptions = {
      ...state,
      isRelaunch,
      Scheduler: Engine.Scheduler,
      isAIPlayer: true,
    };

    /*
     * ==================== 步骤 5：创建音频系统 ====================
     *
     * Audio 管理背景音乐和音效。
     * 注入完整的标准化配置（包含 Scheduler 引用）。
     */
    Engine.Audio = new Audio(normalizedOptions);

    /*
     * ==================== 步骤 6：处理玩家列表 ====================
     *
     * 创建 Players 数组的副本（避免修改原始 state）。
     * Single 模式移除最后一个玩家，只保留第一个。
     * Versus 模式保留全部两个玩家。
     */
    const finalPlayers = [...Players];

    if (Mode === 'single') {
      // 单人模式只保留第一个玩家（如 ['human', 'ai'] → ['human']）
      finalPlayers.pop();
    }

    /*
     * ==================== 步骤 7：创建 Game 实例 ====================
     *
     * 遍历 finalPlayers，为每位玩家创建独立的 Game 实例。
     *
     * 每个 Game 实例在构造函数中自动完成：
     * 1. Base.inject() — 将所有配置注入 this
     * 2. Game.initialize() — 创建 Store、UI、Keyboard、AI 等子系统
     * 3. Game.launch() — 初始化棋盘、HUD、事件绑定
     *
     * 每个 Game 实例包含：
     * - Player 信息（name + index）
     * - 完整的子系统（Store、UI、Keyboard、AI 等）
     * - 对 Scheduler 和 Audio 的引用
     * - 独立的 7-bag（this.bag = []）
     */
    for (const [index, player] of finalPlayers.entries()) {
      Engine.Games.push(
        new Game({
          Player: {
            index,
            name: player,
          },
          ...normalizedOptions,
        }),
      );
    }

    /*
     * ==================== 步骤 8：创建对战控制器 ====================
     *
     * 仅在对战模式下创建 BattleController。
     * 注入双方 Game 实例、Battle UI 元素配置和玩家列表。
     *
     * BattleController 在构造函数中自动完成：
     * 1. 创建 BattleStore（对战状态管理）
     * 2. 创建 BattleHUD（记分牌）
     * 3. 创建 BattleRouter（事件路由）
     * 4. 创建 BattleUI（结果面板 + fly canvas）
     * 5. 调用 start() 开始对战
     */
    if (Engine.Store.isVersus()) {
      Engine.Battle = new BattleController({
        games: Engine.Games,
        elements: Elements.Battle,
        players: finalPlayers,
      });
    }
  },
};
```

可以看到 Audio、Runtime(Game模块以及其所有子模块) 和 Battle 模块都依赖 Scheduler 统一进行延迟任务的管理。

### Scheduler 的更新

前面介绍了 Scheduler 任务时间与 Game
Loop 主循环的能同步， 我们来看看具体是如何做到的：

```js
const Engine = {
  // 省略其他逻辑...
  tick: (timestamp) => {
    const { Games, Scheduler } = Engine;

    // 首次运行时初始化时间基准，为每个 Game 实例设置初始累积器时间戳
    if (!Engine.lastTickTime) {
      Engine.lastTickTime = timestamp;

      for (const Game of Games) {
        Engine.gameAccumulators.set(Game, timestamp);
      }
    }

    // 更新上一帧时间戳，供后续计算 delta time
    Engine.lastTickTime = timestamp;

    /*
     * ==================== 步骤 1：驱动调度器 ====================
     *
     * 执行所有到期的定时任务（delay、interval、sequence）。
     * 这包括：
     * - AI 的决策循环（AIController.loop）
     * - 音效序列
     * - 动画时序（如垃圾行预警的闪烁定时器）
     *
     * AI 的 loop 在此处被 Scheduler 触发，而非在 Game.tick 中。
     */
    Scheduler.tick(timestamp);

    /* ==================== 步骤 2-11：每个 Game 实例的帧更新 ==================== */
    for (const Game of Games) {
      Game.flush(timestamp, Engine.lastTickTime, Engine.gameAccumulators);
    }

    // 更新全局逻辑时间基准
    Engine.fixedAccumulator = timestamp;

    // 步骤 12：请求下一帧，形成游戏循环
    Engine.rafId = requestAnimationFrame(Engine.tick);
  },
};
```

可以弹道 Game Loop 每一帧都会通过 `**Scheduler.tick(timestamp)**`
推进 Scheduler，从而保证整个游戏始终运行在同一时间轴上。

### Scheduler 的应用实例

Audio 模块播放背景音乐和音效的场景，就是应用 统一管理延迟任务的典型案例：

#### loopPlayBGM

```js
import playTone from '@/lib/services/audio/play-tone.js';

const SCHEDULE_AHEAD_TIME = 0.12;
const LOOKAHEAD = 25;

const loopPlayBGM = (audio, melody, options = {}) => {
  const {
    duration = 110,
    volume = 0.05,
    wave = 'square',
    gate = 1,
    articulation = {},
  } = options;

  if (duration <= 0 || !melody?.length) {
    return;
  }

  const { Scheduler, Context } = audio;

  if (Context.state === 'suspended') {
    Context.resume();
  }

  let currentNoteIndex = 0;
  let nextNoteTime = Context.currentTime;

  const scheduleNote = (note, time) => {
    const stepDur = note.dur * duration;

    if (note.freq > 0) {
      playTone(audio, note.freq, stepDur, {
        volume,
        wave,
        gate,
        articulation,
        startTime: time,
      });
    }
  };

  const scheduler = () => {
    const audioNow = Context.currentTime;
    const limit = audioNow + SCHEDULE_AHEAD_TIME;

    while (nextNoteTime < limit) {
      const note = melody[currentNoteIndex];

      scheduleNote(note, nextNoteTime);

      const stepDur = note.dur * duration;
      nextNoteTime += stepDur / 1000;

      currentNoteIndex = (currentNoteIndex + 1) % melody.length;
    }
  };

  audio.bgmSchedulerId = Scheduler.interval(scheduler, LOOKAHEAD);
};

export default loopPlayBGM;
```

#### Sounds

```js
class Sounds extends Base {
  CLEAR = (lines = 1, level = 1, isPerfectClear = false) => {
    const setIndex = Math.min(Math.floor((level - 1) / 16), 15);
    const frequencies = CHORD_SETS[setIndex];
    const params = PARAM_SETS[setIndex];

    const speeds = [260, 300, 380];
    const volumes = [0.32, 0.3, 0.25];
    const timeouts = [160, 320, 480];

    const motif = getMotif(lines, isPerfectClear);
    const cfg = MOTIFS[motif];

    const index = Math.min(lines, frequencies.length - 1);
    const baseChord = frequencies[index].filter((f) => f > 0);

    const chord = baseChord.map((freq) => freq + cfg.shift * 12);
    const queue = [];
    const { Context, Scheduler } = this;

    for (const [i, freq] of chord.entries()) {
      queue.push({
        fn: () => {
          const now = Context.currentTime;
          playTone(this, freq, speeds[i] * cfg.speed * params.spdMul, {
            volume: volumes[i] * cfg.volume * params.volMul,
            wave: params.wave,
            startTime: now + timeouts[i] / 1000,
          });
        },
      });
    }

    Scheduler.sequence(queue);
  };

  LEVEL_UP = () => {
    const { Context, Scheduler } = this;
    const now = Context.currentTime;

    Scheduler.sequence([
      { fn: () => playTone(this, 523, 220) },
      { fn: () => playTone(this, 587, 220, { startTime: now + 0.26 }) },
      { fn: () => playTone(this, 659, 240, { startTime: now + 0.52 }) },
      {
        delay: 260,
        fn: () => playTone(this, 784, 260, { startTime: now + 0.78 }),
      },
      { fn: () => playTone(this, 880, 280, { startTime: now + 1.06 }) },
      { fn: () => playTone(this, 1047, 320, { startTime: now + 1.36 }) },
      { fn: () => playTone(this, 1175, 360, { startTime: now + 1.7 }) },
      { fn: () => playTone(this, 1319, 480, { startTime: now + 2.08 }) },
    ]);
  };
}
```

## Renderer

Renderer 不参与游戏逻辑，它只负责根据当前状态完成 Canvas 画面绘制。

### Renderer 的实现

```js
import Base from '@/lib/core';

import CanvasManager from '@/lib/services/ui/core/canvas-manager.js';
import HudManager from '@/lib/services/ui/hud/hud-manager.js';

import lazyRenderScene from '@/lib/services/ui/scene-manager/lazy-render-scene.js';
import renderScene from '@/lib/services/ui/scene-manager/render-scene.js';

import renderNextPiece from '@/lib/services/ui/next/render-next-piece.js';
import renderHoldPiece from '@/lib/services/ui/hold/render-hold-piece.js';
import clearNextPiece from '@/lib/services/ui/next/clear-next-piece.js';
import clearHoldPiece from '@/lib/services/ui/hold/clear-hold-piece.js';
import renderGhostPiece from '@/lib/services/ui/board/render-ghost-piece.js';
import resize from '@/lib/services/ui/core/resize.js';

import renderClearLines from '../effects/render-clear-lines.js';
import renderClearScore from '@/lib/services/ui/effects/render-clear-score.js';
import renderCountdown from '@/lib/services/ui/effects/render-countdown.js';
import renderLevelUp from '@/lib/services/ui/effects/render-level-up.js';
import renderLandingFlash from '@/lib/services/ui/effects/render-landing-flash.js';
import renderGarbageWarning from '@/lib/services/ui/effects/render-garbage-warning.js';
import renderGarbagePush from '@/lib/services/ui/effects/render-garbage-push.js';
import renderGamepadNotification from '@/lib/services/ui/effects/render-gamepad-notification.js';

class CanvasRenderer extends Base {
  constructor(options) {
    super(options);
    this.initialize();
  }

  initialize() {
    const { Game, Elements, Block, Player } = this;
    const { Hud, Canvas } = Elements;

    this.Hud = new HudManager({ Hud, Player });

    this.Canvas = new CanvasManager({
      uuid: Game.id,
      ...Canvas,
      ...Block,
      ...Player,
    });
  }

  getCanvas(isNext = false) {
    return this.Canvas.getCanvas(isNext);
  }

  updateMode(mode) {
    this.Canvas.gameBoard.dataset.mode = mode;
  }

  updateController(controller) {
    this.Hud.updateController(controller);
  }

  updateHud() {
    const { Store } = this;
    const state = Store.getState();
    const {
      mode,
      score,
      lines,
      level,
      highScore,
      combo = 0,
      needReset = false,
    } = state;

    if (mode === 'main-menu' || needReset) {
      this.Hud.reset();
    }

    this.Hud.update({ score, lines, level, highScore, combo });
  }

  tickHud() {
    this.Hud.tick();
  }

  lazyRender() {
    const { Store } = this;
    lazyRenderScene(this.Canvas, Store.getState());
  }

  render() {
    const { Store } = this;
    renderScene(this.Canvas, Store.getState());
  }

  resize() {
    resize(this.Canvas);
  }

  renderNextPiece() {
    const { Canvas, Store } = this;
    renderNextPiece(Canvas, Store.getState());
  }

  renderHoldPiece() {
    const { Canvas, Store } = this;
    renderHoldPiece(Canvas, Store.getState());
  }

  clearNextPiece() {
    const { Canvas } = this;
    clearNextPiece(Canvas);
  }

  clearHoldPiece() {
    const { Canvas } = this;
    clearHoldPiece(Canvas);
  }

  renderGhostPiece(ghost) {
    const { Canvas } = this;
    renderGhostPiece(Canvas, ghost);
  }

  renderCountdown(state) {
    renderCountdown(this.Canvas, state);
  }

  renderClearLines(state) {
    renderClearLines(this.Canvas, state);
  }

  renderClearScore(state) {
    renderClearScore(this.Canvas, state);
  }

  renderLevelUp(level, fireworks) {
    renderLevelUp(this.Canvas, level, fireworks);
  }

  renderLandingFlash(flashData) {
    renderLandingFlash(this.Canvas, flashData);
  }

  renderGarbageWarning(amount) {
    renderGarbageWarning(this.Canvas, amount);
  }

  renderGarbagePush(rows, visible) {
    renderGarbagePush(this.Canvas, rows, visible);
  }

  renderGamepadNotification(connected) {
    renderGamepadNotification(this.Canvas, connected);
  }
}

export default CanvasRenderer;
```

可以看到 Renderer 的职责非常的单一，Runtime 更新状态，Renderer 读取状态，然后绘制 Canvas 游戏画面。

这样无论当前运行的是：

- 单人模式
- Replay
- AI
- Battle

Renderer 都无需修改任何逻辑。

## AI、Replay 与 Runtime

AI 与 Replay 都建立在 Runtime 之上，Replay 保存的是 Command，AI 输出的也是 Command。

因此，对于 Runtime 来说，Replay 与玩家没有区别，AI 与键盘也没有区别。Runtime 始终执行统一的数据流，这也是整个项目能够保持确定性的关键。

## Runtime 带来了什么？

随着 Runtime 的建立，越来越多的新能力开始自然生长。例如：

- Replay
- AI
- Battle
- Gamepad
- Touch
- Scheduler
- Audio
- Animations

它们都不需要重新实现一套新的游戏，而是共享同一套 Runtime。因此，新增功能更多意味着增加新的模块，而不是修改已有系统。这也是 Runtime 最大的价值。

## 小结

Runtime 并不是为了让架构看起来更复杂。恰恰相反，它让复杂的系统拥有了统一的组织方式。

- 对于 Gameplay 来说，它只关心游戏规则；
- 对于 Renderer 来说，它只关心画面；
- 对于 AI 来说，它只关心决策；

而 Runtime 负责把这一切组织在一起，这也是整个 tetris.js 的核心。

## 下一步阅读

Runtime 负责组织整个游戏。而真正决定游戏行为的，是 Gameplay 与 AI。下一章将进入整个项目最复杂的系统之一：**AI**。了解 AI 如何在不修改真实棋盘的情况下完成搜索、模拟与决策。

**下一章：[04-ai.md](./04-ai.md)**
