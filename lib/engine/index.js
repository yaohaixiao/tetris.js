import Configuration from '@/lib/configuration.js';
// Scheduler 模块
import Scheduler from '@/lib/engine/scheduler.js';
// Audio 模块
import Audio from '@/lib/services/audio';
// Game 模块
import Game from '@/lib/game';
// Battle 模块
import BattleController from '@/lib/battle/battle-controller.js';
// 游戏界面绘制
import drawInterface from '@/lib/engine/draw-interface.js';
// 路由控制模块
import dispatchInput from '@/lib/engine/dispatch-input.js';
import dispatchCommand from '@/lib/engine/dispatch-command.js';

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
 * | **游戏状态管理** | 通过 EngineState + mode 管理游戏阶段 |
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
 *     ├── Scheduler（任务调度器）
 *     ├── Audio（音频系统）
 *     ├── Game（游戏主控）
 *     │   ├── Store（状态管理）
 *     │   ├── Keyboard（键盘输入）
 *     │   ├── Gamepad（手柄输入）
 *     │   ├── AI（AI 控制器）
 *     │   ├── UI（界面渲染）
 *     │   ├── Replay（回放系统）
 *     │   └── Animations（动画系统）
 *     └── EventBus（全局事件总线）
 *
 * @namespace Engine
 */
const Engine = {
  /**
   * ## requestAnimationFrame 的 ID
   *
   * 用于取消游戏循环。
   *
   * @type {number | null}
   */
  rafId: null,

  /**
   * ## 时间累积器
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
   * ## 游戏配置
   *
   * 从 configuration.js 导入的全局配置对象。
   *
   * @type {object}
   */
  Configuration,

  /**
   * ## 任务调度器实例
   *
   * 管理 delay / interval 等定时任务。
   *
   * @default null
   * @type {Scheduler | null}
   */
  Scheduler: null,

  /**
   * ## 音频系统实例
   *
   * 管理背景音乐和音效的播放。
   *
   * @default null
   * @type {Audio | null}
   */
  Audio: null,

  /**
   * ## 游戏主控实例
   *
   * 管理游戏状态、输入、UI、回放等所有子系统。
   *
   * @default [ ]
   * @type {Game[]}
   */
  Games: [],

  /**
   * ## 游戏对战实例
   *
   * 管理游戏状态、输入、UI、回放等所有子系统。
   *
   * @default [ ]
   * @type {object}
   */
  Battle: [],

  isVersus: () => Engine.Configuration.Mode === 'versus',

  gameAccumulators: new Map(),

  /**
   * ## 初始化引擎
   *
   * 创建 Scheduler、Audio、Game 等核心实例， 并注入相互依赖关系。
   *
   * @param {object} options - 初始化配置选项
   * @param {object} options.Elements - UI 元素配置
   * @param {object} options.Level - 等级配置
   * @returns {void}
   */
  initialize: (options) => {
    const { Players, Mode, victoryScore, Elements } = options;

    // 绘制游戏界面
    drawInterface(options);

    // 创建全局调度器
    Engine.Scheduler = new Scheduler();

    // 标准化配置，注入调度器并默认启用 AI 模式
    const normalizedOptions = {
      ...options,
      Scheduler: Engine.Scheduler,
      isAIPlayer: true,
    };

    // 创建音频系统和游戏主控
    Engine.Audio = new Audio(normalizedOptions);

    const finalPlayers = [...Players];

    if (Mode === 'single') {
      finalPlayers.pop();
    }

    // 根据 Players 配置，创建 Game 实例
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

    // 创建对战控制模块
    if (Engine.isVersus()) {
      Engine.Battle = new BattleController({
        games: Engine.Games,
        victoryScore,
        elements: Elements.Battle,
      });
    }
  },

  /**
   * ## 初始化游戏
   *
   * 执行完整的游戏初始化流程：
   *
   * 1. 初始化棋盘数据
   * 2. 加载最高分存档
   * 3. 设置初始模式为 main-menu
   * 4. 更新 DOM 节点 data-mode 属性
   * 5. 适配画布尺寸
   * 6. 初始化 HUD 显示
   * 7. 延迟渲染主菜单 UI（等待字体加载等）
   * 8. 订阅各模块事件
   * 9. 绑定输入设备（Keyboard/Gamepad）的事件处理器
   * 10. 启动游戏主循环
   *
   * @returns {void}
   */
  launch: () => {
    // 使用全局配置初始化引擎
    Engine.initialize(Engine.Configuration);

    // 启动游戏核心逻辑
    for (const Game of Engine.Games) {
      const { Store, UI } = Game;

      // 1. 初始化棋盘数据（创建空棋盘）
      Store.resetBoard();

      // 2. 加载本地存储的最高分
      Game.loadHighScore();

      // 3. 设置初始模式为 main-menu，初始化开始界面状态
      Game.setBeginningState('main-menu');

      // 4. 更新 DOM 节点中 data-mode 值，同步当前模式
      UI.updateMode('main-menu');

      // 5. 根据窗口尺寸适配画布大小
      UI.resize();

      // 6. 初始化 HUD 信息显示（分数、等级等）
      UI.updateHud();
      // 更新控制者标识显示（human / ai）
      UI.updateController(Store.getController());

      // 7. 延迟渲染主菜单 UI（等待字体等资源加载完成）
      UI.lazyRender();

      // 8. 绑定输入设备（Keyboard/Gamepad）的事件处理器
      Game.addEventListeners();
    }

    // 9. 订阅各模块的事件
    Engine.subscribe();

    // 10. 启动游戏主循环
    Engine.start();
  },

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
   * | 8    | Animations.flush()       | 合并/清理动画队列                            |
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
   * @param {number} timestamp - RequestAnimationFrame 传入的当前时间戳（毫秒）
   * @returns {void}
   */
  tick: (timestamp) => {
    const { Games, Scheduler } = Engine;

    // 首次运行时初始化时间基准
    if (!Engine.lastTickTime) {
      Engine.lastTickTime = timestamp;

      // 初始化所有 Game 的累积器
      for (const Game of Games) {
        Engine.gameAccumulators.set(Game, timestamp);
      }
    }

    // 更新上一帧时间戳
    Engine.lastTickTime = timestamp;

    /**
     * ======== 步骤 1：驱动调度器 ========
     *
     * 执行所有到期的定时任务（delay、interval）。 这包括 AI 的决策循环、音效序列等。
     */
    Scheduler.tick(timestamp);

    for (const Game of Games) {
      const { UI, Replay, Gamepad, Keyboard, Animations, CommandQueue } = Game;

      // 检查是否有阻塞动画（如消行动画、倒计时、升级特效）
      const isBlocked = Animations.hasBlocking();

      /**
       * ======== 步骤 2：同步回放逻辑时钟 ========
       *
       * 给 playElapsed 加上 delta 上限， 保证切换标签页后回放能平滑加速追赶，不会瞬间跳过太多帧。
       */
      Replay.syncPlayElapsed({
        timestamp: Engine.lastTickTime,
        isBlocked,
      });

      /**
       * ======== 步骤 3：回放更新 ========
       *
       * 如果正在回放，Replay.update() 会根据回放时钟将到期的命令 注入到命令队列中。这是回放的核心驱动逻辑。
       */
      Replay.update({
        speed: Game.getSpeed(),
        timestamp: Engine.lastTickTime,
      });

      /**
       * ======== 步骤 4：手柄状态更新 ========
       *
       * 每帧读取手柄输入状态，将新的输入转换为 command 入队。
       */
      Gamepad?.update?.(timestamp);
      Keyboard?.update?.();

      /**
       * ======== 步骤 5：执行命令队列 ========
       *
       * 将本帧累积的所有 command（来自键盘、手柄、AI、回放） 一次性执行，确保所有输入在同一帧内生效。
       */
      CommandQueue.flush();

      // 每个 Game 用自己的累积器
      const accumulator = Engine.gameAccumulators.get(Game) || timestamp;
      const stepDelta = timestamp - accumulator;

      /**
       * ======== 步骤 6：游戏逻辑更新 ========
       *
       * 仅当以下条件全部满足时才执行：
       *
       * - 不在回放中（回放由 Replay.update 驱动）
       * - 距离上次逻辑更新的时间 >= 当前等级的下落间隔
       *
       * 这实现了基于等级的下落速度控制。
       */
      if ((!accumulator || stepDelta > Game.getSpeed()) && !Replay.playing) {
        // 执行游戏逻辑：方块自动下落、碰撞检测、消行等
        Game.tick(isBlocked);
        Engine.gameAccumulators.set(Game, timestamp);
      }

      /**
       * ======== 步骤 7：合并/清理动画队列 ========
       *
       * 不再调用 update(delta)，只做队列维护
       */
      Animations.flush();

      /**
       * ======== 步骤 8：更新 HUD 动画 ========
       *
       * 更新分数、等级等 HUD 显示的数字动画。
       */
      UI.tickHud();

      /**
       * ======== 步骤 9：渲染游戏界面 ========
       *
       * 绘制棋盘、当前方块、预览方块等核心游戏画面。
       */
      UI.render();

      /**
       * ======== 步骤 10：叠加渲染动画特效 ========
       *
       * 在游戏界面上叠加渲染消行闪光、升级特效等动画层。
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
   * 依次订阅 Engine 自身、Audio 音频系统、Game 游戏主控的事件。 在 launch 时调用一次。
   *
   * @returns {void}
   */
  subscribe: () => {
    const { Games, Audio, Battle } = Engine;

    Engine._subscribe();
    Audio?.subscribe?.();

    for (const Game of Games) {
      Game?.subscribe?.();
    }

    if (Engine.isVersus()) {
      Battle?.subscribe?.();
    }
  },

  /**
   * ## 取消订阅各模块事件
   *
   * 取消所有已订阅的事件，在 destroy 时调用。
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

    if (Engine.isVersus()) {
      Battle?.unsubscribe?.();
    }
  },

  /**
   * ## Engine 内部事件订阅
   *
   * 订阅 `dispatch:command` 和 `dispatch:input` 两个核心事件， 它们是整个输入系统的入口。
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
       * 处理回放系统的命令执行。 注入动画阻塞状态，统一走 dispatchCommand 管线。
       */
      Game.on(`dispatch:command`, Engine._onDispatchCommand);

      /**
       * ======== dispatch:input 事件 ========
       *
       * 处理键盘、手柄、AI 等实时输入。 注入动画阻塞状态和回放时间戳。
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
      /**
       * ======== dispatch:command 事件 ========
       *
       * 取消回放系统命令执行的监听。
       */
      Game.off(`dispatch:command`, Engine._onDispatchCommand);

      /**
       * ======== dispatch:input 事件 ========
       *
       * 取消实时输入处理的监听。
       */
      Game.off(`dispatch:input`, Engine._onDispatchInput);
    }
  },

  /**
   * ## 命令分发处理器
   *
   * 处理回放系统的命令执行，注入动画阻塞状态后交由 dispatchCommand 处理。
   *
   * @private
   * @param {object} cmd - 命令对象
   * @param {object} cmd.payload - 命令负载
   * @returns {void}
   */
  _onDispatchCommand: (cmd) => {
    const { payload } = cmd;
    const { Game } = payload;
    const { Animations, Store } = Game;

    const mode = Store.getMode();
    // 检查当前是否有阻塞动画（消行、倒计时、升级）
    const isBlocked = Animations.hasBlocking([
      'clear-lines',
      'countdown',
      'level-up',
    ]);

    // 注入阻塞状态，供 action handler 内部判断
    payload.isBlocked = isBlocked;

    /**
     * ## 将 replay command 注入命令系统
     *
     * 统一走 dispatchCommand 管线，根据 mode 路由到对应 handler。
     */
    dispatchCommand(cmd, { mode });
  },

  /**
   * ## 输入分发处理器
   *
   * 处理键盘、手柄、AI 等实时输入，注入动画阻塞状态和回放时间戳后交由 dispatchInput 处理。
   *
   * @private
   * @param {object} input - 输入对象
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
    // 计算回放时间戳（当前时间 - 回放开始时间）
    const ms = Engine.lastTickTime - Replay.startTime;

    dispatchInput(input, { isBlocked, ms });
  },

  /**
   * ## 启动游戏主循环
   *
   * 使用 requestAnimationFrame 启动渲染循环。
   *
   * @returns {void}
   */
  start: () => {
    Engine.rafId = requestAnimationFrame(Engine.tick);
  },

  /**
   * ## 停止游戏循环
   *
   * 取消 requestAnimationFrame 回调。
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

    // 4. 重置时间状态，避免恢复时出现跳帧/加速
    Engine.lastTickTime = 0; // 上一帧时间戳清零
    Engine.gameAccumulators?.clear?.(); // 累积时间清零（用于固定步长更新）
  },

  /**
   * ## 重启游戏循环
   *
   * 停止当前循环后重新启动，用于从暂停恢复或标签页切回。
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
   * 清理所有资源，停止循环，取消订阅，移除事件监听，清空子模块引用。
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
      // 移除 DOM 事件绑定
      Game?.removeEventListeners?.();

      // 销毁对象
      Game?.destroy?.();
    }

    // 3. 重置子模块
    Engine.Audio = null;
    Engine.Scheduler = null;
    Engine.Games = [];
  },
};

export default Engine;
