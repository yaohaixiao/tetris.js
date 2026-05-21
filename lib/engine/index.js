import Configuration from '@/lib/configuration.js';
// Scheduler 模块
import Scheduler from '@/lib/engine/scheduler.js';
// Audio 模块
import Audio from '@/lib/services/audio';
// Game 模块
import Game from '@/lib/game';
// 主循环控制模块
import startGameLoop from '@/lib/engine/start-game-loop.js';
import restartGameLoop from '@/lib/engine/restart-game-loop.js';
import stopGameLoop from '@/lib/engine/stop-game-loop.js';
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
   * @default null
   * @type {Game | null}
   */
  Game: null,

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
    Engine.Game = new Game(normalizedOptions);
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
   * 9. 启动游戏主循环
   *
   * @returns {void}
   */
  launch: () => {
    // 使用全局配置初始化引擎
    Engine.initialize(Engine.Configuration);

    const { Game } = Engine;
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

    // 8. 订阅 Engine、Audio、Game 各模块的事件
    Engine.subscribe();

    // 9. 启动游戏主循环
    Engine.start();
  },

  /**
   * ## 订阅各模块事件
   *
   * 依次订阅 Engine 自身、Audio 音频系统、Game 游戏主控的事件。 在 launch 时调用一次。
   *
   * @returns {void}
   */
  subscribe: () => {
    const { Game, Audio } = Engine;

    Engine._subscribe();
    Audio.subscribe();
    Game.subscribe();
  },

  /**
   * ## Engine 内部事件订阅
   *
   * 订阅 `dispatch:command` 和 `dispatch:input` 两个核心事件， 它们是整个输入系统的入口。
   *
   * @private
   * @returns {void}
   */
  _subscribe() {
    const { Game } = Engine;
    const { Animations, Replay, Store } = Game;

    /**
     * ======== dispatch:command 事件 ========
     *
     * 处理回放系统的命令执行。 注入动画阻塞状态，统一走 dispatchCommand 管线。
     */
    Game.on(`dispatch:command`, (cmd) => {
      const mode = Store.getMode();
      // 检查当前是否有阻塞动画（消行、倒计时、升级）
      const isBlocked = Animations.hasBlocking([
        'clear-lines',
        'countdown',
        'level-up',
      ]);
      const { payload } = cmd;

      // 注入阻塞状态，供 action handler 内部判断
      payload.isBlocked = isBlocked;

      /**
       * ## 将 replay command 注入命令系统
       *
       * 统一走 dispatchCommand 管线，根据 mode 路由到对应 handler。
       */
      dispatchCommand(cmd, { mode });
    });

    /**
     * ======== dispatch:input 事件 ========
     *
     * 处理键盘、手柄、AI 等实时输入。 注入动画阻塞状态和回放时间戳。
     */
    Game.on(`dispatch:input`, (input) => {
      // 检查是否有阻塞动画
      const isBlocked = Animations.hasBlocking([
        'clear-lines',
        'countdown',
        'level-up',
      ]);
      // 计算回放时间戳（当前时间 - 回放开始时间）
      const ms = Engine.lastTickTime - Replay.startTime;

      dispatchInput(input, { isBlocked, ms });
    });
  },

  /**
   * ## 启动游戏主循环
   *
   * 使用 requestAnimationFrame 启动渲染循环。
   *
   * @returns {void}
   */
  start: () => {
    Engine.rafId = requestAnimationFrame(startGameLoop);
  },

  /**
   * ## 停止游戏循环
   *
   * 取消 requestAnimationFrame 回调。
   *
   * @returns {void}
   */
  stop: () => {
    stopGameLoop();
  },

  /**
   * ## 重启游戏循环
   *
   * 停止当前循环后重新启动，用于从暂停恢复或标签页切回。
   *
   * @returns {void}
   */
  restart: () => {
    restartGameLoop();
  },
};

export default Engine;
