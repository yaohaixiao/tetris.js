import Configuration from '@/lib/configuration.js';
// Scheduler 模块 - 任务调度器，管理所有定时任务
import Scheduler from '@/lib/engine/scheduler.js';
// Audio 模块 - 音频系统，管理背景音乐和音效
import Audio from '@/lib/services/audio';
// Game 模块 - 游戏主控类，管理单个玩家的所有子系统
import Game from '@/lib/game';
// Battle 模块 - 对战控制器，管理双人对战的攻击、计分和胜负
import BattleController from '@/lib/battle/battle-controller.js';
// 游戏界面绘制 - 根据配置生成完整 DOM 结构
import drawInterface from '@/lib/engine/draw-interface.js';
// 路由控制模块 - 将输入事件和命令分发到对应处理器
import dispatchInput from '@/lib/engine/dispatch-input.js';
import dispatchCommand from '@/lib/engine/dispatch-command.js';

/**
 * # Game Engine Core
 *
 * 这是整个游戏的核心控制器（Engine Core），采用**单例对象**模式，
 * 作为游戏各子系统之间的**中心调度枢纽**。
 *
 * ## 核心职责
 *
 * | 职责             | 说明                                 |
 * | ---------------- | ------------------------------------ |
 * | **生命周期控制** | launch / start / stop / restart      |
 * | **游戏状态管理** | 通过 EngineState + mode 管理游戏阶段 |
 * | **渲染调度**     | 协调 scene + animations + HUD 的渲染 |
 * | **输入绑定**     | 订阅全局事件、连接输入设备           |
 * | **存档管理**     | 加载和保存最高分                     |
 * | **画布自适应**   | 响应窗口 resize 事件                 |
 *
 * ## 设计原则
 *
 * Engine 本身**不负责具体游戏逻辑**（如移动、消除、碰撞检测），
 * 只负责**调度 + 生命周期控制**。具体逻辑由 Game 类及其子模块处理。
 *
 * ## 模块依赖
 *
 *     Engine
 *     ├── Scheduler（任务调度器）
 *     ├── Audio（音频系统）
 *     ├── Game（游戏主控）× N
 *     │   ├── Store（状态管理）
 *     │   ├── Keyboard（键盘输入）
 *     │   ├── Gamepad（手柄输入）
 *     │   ├── AI（AI 控制器）
 *     │   ├── UI（界面渲染）
 *     │   ├── Replay（回放系统）
 *     │   └── Animations（动画系统）
 *     ├── BattleController（对战控制）
 *     │   ├── BattleStore（对战状态）
 *     │   ├── BattleHUD（记分牌）
 *     │   ├── BattleUI（结果面板 + fly canvas）
 *     │   └── BattleRouter（事件路由）
 *     └── EventBus（全局事件总线）
 *
 * ## 游戏循环架构
 *
 *     每次 requestAnimationFrame 回调:
 *     ├── Scheduler.tick()     → 驱动所有定时任务
 *     ├── [每个 Game]:
 *     │   ├── Replay.update()  → 回放系统更新
 *     │   ├── Gamepad.update() → 手柄输入更新
 *     │   ├── Keyboard.update()→ 键盘输入更新
 *     │   ├── CommandQueue.flush() → 执行命令队列
 *     │   ├── Game.tick()      → 游戏逻辑（重力下落）
 *     │   ├── Animations.flush()→ 动画队列维护
 *     │   ├── UI.tickHud()     → HUD 动画更新
 *     │   ├── UI.render()      → 渲染游戏画面
 *     │   └── Animations.render()→ 渲染动画特效
 *     └── requestAnimationFrame() → 请求下一帧
 *
 * @namespace Engine
 */
const Engine = {
  /**
   * ## requestAnimationFrame 的 ID
   *
   * 用于取消游戏循环。当值为 0 或 null 时表示循环已停止。
   *
   * @type {number | null}
   */
  rafId: null,

  /**
   * ## 时间累积器（逻辑时间基准）
   *
   * 用于固定时间步长（fixed update / tick），
   * 累积每帧的 delta time，当超过阈值时执行一次游戏逻辑更新。
   *
   * @default 0
   * @type {number}
   */
  fixedAccumulator: 0,

  /**
   * ## 上一帧的时间戳
   *
   * 用于计算 delta time 和回放时间。
   *
   * @default 0
   * @type {number}
   */
  lastTickTime: 0,

  /**
   * ## 游戏配置
   *
   * 从 configuration.js 导入的全局配置对象。
   * 包含 Mode、Players、Elements、victoryScore 等配置项。
   *
   * @type {object}
   */
  Configuration,

  /**
   * ## 任务调度器实例
   *
   * 管理 delay / interval / sequence 等定时任务。
   * 是所有时间驱动逻辑的核心。
   *
   * @default null
   * @type {Scheduler | null}
   */
  Scheduler: null,

  /**
   * ## 音频系统实例
   *
   * 管理背景音乐和音效的播放、切换。
   *
   * @default null
   * @type {Audio | null}
   */
  Audio: null,

  /**
   * ## 游戏主控实例数组
   *
   * 单人模式包含 1 个 Game 实例，对战模式包含 2 个。
   * 每个 Game 管理独立的状态、输入、UI、回放等子系统。
   *
   * @default [ ]
   * @type {Game[]}
   */
  Games: [],

  /**
   * ## 对战控制器实例
   *
   * 仅在对战模式（versus）下创建。
   * 管理双方的攻击计算、垃圾行发送、计分和胜负判定。
   *
   * @default null
   * @type {BattleController | null}
   */
  Battle: null,

  /**
   * ## 判断是否为对战模式
   *
   * 快捷方法，检查 Configuration.Mode 是否为 "versus"。
   *
   * @returns {boolean} true 表示对战模式
   */
  isVersus: () => Engine.Configuration.Mode === 'versus',

  /**
   * ## 每个 Game 实例的时间累积器
   *
   * Map<Game, timestamp>，用于独立控制每个 Game 的下落速度。
   * 双人对战时两个 Game 可能有不同的速度和状态。
   *
   * @type {Map<Game, number>}
   */
  gameAccumulators: new Map(),

  /**
   * ## 初始化引擎
   *
   * 创建 Scheduler、Audio、Game 等核心实例，并注入相互依赖关系。
   * 这是游戏启动的第一步——在所有子系统创建完成后，
   * 由 launch() 继续执行游戏状态的初始化。
   *
   * ### 初始化顺序
   *
   * 1. 绘制游戏界面 DOM
   * 2. 创建全局调度器 Scheduler
   * 3. 创建音频系统 Audio
   * 4. 根据 Players 配置创建 Game 实例（single 模式 1 个，versus 模式 2 个）
   * 5. 对战模式下创建 BattleController
   *
   * @param {object} options - 初始化配置选项
   * @param {object} options.Elements - UI 元素配置
   * @param {string[]} options.Players - 玩家名称数组
   * @param {string} options.Mode - 游戏模式（"single" | "versus"）
   * @param {number} options.victoryScore - 对战目标分数
   * @returns {void}
   */
  initialize: (options) => {
    // 解构核心配置
    const { Players, Mode, victoryScore, Elements } = options;

    /**
     * ======== 步骤 1：绘制游戏界面 ========
     *
     * 根据配置在 #tetris-container 中生成完整的 DOM 结构：
     * - 棋盘 Canvas
     * - HUD 数据面板
     * - 触屏控制按钮
     * - 对战模式专属元素（覆盖层、记分牌、fly canvas）
     */
    drawInterface(options);

    /**
     * ======== 步骤 2：创建全局调度器 ========
     *
     * Scheduler 是所有时间驱动逻辑的核心。
     * 挂载在 Engine 上，供所有子模块共享。
     */
    Engine.Scheduler = new Scheduler();

    /**
     * ======== 步骤 3：标准化配置 ========
     *
     * 将 Scheduler 注入配置，并标记默认启用 AI 模式。
     * 扩展运算符确保原始 options 不被修改。
     */
    const normalizedOptions = {
      ...options,
      Scheduler: Engine.Scheduler,
      isAIPlayer: true,
    };

    /**
     * ======== 步骤 4：创建音频系统 ========
     *
     * Audio 管理背景音乐和音效。
     * 注入完整的标准化配置。
     */
    Engine.Audio = new Audio(normalizedOptions);

    /**
     * ======== 步骤 5：处理玩家列表 ========
     *
     * 创建 Players 数组的副本。
     * Single 模式移除最后一个玩家（与 drawInterface 中的逻辑对应）。
     */
    const finalPlayers = [...Players];

    if (Mode === 'single') {
      // 单人模式只保留第一个玩家
      finalPlayers.pop();
    }

    /**
     * ======== 步骤 6：创建 Game 实例 ========
     *
     * 遍历 finalPlayers，为每位玩家创建独立的 Game 实例。
     * 每个 Game 实例包含：
     * - Player 信息（name + index）
     * - 完整的子系统（Store、UI、Keyboard、AI 等）
     * - 对 Scheduler 和 Audio 的引用
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

    /**
     * ======== 步骤 7：创建对战控制器 ========
     *
     * 仅在对战模式下创建 BattleController。
     * 注入双方 Game 实例、目标分数、UI 元素配置和玩家列表。
     */
    if (Engine.isVersus()) {
      Engine.Battle = new BattleController({
        games: Engine.Games,
        victoryScore,
        elements: Elements.Battle,
        players: finalPlayers,
      });
    }
  },

  /**
   * ## 启动游戏（完整初始化流程）
   *
   * 执行完整的游戏启动流程：
   *
   * 1. 调用 initialize 创建所有子系统
   * 2. 对每个 Game 实例：
   *    - 初始化棋盘数据
   *    - 加载最高分存档
   *    - 设置初始模式为 main-menu
   *    - 更新 DOM 节点 data-mode 属性
   *    - 适配画布尺寸
   *    - 初始化 HUD 显示
   *    - 延迟渲染主菜单 UI
   *    - 绑定输入设备事件处理器
   * 3. 订阅各模块事件
   * 4. 启动游戏主循环
   *
   * @returns {void}
   */
  launch: () => {
    /**
     * ======== 步骤 1：初始化引擎 ========
     *
     * 创建所有子系统（Scheduler、Audio、Game、BattleController）。
     */
    Engine.initialize(Engine.Configuration);

    /**
     * ======== 步骤 2：初始化每个 Game 实例 ========
     */
    for (const Game of Engine.Games) {
      // 解构 Game 的 Store 和 UI 子系统
      const { Store, UI } = Game;

      /**
       * 1. 初始化棋盘数据。
       * Store.resetBoard() 创建空的棋盘二维数组。
       */
      Store.resetBoard();

      /**
       * 2. 加载本地存储的最高分。
       * 从 localStorage 读取键名为 tetris-high-score 的值。
       */
      Game.loadHighScore();

      /**
       * 3. 设置初始模式为 main-menu，初始化开始界面状态。
       * 包括预览方块队列、初始等级等。
       */
      Game.setBeginningState('main-menu');

      /**
       * 4. 更新 DOM 节点中 data-mode 值，同步当前模式。
       * UI 层根据 data-mode 决定渲染内容。
       */
      UI.updateMode('main-menu');

      /**
       * 5. 根据窗口尺寸适配画布大小。
       * 计算 blockSize、fontSize 等渲染参数。
       */
      UI.resize();

      /**
       * 6. 初始化 HUD 信息显示。
       * 将 Store 中的分数、等级、行数等数据渲染到 DOM。
       */
      UI.updateHud();

      /**
       * 7. 更新控制者标识显示。
       * 显示 Human 或 AI 控制器类型。
       */
      UI.updateController(Store.getController());

      /**
       * 8. 延迟渲染主菜单 UI。
       * 等待字体等资源加载完成后再渲染，避免首屏白屏。
       */
      UI.lazyRender();

      /**
       * 9. 绑定输入设备的事件处理器。
       * 启动键盘、手柄、触屏和 AI 的输入事件监听。
       */
      Game.addEventListeners();
    }

    /**
     * ======== 步骤 3：订阅各模块事件 ========
     *
     * 包括 Engine 自身、Audio、所有 Game、BattleController 的事件订阅。
     */
    Engine.subscribe();

    /**
     * ======== 步骤 4：启动游戏主循环 ========
     *
     * 通过 requestAnimationFrame 启动渲染循环。
     */
    Engine.start();
  },

  /**
   * # 带速度控制的游戏主循环（Game Loop）
   *
   * 使用 `requestAnimationFrame` 驱动的核心渲染循环，
   * 控制游戏的下落节奏、输入处理、渲染和动画更新。
   *
   * ## 帧循环流程（每个 Game 实例）
   *
   * | 步骤 | 操作                     | 说明                                         |
   * | ---- | ------------------------ | -------------------------------------------- |
   * | 1    | Scheduler.tick()         | 驱动调度器，执行到期的定时任务               |
   * | 2    | Replay.syncPlayElapsed() | 同步回放逻辑时钟                             |
   * | 3    | Replay.update()          | 更新回放系统，注入待重放的命令               |
   * | 4    | Gamepad.update()         | 更新手柄输入状态                             |
   * | 5    | Keyboard.update()        | 更新键盘输入状态                             |
   * | 6    | CommandQueue.flush()     | 执行命令队列中的所有待执行命令               |
   * | 7    | Game.tick()              | 执行游戏逻辑（下落/碰撞/消行）               |
   * | 8    | Animations.flush()       | 合并/清理动画队列                            |
   * | 9    | UI.tickHud()             | 更新 HUD 动画                                |
   * | 10   | UI.render()              | 渲染游戏界面                                 |
   * | 11   | Animations.render()      | 叠加渲染动画特效                             |
   * | 12   | requestAnimationFrame()  | 请求下一帧                                   |
   *
   * ## 固定时间步长
   *
   * 游戏逻辑（下落）不是每帧都执行，而是根据当前等级的速度
   * （`Game.getSpeed()`）来控制执行频率：
   * - 低等级时速度慢，下落间隔大（约 1000ms）
   * - 高等级时速度快，下落间隔小（最低 120ms）
   *
   * ## 回放特殊处理
   *
   * 当 `Replay.playing` 为 true 时，跳过游戏逻辑 tick，
   * 因为回放系统会通过注入 command 来驱动游戏状态。
   *
   * ## 双人对战
   *
   * 每个 Game 使用独立的时间累积器（gameAccumulators Map），
   * 两个 Game 各自独立计算下落时机，互不影响。
   *
   * @param {number} timestamp - requestAnimationFrame 传入的当前时间戳（毫秒）
   * @returns {void}
   */
  tick: (timestamp) => {
    // 解构 Games 数组和 Scheduler 实例
    const { Games, Scheduler } = Engine;

    /**
     * 首次运行时初始化时间基准。
     * 为所有 Game 实例设置初始累积时间。
     */
    if (!Engine.lastTickTime) {
      Engine.lastTickTime = timestamp;

      for (const Game of Games) {
        Engine.gameAccumulators.set(Game, timestamp);
      }
    }

    // 更新上一帧时间戳
    Engine.lastTickTime = timestamp;

    /**
     * ======== 步骤 1：驱动调度器 ========
     *
     * 执行所有到期的定时任务（delay、interval、sequence）。
     * 这包括 AI 的决策循环、音效序列、动画时序等。
     */
    Scheduler.tick(timestamp);

    /**
     * ======== 步骤 2-11：每个 Game 实例的帧更新 ========
     */
    for (const Game of Games) {
      // 解构 Game 的各子系统
      const { UI, Replay, Gamepad, Keyboard, Animations, CommandQueue } = Game;

      /**
       * 检查是否有阻塞动画（如消行动画、倒计时、升级特效、垃圾行动画）。
       * 阻塞动画期间暂停游戏逻辑，防止玩家在动画期间操作。
       */
      const isBlocked = Animations.hasBlocking();

      /**
       * ======== 步骤 2：同步回放逻辑时钟 ========
       *
       * 给 playElapsed 加上 delta 上限，
       * 保证切换标签页后回放能平滑加速追赶，不会瞬间跳过太多帧。
       */
      Replay.syncPlayElapsed({
        timestamp: Engine.lastTickTime,
        isBlocked,
      });

      /**
       * ======== 步骤 3：回放更新 ========
       *
       * 如果正在回放，Replay.update() 会根据回放时钟将到期的命令
       * 注入到命令队列中。这是回放的核心驱动逻辑。
       */
      Replay.update({
        speed: Game.getSpeed(),
        timestamp: Engine.lastTickTime,
      });

      /**
       * ======== 步骤 4：手柄状态更新 ========
       *
       * 每帧读取手柄输入状态，将新的输入转换为 command 入队。
       * 使用可选链，手柄未连接时跳过。
       */
      Gamepad?.update?.(timestamp);
      Keyboard?.update?.();

      /**
       * ======== 步骤 5：执行命令队列 ========
       *
       * 将本帧累积的所有 command（来自键盘、手柄、AI、回放）
       * 一次性执行，确保所有输入在同一帧内生效。
       */
      CommandQueue.flush();

      // 获取当前 Game 的时间累积器
      const accumulator = Engine.gameAccumulators.get(Game) || timestamp;
      // 计算距离上次逻辑更新的时间差
      const stepDelta = timestamp - accumulator;

      /**
       * ======== 步骤 6：游戏逻辑更新 ========
       *
       * 仅当以下条件全部满足时才执行：
       * - 不在回放中（回放由 Replay.update 驱动）
       * - 距离上次逻辑更新的时间 >= 当前等级的下落间隔
       *
       * 这实现了基于等级的下落速度控制。
       */
      if ((!accumulator || stepDelta > Game.getSpeed()) && !Replay.playing) {
        // 执行游戏逻辑：方块自动下落、碰撞检测、消行等
        Game.tick(isBlocked);
        // 重置时间累积器
        Engine.gameAccumulators.set(Game, timestamp);
      }

      /**
       * ======== 步骤 7：合并/清理动画队列 ========
       *
       * 合并待注册动画到活跃队列，移除已结束的动画。
       * 不执行帧更新，时间逻辑全部交给 Scheduler。
       */
      Animations.flush();

      /**
       * ======== 步骤 8：更新 HUD 动画 ========
       *
       * 更新分数、等级等 HUD 显示的数字动画效果。
       */
      UI.tickHud();

      /**
       * ======== 步骤 9：渲染游戏界面 ========
       *
       * 绘制棋盘、当前方块、ghost piece、预览方块等核心游戏画面。
       */
      UI.render();

      /**
       * ======== 步骤 10：叠加渲染动画特效 ========
       *
       * 在游戏界面上叠加渲染消行闪光、升级特效、垃圾行预警/闪烁等动画层。
       * 按 layer 值从小到大渲染。
       */
      Animations.render();
    }

    // 更新逻辑时间基准
    Engine.fixedAccumulator = timestamp;

    /**
     * ======== 步骤 11：请求下一帧 ========
     *
     * 递归调用自身，形成持续的帧循环。
     */
    Engine.rafId = requestAnimationFrame(Engine.tick);
  },

  /**
   * ## 订阅各模块事件
   *
   * 依次订阅 Engine 自身、Audio 音频系统、
   * 所有 Game 实例、BattleController 的事件。
   * 在 launch 时调用一次。
   *
   * @returns {void}
   */
  subscribe: () => {
    // 解构所有需要订阅的模块
    const { Games, Audio, Battle } = Engine;

    // 订阅 Engine 内部的 dispatch 事件
    Engine._subscribe();

    // 订阅音频系统事件（背景音乐、音效）
    Audio?.subscribe?.();

    // 订阅所有 Game 实例的事件（游戏流程、方块操作、动画等）
    for (const Game of Games) {
      Game?.subscribe?.();
    }

    // 对战模式下订阅 BattleController 的事件（攻击、垃圾行、胜负等）
    if (Engine.isVersus()) {
      Battle?.subscribe?.();
    }
  },

  /**
   * ## 取消订阅各模块事件
   *
   * 取消所有已订阅的事件，在 destroy 时调用。
   * 防止内存泄漏和误触发。
   *
   * @returns {void}
   */
  unsubscribe: () => {
    // 解构所有需要取消订阅的模块
    const { Games, Audio, Battle } = Engine;

    // 取消 Engine 内部的 dispatch 事件
    Engine._unsubscribe();

    // 取消音频系统事件订阅
    Audio?.unsubscribe?.();

    // 取消所有 Game 实例的事件订阅
    for (const Game of Games) {
      Game?.unsubscribe?.();
    }

    // 对战模式下取消 BattleController 的事件订阅
    if (Engine.isVersus()) {
      Battle?.unsubscribe?.();
    }
  },

  /**
   * ## Engine 内部事件订阅
   *
   * 为每个 Game 实例订阅 `dispatch:command` 和 `dispatch:input`
   * 两个核心事件，它们是整个输入系统的入口。
   *
   * @private
   * @returns {void}
   */
  _subscribe: () => {
    const { Games } = Engine;

    for (const Game of Games) {
      /**
       * ======== dispatch:command 事件 ========
       *
       * 处理回放系统的命令执行。
       * 注入动画阻塞状态，统一走 dispatchCommand 管线。
       * 根据当前 mode 路由到对应的 action handler。
       */
      Game.on(`dispatch:command`, Engine._onDispatchCommand);

      /**
       * ======== dispatch:input 事件 ========
       *
       * 处理键盘、手柄、AI 等实时输入。
       * 注入动画阻塞状态和回放时间戳。
       * 将原始输入转换为标准 game command 后入队。
       */
      Game.on(`dispatch:input`, Engine._onDispatchInput);
    }
  },

  /**
   * ## Engine 内部事件取消订阅
   *
   * 取消 `dispatch:command` 和 `dispatch:input` 事件的监听。
   *
   * @private
   * @returns {void}
   */
  _unsubscribe: () => {
    const { Games } = Engine;

    for (const Game of Games) {
      // 取消回放系统命令执行的监听
      Game.off(`dispatch:command`, Engine._onDispatchCommand);

      // 取消实时输入处理的监听
      Game.off(`dispatch:input`, Engine._onDispatchInput);
    }
  },

  /**
   * ## 命令分发处理器
   *
   * 处理回放系统的命令执行。
   * 检查当前是否有阻塞动画，注入阻塞状态后交由 dispatchCommand 处理。
   *
   * ### 阻塞动画列表
   *
   * - clear-lines：消行动画播放中
   * - countdown：倒计时动画播放中
   * - level-up：升级特效播放中
   *
   * @private
   * @param {object} cmd - 命令对象
   * @param {object} cmd.payload - 命令负载
   * @param {object} cmd.payload.Game - 目标 Game 实例
   * @returns {void}
   */
  _onDispatchCommand: (cmd) => {
    // 从命令中解构负载
    const { payload } = cmd;
    const { Game } = payload;
    // 解构 Game 的动画系统和状态存储
    const { Animations, Store } = Game;

    // 获取当前游戏模式
    const mode = Store.getMode();

    // 注入阻塞状态，供 action handler 内部判断
    payload.isBlocked = Animations.hasBlocking([
      'clear-lines',
      'countdown',
      'level-up',
    ]);

    /**
     * 将 replay command 注入命令系统。
     * 统一走 dispatchCommand 管线，根据 mode 路由到对应 handler。
     */
    dispatchCommand(cmd, { mode });
  },

  /**
   * ## 输入分发处理器
   *
   * 处理键盘、手柄、AI 等实时输入。
   * 检查阻塞动画状态，计算回放时间戳，交由 dispatchInput 处理。
   *
   * ### 阻塞动画列表
   *
   * - clear-lines：消行动画播放中
   * - countdown：倒计时动画播放中
   * - level-up：升级特效播放中
   *
   * @private
   * @param {object} input - 输入对象
   * @param {object} input.payload - 输入负载
   * @param {object} input.payload.Game - 目标 Game 实例
   * @returns {void}
   */
  _onDispatchInput: (input) => {
    // 从输入中解构负载
    const { payload } = input;
    const { Game } = payload;
    // 解构 Game 的动画系统和回放系统
    const { Animations, Replay } = Game;

    /**
     * 检查是否有阻塞动画。
     * 消行、倒计时、升级动画期间暂停输入处理。
     */
    const isBlocked = Animations.hasBlocking([
      'clear-lines',
      'countdown',
      'level-up',
    ]);

    /**
     * 计算回放时间戳。
     * 当前时间 - 回放开始时间 = 回放已播放时长。
     */
    const ms = Engine.lastTickTime - Replay.startTime;

    // 将输入事件分派到对应的输入处理器
    dispatchInput(input, { isBlocked, ms });
  },

  /**
   * ## 启动游戏主循环
   *
   * 使用 requestAnimationFrame 启动渲染循环。
   * 第一帧会初始化时间基准。
   *
   * @returns {void}
   */
  start: () => {
    Engine.rafId = requestAnimationFrame(Engine.tick);
  },

  /**
   * ## 停止游戏循环
   *
   * 取消 requestAnimationFrame 回调，重置时间状态。
   * 从暂停恢复时调用 restart() 重新启动。
   *
   * @returns {void}
   */
  stop: () => {
    // 1. 如果没有正在运行的 RAF，直接退出
    if (!Engine.rafId) {
      return;
    }

    // 2. 取消浏览器帧循环回调
    cancelAnimationFrame(Engine.rafId);

    // 3. 清除 RAF 标识，标记循环已停止
    Engine.rafId = 0;

    /**
     * 4. 重置时间状态，避免恢复时出现跳帧/加速。
     * - lastTickTime 清零：下一帧重新初始化时间基准
     * - gameAccumulators 清空：累积时间归零
     */
    Engine.lastTickTime = 0;
    Engine.gameAccumulators?.clear?.();
  },

  /**
   * ## 重启游戏循环
   *
   * 停止当前循环后重新启动。
   * 用于从暂停恢复或标签页切回。
   *
   * @returns {void}
   */
  restart: () => {
    // 清除之前的游戏循环，防止多个 requestAnimationFrame 同时运行
    Engine.stop();

    // 以新的时间基准启动游戏循环
    Engine.start();
  },

  /**
   * ## 销毁引擎
   *
   * 清理所有资源：
   * 1. 停止游戏循环
   * 2. 取消所有事件订阅
   * 3. 移除所有输入设备事件监听
   * 4. 销毁所有 Game 实例
   * 5. 重置子模块引用
   *
   * @returns {void}
   */
  destroy: () => {
    const { Games } = Engine;

    // 1. 停止游戏循环
    Engine.stop();

    // 2. 取消订阅和事件绑定
    Engine.unsubscribe();

    for (const Game of Games) {
      // 3. 移除 DOM 事件绑定（键盘、手柄、触屏、AI）
      Game?.removeEventListeners?.();

      // 4. 销毁 Game 实例
      Game?.destroy?.();
    }

    /**
     * 5. 重置子模块引用。
     * 清空所有模块实例，释放内存。
     */
    Engine.Audio = null;
    Engine.Scheduler = null;
    Engine.Games = [];
  },
};

export default Engine;
