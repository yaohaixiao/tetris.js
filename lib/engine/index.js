// EngineRouter - 全局的事件订阅路由处理模块
import EngineRouter from '@/lib/events/router/engine-router.js';
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
 * ============================================================
 *
 * # 模块：Engine 游戏引擎核心
 *
 * ============================================================
 *
 * 这是整个游戏的核心控制器，采用单例对象模式， 作为游戏各子系统之间的中心调度枢纽。
 *
 * ## 核心职责
 *
 * | 职责         | 说明                                 |
 * | :----------- | :----------------------------------- |
 * | 生命周期控制 | launch / start / stop / restart      |
 * | 游戏状态管理 | 通过 EngineStore 管理全局配置和模式  |
 * | 渲染调度     | 协调 scene + animations + HUD 的渲染 |
 * | 输入绑定     | 订阅全局事件、连接输入设备           |
 * | 存档管理     | 加载和保存最高分                     |
 * | 画布自适应   | 响应窗口 resize 事件                 |
 *
 * ## 设计原则
 *
 * Engine 本身不负责具体游戏逻辑（如移动、消除、碰撞检测）， 只负责调度 + 生命周期控制。具体逻辑由 Game 类及其子模块处理。
 *
 * ## 启动流程
 *
 * Engine 的启动分为两个阶段：
 *
 * ### 阶段 1：Engine.initialize() — 创建所有子系统
 *
 * Engine.initialize(options) → new EngineStore(options) // 创建全局状态管理器 → new
 * EngineRenderer({ Store }) // 创建 DOM 界面渲染器 → EngineRenderer.render() // 绘制游戏
 * DOM 界面 → new Scheduler() // 创建全局任务调度器 → new Audio(normalizedOptions) //
 * 创建音频系统 → [for each player] // 为每位玩家创建 Game 实例 → new Game({ Player, ... }) →
 * Game.constructor() → Base.inject() // 注入所有依赖 → Game.initialize() // 创建 Game
 * 的所有子系统 → Game.launch() // 初始化游戏状态 → new BattleController() // 对战模式创建对战控制器
 *
 * ### 阶段 2：Engine.launch() — 启动游戏循环
 *
 * Engine.launch(options) → Engine.initialize(options) // 阶段 1 →
 * Engine.subscribe() // 订阅各模块事件 → Engine.start() // 启动 RAF 游戏主循环
 *
 * ## 模块依赖
 *
 * Engine ├── Store（EngineStore：全局配置状态） ├── Renderer（EngineRenderer：DOM 界面渲染）
 * ├── Router（EngineRouter：引擎事件路由） ├── Scheduler（任务调度器） ├── Audio（音频系统） ├──
 * Game（游戏主控）× N │ ├── Store（GameStore：游戏状态管理） │ ├── Keyboard（键盘输入） │ ├──
 * Gamepad（手柄输入） │ ├── AI（AI 控制器） │ ├── UI（界面渲染） │ ├── Replay（回放系统） │ └──
 * Animations（动画系统） ├── BattleController（对战控制） │ ├── BattleStore（对战状态） │ ├──
 * BattleHUD（记分牌） │ ├── BattleUI（结果面板 + fly canvas） │ └── BattleRouter（事件路由） └──
 * EventBus（全局事件总线）
 *
 * ## 游戏循环架构
 *
 * 每次 requestAnimationFrame 回调: ├── Scheduler.tick() → 驱动所有定时任务（包括 AI loop） ├──
 * [每个 Game]: │ ├── Replay.update() → 回放系统更新 │ ├── Gamepad.update() → 手柄输入更新 │
 * ├── Keyboard.update()→ 键盘输入更新 │ ├── CommandQueue.flush() → 执行命令队列 │ ├──
 * Game.tick() → 游戏逻辑（重力下落） │ ├── Animations.flush()→ 动画队列维护 │ ├── UI.tickHud()
 * → HUD 动画更新 │ ├── UI.render() → 渲染游戏画面 │ └── Animations.render()→ 渲染动画特效 └──
 * requestAnimationFrame() → 请求下一帧
 *
 * ## Battle 模式事件隔离
 *
 * Dispatch:input 和 dispatch:command 事件名已添加 Game.id scope， 确保 Battle 模式下两个 Game
 * 实例的输入事件不会互相干扰。
 *
 * @namespace Engine
 */
const Engine = {
  // ==================== 静态属性 ====================

  /**
   * RequestAnimationFrame 的 ID。
   *
   * 用于取消游戏循环。当值为 0 或 null 时表示循环已停止。
   *
   * @type {number | null}
   */
  rafId: null,

  /**
   * 时间累积器（逻辑时间基准）。
   *
   * 用于固定时间步长（fixed update / tick）。
   *
   * @default 0
   * @type {number}
   */
  fixedAccumulator: 0,

  /**
   * 上一帧的时间戳。
   *
   * 用于计算 delta time 和回放时间。
   *
   * @default 0
   * @type {number}
   */
  lastTickTime: 0,

  /**
   * 引擎全局状态管理器。
   *
   * 管理游戏模式、玩家列表、对战目标分数、方块渲染风格等全局配置。 在 initialize() 中创建，destroy() 中置 null。
   *
   * @type {EngineStore | null}
   */
  Store: null,

  /**
   * 引擎界面渲染器。
   *
   * 根据 EngineStore 中的配置动态生成完整的游戏 DOM 界面。 在 initialize() 中创建，destroy() 中销毁并置
   * null。
   *
   * @type {EngineRenderer | null}
   */
  Renderer: null,

  /**
   * 引擎事件路由器。
   *
   * 负责订阅和分发引擎级别的全局事件。 在 initialize() 中创建，destroy() 中置 null。
   *
   * @type {EngineRouter | null}
   */
  Router: null,

  /**
   * 任务调度器实例。
   *
   * 管理 delay / interval / sequence 等定时任务， 是所有时间驱动逻辑的核心，包括 AI 的决策循环。 在
   * initialize() 中创建，destroy() 中置 null。
   *
   * @type {Scheduler | null}
   */
  Scheduler: null,

  /**
   * 音频系统实例。
   *
   * 管理背景音乐和音效的播放、切换。 在 initialize() 中创建，destroy() 中置 null。
   *
   * @type {Audio | null}
   */
  Audio: null,

  /**
   * 游戏主控实例数组。
   *
   * 单人模式包含 1 个 Game 实例，对战模式包含 2 个。 每个 Game 管理独立的状态、输入、UI、回放等子系统。 在 initialize()
   * 中创建，destroy() 中清空。
   *
   * @type {Game[]}
   */
  Games: [],

  /**
   * 对战控制器实例。
   *
   * 仅在对战模式（versus）下创建。 在 initialize() 中有条件创建，destroy() 中随 Games 清空。
   *
   * @type {BattleController | null}
   */
  Battle: null,

  /**
   * 每个 Game 实例的时间累积器。
   *
   * Map<Game, timestamp>，用于独立控制每个 Game 的下落速度。 双人对战时两个 Game 各自独立计算下落时机，互不影响。 在
   * tick 首次运行时初始化，stop() 中清空。
   *
   * @type {Map<Game, number>}
   */
  gameAccumulators: new Map(),

  // ==================== 生命周期方法 ====================

  /**
   * ## initialize：初始化引擎
   *
   * 创建 EngineStore、EngineRenderer、Scheduler、Audio、Game 等核心实例， 并注入相互依赖关系。
   *
   * ### 初始化顺序
   *
   * | 步骤 | 操作                          | 说明                                       |
   * | :--- | :---------------------------- | :----------------------------------------- |
   * | 1    | new EngineStore(options)      | 创建全局状态管理器，合并默认配置和传入选项 |
   * | 2    | new EngineRenderer({ Store }) | 创建 DOM 界面渲染器                        |
   * | 3    | EngineRenderer.render()       | 绘制游戏的所有 DOM 界面                    |
   * | 4    | new Scheduler()               | 创建全局任务调度器                         |
   * | 5    | new Audio(normalizedOptions)  | 创建音频系统                               |
   * | 6    | 处理 Players 列表             | Single 模式只保留第一个玩家                |
   * | 7    | new Game(...) × N             | 为每位玩家创建 Game 实例                   |
   * | 8    | new BattleController(...)     | 对战模式下创建对战控制器                   |
   *
   * ### Game 实例的自主启动
   *
   * 每个 Game 实例在构造函数中自动完成全部启动流程： constructor → initialize() → launch()，无需 Engine
   * 额外调用。
   *
   * @param {object} [options={}] - 配置参数对象. Default is `{}`
   * @param {boolean} [options.isRelaunch] - 是否为模式切换后的重新启动
   * @returns {void}
   */
  initialize: (options = {}) => {
    const { isRelaunch = false } = options;

    /*
     * ============================================================
     * 步骤 1：创建引擎全局状态管理器
     * ============================================================
     *
     * EngineStore 合并默认 EngineState 和传入的 options，
     * 通过 structuredClone 深拷贝确保状态独立性。
     * 后续所有模块通过 Engine.Store 访问全局配置。
     * ============================================================
     */
    const Store = new EngineStore(options);

    // 挂载 Store 到 Engine 静态属性
    Engine.Store = Store;

    /*
     * ============================================================
     * 步骤 2：创建界面渲染器并渲染 DOM
     * ============================================================
     *
     * EngineRenderer 根据 Store 中的 Mode 和 Players 配置
     * 生成对应数量和结构的 HTML 模板，一次性注入根容器。
     * ============================================================
     */
    Engine.Renderer = new EngineRenderer({ Store });

    // 绘制游戏的所有 DOM 界面（棋盘、HUD、按钮等）
    Engine.Renderer.render();

    // 创建引擎事件路由器，负责订阅和分发引擎级别的全局事件
    Engine.Router = new EngineRouter({ Engine });

    // 从 Store 获取完整状态
    const state = Store.getState();

    // 解构核心配置，用于后续创建 Game 和 BattleController
    const { Players, Mode, Elements } = state;

    /*
     * ============================================================
     * 步骤 3：创建全局调度器
     * ============================================================
     *
     * Scheduler 是所有时间驱动逻辑的核心，包括：
     * - AI 的决策循环（AIController.loop）
     * - 音效序列
     * - 动画时序（delay / sequence）
     * ============================================================
     */
    Engine.Scheduler = new Scheduler();

    /*
     * ============================================================
     * 步骤 4：标准化配置
     * ============================================================
     *
     * 将 Scheduler 注入配置，并标记默认启用 AI 模式。
     * isAIPlayer = true 表示在 Single 模式下默认创建 AI 控制器，
     * 玩家可通过 S 键切换 human ↔ ai。
     * ============================================================
     */
    const normalizedOptions = {
      ...state,
      isRelaunch,
      Scheduler: Engine.Scheduler,
      isAIPlayer: true,
    };

    /*
     * ============================================================
     * 步骤 5：创建音频系统
     * ============================================================
     *
     * Audio 管理背景音乐和音效。
     * 注入完整的标准化配置（包含 Scheduler 引用）。
     * ============================================================
     */
    Engine.Audio = new Audio(normalizedOptions);

    /*
     * ============================================================
     * 步骤 6：处理玩家列表
     * ============================================================
     *
     * 创建 Players 数组的副本（避免修改原始 state）。
     * Single 模式移除最后一个玩家，只保留第一个。
     * Versus 模式保留全部两个玩家。
     * ============================================================
     */
    const finalPlayers = [...Players];

    if (Mode === 'single') {
      // 单人模式只保留第一个玩家（如 ['human', 'ai'] → ['human']）
      finalPlayers.pop();
    }

    /*
     * ============================================================
     * 步骤 7：创建 Game 实例
     * ============================================================
     *
     * 遍历 finalPlayers，为每位玩家创建独立的 Game 实例。
     * 每个 Game 实例在构造函数中自动完成全部启动流程。
     * ============================================================
     */
    for (const [index, player] of finalPlayers.entries()) {
      Engine.Games.push(
        new Game({
          Player: { index, name: player },
          ...normalizedOptions,
        }),
      );
    }

    /*
     * ============================================================
     * 步骤 8：创建对战控制器
     * ============================================================
     *
     * 仅在对战模式下创建 BattleController。
     * 注入双方 Game 实例、Battle UI 元素配置和玩家列表。
     * ============================================================
     */
    if (Engine.Store.isVersus()) {
      Engine.Battle = new BattleController({
        games: Engine.Games,
        elements: Elements.Battle,
        players: finalPlayers,
      });
    }
  },

  /**
   * ## launch：启动游戏（完整初始化流程）
   *
   * 这是游戏启动的唯一入口，外部只需调用 Engine.launch() 即可。
   *
   * @param {object} [options={}] - 配置参数对象. Default is `{}`
   * @returns {void}
   */
  launch: (options = {}) => {
    /*
     * ============================================================
     * 步骤 1：初始化引擎
     * ============================================================
     *
     * 创建所有子系统。Game 实例在此步骤中完成全部初始化，
     * 包括子系统创建和游戏状态初始化（棋盘、HUD、事件绑定）。
     * ============================================================
     */
    Engine.initialize(options);

    /*
     * ============================================================
     * 步骤 2：订阅各模块事件
     * ============================================================
     *
     * 包括 Engine._subscribe()、Audio.subscribe()、
     * 以及对战模式下的 Battle.subscribe()。
     * ============================================================
     */
    Engine.subscribe();

    /*
     * ============================================================
     * 步骤 3：启动游戏主循环
     * ============================================================
     *
     * 通过 requestAnimationFrame 启动渲染循环。
     * 第一帧会初始化时间基准（lastTickTime、gameAccumulators）。
     * ============================================================
     */
    Engine.start();
  },

  // ==================== 游戏主循环 ====================

  /**
   * ## tick：带速度控制的游戏主循环
   *
   * 使用 requestAnimationFrame 驱动的核心渲染循环， 控制游戏的下落节奏、输入处理、渲染和动画更新。
   *
   * ## 帧循环流程
   *
   * | 步骤 | 操作                     | 说明                                           |
   * | :--- | :----------------------- | :--------------------------------------------- |
   * | 1    | Scheduler.tick()         | 驱动调度器，执行到期的定时任务（含 AI loop）   |
   * | 2    | Replay.syncPlayElapsed() | 同步回放逻辑时钟                               |
   * | 3    | Replay.update()          | 更新回放系统，注入待重放的命令                 |
   * | 4    | Gamepad.update()         | 更新手柄输入状态                               |
   * | 5    | Keyboard.update()        | 更新键盘输入状态                               |
   * | 6    | CommandQueue.flush()     | 执行命令队列中的所有待执行命令                 |
   * | 7    | Game.tick()              | 执行游戏逻辑（下落/碰撞/消行），按速度间隔执行 |
   * | 8    | Animations.flush()       | 合并/清理动画队列，移除已完成的动画            |
   * | 9    | UI.tickHud()             | 更新 HUD 动画（分数跳动、连击显示）            |
   * | 10   | UI.render()              | 渲染游戏画面（棋盘、方块、ghost、网格）        |
   * | 11   | Animations.render()      | 叠加渲染动画特效（消行、升级、垃圾行预警等）   |
   * | 12   | requestAnimationFrame()  | 请求下一帧，形成循环                           |
   *
   * ## 固定时间步长
   *
   * 游戏逻辑（下落）不是每帧都执行，而是根据当前等级的速度来控制执行频率：
   *
   * - 低等级时速度慢，下落间隔大（约 1000ms）
   * - 高等级时速度快，下落间隔小（最低 120ms）
   *
   * ## 双人对战
   *
   * 每个 Game 使用独立的时间累积器（gameAccumulators Map）， 两个 Game 各自独立计算下落时机，互不影响。
   *
   * @param {number} timestamp - 当前时间戳（毫秒）
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
     * ============================================================
     * 步骤 1：驱动调度器
     * ============================================================
     *
     * 执行所有到期的定时任务（delay、interval、sequence）。
     * 这包括 AI 的决策循环、音效序列和动画时序。
     * AI 的 loop 在此处被 Scheduler 触发，而非在 Game.tick 中。
     * ============================================================
     */
    Scheduler.tick(timestamp);

    // 步骤 2-11：每个 Game 实例的帧更新
    for (const Game of Games) {
      Game.flush(timestamp, Engine.lastTickTime, Engine.gameAccumulators);
    }

    // 更新全局逻辑时间基准
    Engine.fixedAccumulator = timestamp;

    // 步骤 12：请求下一帧，形成游戏循环
    Engine.rafId = requestAnimationFrame(Engine.tick);
  },

  // ==================== 事件订阅管理 ====================

  /**
   * ## subscribe：订阅各模块事件
   *
   * 依次订阅 Engine 自身、Audio 音频系统、所有 Game 实例、 BattleController 的事件。在 launch 时调用一次。
   *
   * @returns {void}
   */
  subscribe: () => {
    const { Audio, Battle } = Engine;

    // 订阅 Engine 内部的 dispatch 事件 + 全局 engine 事件
    Engine._subscribe();

    // 订阅音频系统事件（背景音乐、音效）
    Audio?.subscribe?.();

    // 对战模式下订阅 BattleController 的事件（攻击、垃圾行、胜负等）
    if (Engine.Store.isVersus()) {
      Battle?.subscribe?.();
    }
  },

  /**
   * ## unsubscribe：取消订阅各模块事件
   *
   * 取消所有已订阅的事件，在 destroy 时调用，防止内存泄漏和误触发。
   *
   * @returns {void}
   */
  unsubscribe: () => {
    const { Audio, Battle } = Engine;

    // 取消 Engine 内部事件订阅
    Engine._unsubscribe();

    // 取消音频系统事件订阅
    Audio?.unsubscribe?.();

    // 对战模式下取消 BattleController 事件订阅
    if (Engine.Store.isVersus()) {
      Battle?.unsubscribe?.();
    }
  },

  /**
   * ## _subscribe：Engine 内部事件订阅
   *
   * 为每个 Game 实例订阅 dispatch:command 和 dispatch:input 两个核心事件， 它们是整个输入系统的入口。同时通过
   * Router 订阅全局 engine 事件。
   *
   * ### Battle 模式事件隔离
   *
   * Dispatch:command 和 dispatch:input 事件名使用 Game 的 UUID：
   * game:<uuid>:dispatch:command / game:<uuid>:dispatch:input。 这确保 Battle 模式下两个
   * Game 实例的输入事件不会互相干扰。
   *
   * @private
   * @returns {void}
   */
  _subscribe: () => {
    const { Games } = Engine;

    // 为每个 Game 实例单独订阅 dispatch 事件
    for (const Game of Games) {
      const events = GameEvents(Game.id);

      // dispatch:command 事件：处理回放系统及 Command.execute() 的命令执行
      Game.on(events.DISPATCH_COMMAND, Engine._onDispatchCommand);

      // dispatch:input 事件：处理键盘、手柄、AI 等实时输入
      Game.on(events.DISPATCH_INPUT, Engine._onDispatchInput);
    }

    // 订阅全局 engine 事件（模式切换相关，不区分 Game 实例）
    Engine.Router.subscribe();
  },

  /**
   * ## _unsubscribe：Engine 内部事件取消订阅
   *
   * 取消 dispatch:command、dispatch:input 和全局 engine:* 事件的监听。
   *
   * @private
   * @returns {void}
   */
  _unsubscribe: () => {
    const { Games } = Engine;

    // 取消每个 Game 实例的 dispatch 事件订阅
    for (const Game of Games) {
      const events = GameEvents(Game.id);

      Game.off(events.DISPATCH_COMMAND, Engine._onDispatchCommand);
      Game.off(events.DISPATCH_INPUT, Engine._onDispatchInput);
    }

    // 取消全局 engine 事件订阅
    Engine.Router.unsubscribe();
  },

  // ==================== 事件处理器 ====================

  /**
   * ## _onDispatchCommand：命令分发处理器
   *
   * 检查当前是否有阻塞动画（消行、倒计时、升级）， 注入阻塞状态后交由 dispatchCommand 处理。
   *
   * @private
   * @param {object} cmd - 命令对象
   * @returns {void}
   */
  _onDispatchCommand: (cmd) => {
    const { payload } = cmd;
    const { Game } = payload;
    const { Animations, Store } = Game;

    // 获取当前游戏模式，用于命令路由
    const mode = Store.getMode();

    // 注入阻塞状态，供 action handler 内部判断是否允许执行
    payload.isBlocked = Animations.hasBlocking([
      'clear-lines',
      'countdown',
      'level-up',
    ]);

    // 根据 mode 路由到对应的 action handler
    dispatchCommand(cmd, { mode });
  },

  /**
   * ## _onDispatchInput：输入分发处理器
   *
   * 处理键盘、手柄、AI 等实时输入。 检查阻塞动画状态，计算回放时间戳，交由 dispatchInput 处理。
   *
   * @private
   * @param {object} input - 输入对象
   * @returns {void}
   */
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
    dispatchInput(input, { isBlocked, ms });
  },

  // ==================== 循环控制 ====================

  /**
   * ## start：启动游戏主循环
   *
   * 使用 requestAnimationFrame 启动渲染循环。
   * 第一帧会初始化时间基准（lastTickTime、gameAccumulators）。
   *
   * @returns {void}
   */
  start: () => {
    Engine.rafId = requestAnimationFrame(Engine.tick);
  },

  /**
   * ## stop：停止游戏循环
   *
   * 取消 requestAnimationFrame 回调，重置时间状态。 在暂停、销毁或模式切换时调用。
   *
   * @returns {void}
   */
  stop: () => {
    // 已停止则直接返回
    if (!Engine.rafId) {
      return;
    }

    // 取消 RAF 回调
    cancelAnimationFrame(Engine.rafId);
    Engine.rafId = 0;

    // 重置时间状态，避免恢复时出现跳帧/加速
    Engine.lastTickTime = 0;

    // 清空各 Game 的时间累积器
    Engine.gameAccumulators?.clear?.();
  },

  /**
   * ## restart：重启游戏循环
   *
   * 停止当前循环后重新启动。 用于从暂停恢复或浏览器标签页切回时重置时间基准。
   *
   * @returns {void}
   */
  restart: () => {
    Engine.stop();
    Engine.start();
  },

  /**
   * ## destroy：销毁引擎
   *
   * 清理所有资源，将引擎恢复到初始状态。 通常在模式切换或完全退出游戏时调用。
   *
   * @returns {void}
   */
  destroy: () => {
    const { Games } = Engine;

    // 步骤 1：停止游戏循环
    Engine.stop();

    // 步骤 2：取消所有事件订阅
    Engine.unsubscribe();

    // 步骤 3：销毁每个 Game 实例（移除输入监听、取消事件订阅、销毁 AI）
    for (const Game of Games) {
      Game?.destroy?.();
    }

    // 步骤 4：重置所有子模块引用
    Engine.Audio = null;
    Engine.Scheduler = null;
    Engine.Games = [];
    Engine.Store = null;
    Engine.Router = null;

    // 步骤 5：销毁 EngineRenderer（移除 DOM 元素）
    Engine.Renderer.destroy();
    Engine.Renderer = null;
  },
};

export default Engine;
