import EventBus from '@/lib/core/event-bus';
// EngineStore - 引擎全局状态管理器，管理游戏模式、玩家列表、对战目标分数等全局配置
import EngineStore from '@/lib/engine/state/engine-store.js';
// EngineRenderer - 引擎界面渲染器，根据 EngineStore 配置动态生成完整的游戏 DOM 界面
import EngineRenderer from '@/lib/engine/core/engine-renderer.js';
// Scheduler 模块 - 任务调度器，管理所有定时任务
import Scheduler from '@/lib/engine/scheduler.js';
// Audio 模块 - 音频系统，管理背景音乐和音效
import Audio from '@/lib/services/audio';
// Game 模块 - 游戏主控类，管理单个玩家的所有子系统
import Game from '@/lib/game';
// Battle 模块 - 对战控制器，管理双人对战的攻击、计分和胜负
import BattleController from '@/lib/battle/battle-controller.js';
// 路由控制模块 - 将输入事件和命令分发到对应处理器
import dispatchInput from '@/lib/engine/dispatch-input.js';
import dispatchCommand from '@/lib/engine/dispatch-command.js';

import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * # Game Engine Core
 *
 * 这是整个游戏的核心控制器（Engine Core），采用**单例对象**模式， 作为游戏各子系统之间的**中心调度枢纽**。
 *
 * ## 核心职责
 *
 * | 职责             | 说明                                 |
 * | ---------------- | ------------------------------------ |
 * | **生命周期控制** | launch / start / stop / restart      |
 * | **游戏状态管理** | 通过 EngineStore 管理全局配置和模式  |
 * | **渲染调度**     | 协调 scene + animations + HUD 的渲染 |
 * | **输入绑定**     | 订阅全局事件、连接输入设备           |
 * | **存档管理**     | 加载和保存最高分                     |
 * | **画布自适应**   | 响应窗口 resize 事件                 |
 *
 * ## 设计原则
 *
 * Engine 本身**不负责具体游戏逻辑**（如移动、消除、碰撞检测）， 只负责**调度 + 生命周期控制**。具体逻辑由 Game 类及其子模块处理。
 *
 * ## 模块依赖
 *
 *     Engine
 *     ├── Store（EngineStore：全局配置状态）
 *     ├── Renderer（EngineRenderer：DOM 界面渲染）
 *     ├── Scheduler（任务调度器）
 *     ├── Audio（音频系统）
 *     ├── Game（游戏主控）× N
 *     │   ├── Store（GameStore：游戏状态管理）
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
 *     ├── Scheduler.tick()     → 驱动所有定时任务（包括 AI loop）
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
 * ## Battle 模式事件隔离修复
 *
 * Dispatch:input 和 dispatch:command 事件名已添加 Game.id scope：
 *
 * - 事件名格式：`game:<uuid>:dispatch:input` / `game:<uuid>:dispatch:command`
 * - Engine._subscribe() 为每个 Game 实例单独订阅
 * - AI 的 AIController 使用 `GameEvents(Game.id).DISPATCH_INPUT` 发送事件
 * - 确保 Battle 模式下两个 Game 实例的输入事件不会互相干扰
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
   * 用于固定时间步长（fixed update / tick）， 累积每帧的 delta time，当超过阈值时执行一次游戏逻辑更新。
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
   * ## 引擎全局状态管理器
   *
   * 管理游戏模式（single / versus）、玩家列表、对战目标分数、 方块渲染风格等全局配置。替代原来的静态 Configuration 对象，
   * 支持运行时动态修改配置。
   *
   * @type {EngineStore | null}
   */
  Store: null,

  /**
   * ## 引擎界面渲染器
   *
   * 根据 EngineStore 中的配置动态生成完整的游戏 DOM 界面。
   *
   * @type {EngineRenderer | null}
   */
  Renderer: null,

  /**
   * ## 任务调度器实例
   *
   * 管理 delay / interval / sequence 等定时任务。 是所有时间驱动逻辑的核心，包括 AI 的决策循环。
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
   * 单人模式包含 1 个 Game 实例，对战模式包含 2 个。 每个 Game 管理独立的状态、输入、UI、回放等子系统。
   *
   * @default [ ]
   * @type {Game[]}
   */
  Games: [],

  /**
   * ## 对战控制器实例
   *
   * 仅在对战模式（versus）下创建。 管理双方的攻击计算、垃圾行发送、计分和胜负判定。
   *
   * @default null
   * @type {BattleController | null}
   */
  Battle: null,

  /**
   * ## 每个 Game 实例的时间累积器
   *
   * Map<Game, timestamp>，用于独立控制每个 Game 的下落速度。 双人对战时两个 Game 可能有不同的速度和状态。
   *
   * @type {Map<Game, number>}
   */
  gameAccumulators: new Map(),

  /**
   * ## 初始化引擎
   *
   * 创建 EngineStore、EngineRenderer、Scheduler、Audio、Game 等核心实例，
   * 并注入相互依赖关系。这是游戏启动的第一步——在所有子系统创建完成后， 由 launch() 继续执行游戏状态的初始化。
   *
   * ### 初始化顺序
   *
   * 1. 创建 EngineStore（全局状态管理）
   * 2. 创建 EngineRenderer 并渲染 DOM 界面
   * 3. 创建全局调度器 Scheduler
   * 4. 创建音频系统 Audio
   * 5. 根据 Players 配置创建 Game 实例（single 模式 1 个，versus 模式 2 个）
   * 6. 对战模式下创建 BattleController
   *
   * @param {object} [options={}] - 配置参数对象，用于覆盖默认的 EngineState。默认 `{}`. Default
   *   is `{}`
   * @returns {void}
   */
  initialize: (options = {}) => {
    /*
     * ==================== 步骤 1：创建引擎全局状态管理器 ====================
     *
     * EngineStore 合并默认 EngineState 和传入的 options，
     * 通过 structuredClone 深拷贝确保状态独立性。
     */
    const Store = new EngineStore(options);

    // 挂载 Store 到 Engine
    Engine.Store = Store;

    /*
     * ==================== 步骤 2：创建界面渲染器并渲染 DOM ====================
     *
     * EngineRenderer 根据 Store 中的 Mode 和 Players 配置
     * 生成对应数量和结构的 HTML 模板，一次性注入根容器。
     */
    Engine.Renderer = new EngineRenderer({
      Store,
    });

    // 绘制游戏的所有 DOM 界面
    Engine.Renderer.render();

    // 从 Store 获取完整状态
    const state = Store.getState();

    // 解构核心配置
    const { Players, Mode, VictoryScore, Elements } = state;

    /*
     * ==================== 步骤 3：创建全局调度器 ====================
     *
     * Scheduler 是所有时间驱动逻辑的核心，包括 AI 的决策循环。
     * 挂载在 Engine 上，供所有子模块共享。
     */
    Engine.Scheduler = new Scheduler();

    /*
     * ==================== 步骤 4：标准化配置 ====================
     *
     * 将 Scheduler 注入配置，并标记默认启用 AI 模式。
     * 扩展运算符确保原始 options 不被修改。
     */
    const normalizedOptions = {
      ...state,
      Scheduler: Engine.Scheduler,
      isAIPlayer: true,
    };

    /*
     * ==================== 步骤 5：创建音频系统 ====================
     *
     * Audio 管理背景音乐和音效。注入完整的标准化配置。
     */
    Engine.Audio = new Audio(normalizedOptions);

    /*
     * ==================== 步骤 6：处理玩家列表 ====================
     *
     * 创建 Players 数组的副本。
     * Single 模式移除最后一个玩家（只保留第一个）。
     */
    const finalPlayers = [...Players];

    if (Mode === 'single') {
      // 单人模式只保留第一个玩家
      finalPlayers.pop();
    }

    /*
     * ==================== 步骤 7：创建 Game 实例 ====================
     *
     * 遍历 finalPlayers，为每位玩家创建独立的 Game 实例。每个 Game 实例包含：
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
     * 注入双方 Game 实例、目标分数、UI 元素配置和玩家列表。
     */
    if (Engine.Store.isVersus()) {
      Engine.Battle = new BattleController({
        games: Engine.Games,
        VictoryScore,
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
   *
   *    - 初始化棋盘数据
   *    - 加载最高分存档
   *    - 设置初始模式
   *    - 更新 DOM 节点 data-mode 属性
   *    - 适配画布尺寸
   *    - 初始化 HUD 显示
   *    - 更新控制者标识显示
   *    - 延迟渲染主菜单 UI
   *    - 绑定输入设备事件处理器
   * 3. 订阅各模块事件
   * 4. 启动游戏主循环
   *
   * ### isRelaunch 参数
   *
   * - `true`：模式切换后重新启动，进入 main-menu（等级选择界面）
   * - `false`：首次启动或退出对战模式，进入 game-mode（模式选择界面）
   *
   * @param {object} [options={}] - 配置参数对象。默认 `{}`. Default is `{}`
   * @param {boolean} [options.isRelaunch=false] - 是否为模式切换重启动。默认 `false`.
   *   Default is `false`
   * @returns {void}
   */
  launch: (options = {}) => {
    const { isRelaunch = false } = options;

    /*
     * ==================== 步骤 1：初始化引擎 ====================
     *
     * 创建所有子系统（Store、Renderer、Scheduler、Audio、Game、BattleController）。
     */
    Engine.initialize(options);

    /* ==================== 步骤 2：初始化每个 Game 实例 ==================== */
    for (const Game of Engine.Games) {
      const { Store, UI } = Game;

      /*
       * 确定初始模式：
       * - IsRelaunch = true：模式切换后，直接进入 main-menu
       * - IsRelaunch = false：首次启动，使用 Store 中的默认 mode
       */
      const mode = isRelaunch ? 'main-menu' : Store.getMode();

      // 1. 初始化棋盘数据
      Store.resetBoard();

      // 2. 加载本地存储的最高分
      Game.loadHighScore();

      // 3. 设置初始模式，初始化开始界面状态
      Game.setBeginningState(mode);

      // 4. 更新 DOM 节点中 data-mode 值
      UI.updateMode(mode);

      // 5. 根据窗口尺寸适配画布大小
      UI.resize();

      // 6. 初始化 HUD 信息显示
      UI.updateHud();

      // 7. 更新控制者标识显示
      UI.updateController(Store.getController());

      // 8. 延迟渲染主菜单 UI
      UI.lazyRender();

      // 9. 绑定输入设备的事件处理器
      Game.addEventListeners();
    }

    /*
     * ==================== 步骤 3：订阅各模块事件 ====================
     *
     * 包括 Engine 自身、Audio、所有 Game、BattleController 的事件订阅。
     * 此处的订阅使用了带 Game.id scope 的事件名。
     */
    Engine.subscribe();

    /*
     * ==================== 步骤 4：启动游戏主循环 ====================
     *
     * 通过 requestAnimationFrame 启动渲染循环。
     */
    Engine.start();
  },

  /**
   * # 带速度控制的游戏主循环（Game Loop）
   *
   * 使用 `requestAnimationFrame` 驱动的核心渲染循环， 控制游戏的下落节奏、输入处理、渲染和动画更新。
   *
   * ## 帧循环流程（每个 Game 实例）
   *
   * | 步骤 | 操作                     | 说明                           |
   * | ---- | ------------------------ | ------------------------------ |
   * | 1    | Scheduler.tick()         | 驱动调度器，执行到期的定时任务 |
   * | 2    | Replay.syncPlayElapsed() | 同步回放逻辑时钟               |
   * | 3    | Replay.update()          | 更新回放系统，注入待重放的命令 |
   * | 4    | Gamepad.update()         | 更新手柄输入状态               |
   * | 5    | Keyboard.update()        | 更新键盘输入状态               |
   * | 6    | CommandQueue.flush()     | 执行命令队列中的所有待执行命令 |
   * | 7    | Game.tick()              | 执行游戏逻辑（下落/碰撞/消行） |
   * | 8    | Animations.flush()       | 合并/清理动画队列              |
   * | 9    | UI.tickHud()             | 更新 HUD 动画                  |
   * | 10   | UI.render()              | 渲染游戏界面                   |
   * | 11   | Animations.render()      | 叠加渲染动画特效               |
   * | 12   | requestAnimationFrame()  | 请求下一帧                     |
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
   * 每个 Game 使用独立的时间累积器（gameAccumulators Map）， 两个 Game 各自独立计算下落时机，互不影响。
   *
   * @param {number} timestamp - RequestAnimationFrame 传入的当前时间戳（毫秒）
   * @returns {void}
   */
  tick: (timestamp) => {
    const { Games, Scheduler } = Engine;

    // 首次运行时初始化时间基准
    if (!Engine.lastTickTime) {
      Engine.lastTickTime = timestamp;

      for (const Game of Games) {
        Engine.gameAccumulators.set(Game, timestamp);
      }
    }

    // 更新上一帧时间戳
    Engine.lastTickTime = timestamp;

    /*
     * ==================== 步骤 1：驱动调度器 ====================
     *
     * 执行所有到期的定时任务（delay、interval、sequence）。
     * 这包括 AI 的决策循环（AIController.loop）、音效序列、动画时序等。
     * AI 的 loop 在此处被 Scheduler 触发。
     */
    Scheduler.tick(timestamp);

    /* ==================== 步骤 2-11：每个 Game 实例的帧更新 ==================== */
    for (const Game of Games) {
      const { UI, Replay, Gamepad, Keyboard, Animations, CommandQueue } = Game;

      // 检查是否有阻塞动画
      const isBlocked = Animations.hasBlocking();

      // 同步回放逻辑时钟
      Replay.syncPlayElapsed({
        timestamp: Engine.lastTickTime,
        isBlocked,
      });

      // 回放更新
      Replay.update({
        speed: Game.getSpeed(),
        timestamp: Engine.lastTickTime,
      });

      // 手柄状态更新
      Gamepad?.update?.(timestamp);
      Keyboard?.update?.();

      /*
       * ==================== 执行命令队列 ====================
       *
       * 将本帧累积的所有 command（来自键盘、手柄、AI、回放）
       * 一次性执行，确保所有输入在同一帧内生效。
       *
       * Battle 模式修复：
       * 每个 Game 的 CommandQueue 使用独立的 UUID 事件 scope，
       * AI 的命令只会进入 AI Game 的 CommandQueue，
       * Human 的命令只会进入 Human Game 的 CommandQueue。
       */
      CommandQueue.flush();

      // 获取当前 Game 的时间累积器
      const accumulator = Engine.gameAccumulators.get(Game) || timestamp;
      const stepDelta = timestamp - accumulator;

      /*
       * ==================== 游戏逻辑更新 ====================
       *
       * 仅当以下条件全部满足时才执行：
       * - 不在回放中（回放由 Replay.update 驱动）
       * - 距离上次逻辑更新的时间 >= 当前等级的下落间隔
       *
       * 这实现了基于等级的下落速度控制。
       */
      if ((!accumulator || stepDelta > Game.getSpeed()) && !Replay.playing) {
        Game.tick(isBlocked);
        Engine.gameAccumulators.set(Game, timestamp);
      }

      // 合并/清理动画队列
      Animations.flush();

      // 更新 HUD 动画
      UI.tickHud();

      // 渲染游戏界面
      UI.render();

      // 叠加渲染动画特效
      Animations.render();
    }

    // 更新逻辑时间基准
    Engine.fixedAccumulator = timestamp;

    // 请求下一帧
    Engine.rafId = requestAnimationFrame(Engine.tick);
  },

  /**
   * ## 订阅各模块事件
   *
   * 依次订阅 Engine 自身、Audio 音频系统、所有 Game 实例、 BattleController 的事件。在 launch 时调用一次。
   *
   * @returns {void}
   */
  subscribe: () => {
    const { Games, Audio, Battle } = Engine;

    // 订阅 Engine 内部的 dispatch 事件 + 全局 engine 事件
    Engine._subscribe();

    // 订阅音频系统事件（背景音乐、音效）
    Audio?.subscribe?.();

    // 订阅所有 Game 实例的事件（游戏流程、方块操作、动画等）
    for (const Game of Games) {
      Game?.subscribe?.();
    }

    // 对战模式下订阅 BattleController 的事件（攻击、垃圾行、胜负等）
    if (Engine.Store.isVersus()) {
      Battle?.subscribe?.();
    }
  },

  /**
   * ## 取消订阅各模块事件
   *
   * 取消所有已订阅的事件，在 destroy 时调用。防止内存泄漏和误触发。
   *
   * @returns {void}
   */
  unsubscribe: () => {
    const { Games, Audio, Battle } = Engine;

    Engine._unsubscribe();

    Audio?.unsubscribe?.();

    for (const Game of Games) {
      Game?.unsubscribe?.();
    }

    if (Engine.Store.isVersus()) {
      Battle?.unsubscribe?.();
    }
  },

  /**
   * ## Engine 内部事件订阅
   *
   * 为每个 Game 实例订阅 `dispatch:command` 和 `dispatch:input` 两个核心事件， 它们是整个输入系统的入口。
   *
   * ### Battle 模式事件隔离
   *
   * 事件名使用 `GameEvents(Game.id)` 生成，包含 Game 的 UUID：
   *
   * - `game:<uuid>:dispatch:command`
   * - `game:<uuid>:dispatch:input`
   *
   * 这确保 Battle 模式下两个 Game 实例的输入事件不会互相干扰。 AI 的 AIController.loop() 使用
   * `GameEvents(Game.id).DISPATCH_INPUT` 发送事件。
   *
   * @private
   * @returns {void}
   */
  _subscribe: () => {
    const { Games } = Engine;

    for (const Game of Games) {
      const events = GameEvents(Game.id);

      /*
       * dispatch:command 事件：
       * 处理回放系统及 Command.execute() 的命令执行。
       * 注入动画阻塞状态，统一走 dispatchCommand 管线。
       */
      Game.on(events.DISPATCH_COMMAND, Engine._onDispatchCommand);

      /*
       * dispatch:input 事件：
       * 处理键盘、手柄、AI 等实时输入。
       * 注入动画阻塞状态和回放时间戳。
       * 将原始输入转换为标准 game command 后入队。
       */
      Game.on(events.DISPATCH_INPUT, Engine._onDispatchInput);
    }

    // 订阅全局 engine 事件（模式切换相关）
    EventBus.on('engine:update:mode', Engine._onUpdateMode);
    EventBus.on('engine:update:players', Engine._onUpdatePlayers);
    EventBus.on('engine:start', Engine._onStart);
    EventBus.on('engine:exit', Engine._onExit);
  },

  /**
   * ## Engine 内部事件取消订阅
   *
   * 取消 `dispatch:command`、`dispatch:input` 和全局 `engine:*` 事件的监听。
   *
   * @private
   * @returns {void}
   */
  _unsubscribe: () => {
    const { Games } = Engine;

    for (const Game of Games) {
      const events = GameEvents(Game.id);

      Game.off(events.DISPATCH_COMMAND, Engine._onDispatchCommand);
      Game.off(events.DISPATCH_INPUT, Engine._onDispatchInput);
    }

    EventBus.off('engine:update:mode', Engine._onUpdateMode);
    EventBus.off('engine:update:players', Engine._onUpdatePlayers);
    EventBus.off('engine:start', Engine._onStart);
    EventBus.off('engine:exit', Engine._onExit);
  },

  /**
   * ## 命令分发处理器
   *
   * 处理命令的执行。检查当前是否有阻塞动画， 注入阻塞状态后交由 dispatchCommand 处理。
   *
   * ### 阻塞动画列表
   *
   * - Clear-lines：消行动画播放中
   * - Countdown：倒计时动画播放中
   * - Level-up：升级特效播放中
   *
   * @private
   * @param {object} cmd - 命令对象
   * @param {object} cmd.payload - 命令负载
   * @param {object} cmd.payload.Game - 目标 Game 实例
   * @returns {void}
   */
  _onDispatchCommand: (cmd) => {
    const { payload } = cmd;
    const { Game } = payload;
    const { Animations, Store } = Game;

    const mode = Store.getMode();

    // 检查是否有阻塞动画
    const isBlocked = Animations.hasBlocking([
      'clear-lines',
      'countdown',
      'level-up',
    ]);

    // 注入阻塞状态，供 action handler 内部判断
    payload.isBlocked = isBlocked;

    // 根据 mode 路由到对应的 action handler
    dispatchCommand(cmd, { mode });
  },

  /**
   * ## 输入分发处理器
   *
   * 处理键盘、手柄、AI 等实时输入。 检查阻塞动画状态，计算回放时间戳，交由 dispatchInput 处理。
   *
   * ### 阻塞动画列表
   *
   * - Clear-lines：消行动画播放中
   * - Countdown：倒计时动画播放中
   * - Level-up：升级特效播放中
   *
   * @private
   * @param {object} input - 输入对象
   * @param {object} input.payload - 输入负载
   * @param {object} input.payload.Game - 目标 Game 实例
   * @returns {void}
   */
  _onDispatchInput: (input) => {
    const { payload } = input;
    const { Game } = payload;
    const { Animations, Replay } = Game;

    // 检查是否有阻塞动画
    const isBlocked = Animations.hasBlocking([
      'clear-lines',
      'countdown',
      'level-up',
    ]);

    // 计算回放时间戳
    const ms = Engine.lastTickTime - Replay.startTime;

    // 将输入事件分派到对应的输入处理器
    dispatchInput(input, { isBlocked, ms });
  },

  /**
   * ## 处理模式更新事件
   *
   * 当用户在模式选择界面确认选择后触发。 更新 EngineStore 中的 Mode（'single' | 'versus'）。
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {string} payload.mode - 游戏模式
   * @returns {void}
   */
  _onUpdateMode: (payload) => {
    const { mode } = payload;
    Engine.Store.setMode(mode);
  },

  /**
   * ## 处理玩家配置更新事件
   *
   * 当用户在模式选择界面确认选择后触发。 更新 EngineStore 中的 Players 数组。
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {string[]} payload.players - 玩家名称数组
   * @returns {void}
   */
  _onUpdatePlayers: (payload) => {
    const { players } = payload;
    Engine.Store.setPlayers(players);
  },

  /**
   * ## 处理启动事件（模式切换重启动）
   *
   * 销毁当前所有子系统，使用新的配置重新启动引擎。
   *
   * ### 执行流程
   *
   * 1. 深拷贝当前 Store 状态
   * 2. 如果 isRelaunch = false（退出），强制 Mode = 'single'
   * 3. 销毁当前引擎实例
   * 4. 使用新配置重新 launch
   *
   * @private
   * @param {object} [options={}] - 事件参数。默认 `{}`. Default is `{}`
   * @param {boolean} [options.isRelaunch=true] - 是否为模式切换重启动。默认 `true`. Default
   *   is `true`
   * @returns {void}
   */
  _onStart: (options = {}) => {
    const { isRelaunch = true } = options;

    // 深拷贝当前 Store 状态
    const cloned = structuredClone({
      ...Engine.Store.getState(),
      isRelaunch,
    });

    // 退出模式时强制切换为单人模式
    if (!isRelaunch) {
      cloned.Mode = 'single';
    }

    // 销毁当前所有子系统
    Engine.destroy();
    // 使用新配置重新启动
    Engine.launch(cloned);
  },

  /**
   * ## 处理退出事件
   *
   * 从对战模式退出到单人模式选择界面。 重置 Store 状态并重新启动。
   *
   * @private
   * @returns {void}
   */
  _onExit: () => {
    const { Store } = Engine;
    Store.reset();
    Engine._onStart({ isRelaunch: false, Mode: 'single' });
  },

  /**
   * ## 启动游戏主循环
   *
   * 使用 requestAnimationFrame 启动渲染循环。第一帧会初始化时间基准。
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
   *
   * @returns {void}
   */
  stop: () => {
    if (!Engine.rafId) {
      return;
    }

    cancelAnimationFrame(Engine.rafId);
    Engine.rafId = 0;

    // 重置时间状态，避免恢复时出现跳帧/加速
    Engine.lastTickTime = 0;
    Engine.gameAccumulators?.clear?.();
  },

  /**
   * ## 重启游戏循环
   *
   * 停止当前循环后重新启动。用于从暂停恢复或标签页切回。
   *
   * @returns {void}
   */
  restart: () => {
    Engine.stop();
    Engine.start();
  },

  /**
   * ## 销毁引擎
   *
   * 清理所有资源：
   *
   * 1. 停止游戏循环
   * 2. 取消所有事件订阅
   * 3. 移除所有输入设备事件监听
   * 4. 销毁所有 Game 实例
   * 5. 销毁 EngineRenderer
   * 6. 重置所有子模块引用
   *
   * @returns {void}
   */
  destroy: () => {
    const { Games } = Engine;

    Engine.stop();
    Engine.unsubscribe();

    for (const Game of Games) {
      Game?.removeEventListeners?.();
      Game?.destroy?.();
    }

    Engine.Audio = null;
    Engine.Scheduler = null;
    Engine.Games = [];
    Engine.Store = null;

    Engine.Renderer.destroy();
    Engine.Renderer = null;
  },
};

export default Engine;
