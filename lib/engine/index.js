import Configuration from '@/lib/configuration.js';
// EventBus 模块
import EventBus from '@/lib/core/event-bus';
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
 * 这是整个游戏的核心控制器（Engine Core），负责：
 *
 * - 游戏生命周期控制（launch / start / stop / restart）
 * - 游戏状态管理（EngineState + mode）
 * - 渲染调度（scene + animations + HUD）
 * - 输入绑定（bindEvents）
 * - 存档管理（high score）
 * - 画布自适应（resize）
 *
 * 注意： Engine 本身不负责具体游戏逻辑（如移动/消除）， 只负责“调度 + 生命周期控制”
 */

const Engine = {
  // Runtime 状态
  rafId: null,

  // 时间累积器（用于 fixed update / tick）
  fixedAccumulator: 0,

  // 上一帧时间戳
  lastTickTime: 0,

  Scheduler: null,
  Audio: null,
  Game: null,

  initialize: (options) => {
    Engine.Scheduler = new Scheduler();

    const normalizedOptions = {
      ...options,
      Scheduler: Engine.Scheduler,
    };

    Engine.Audio = new Audio(normalizedOptions);
    Engine.Game = new Game(normalizedOptions);
  },

  /**
   * ## 初始化游戏
   *
   * 执行完整游戏初始化流程：
   *
   * - 重置棋盘
   * - 加载存档
   * - 初始化状态
   * - 绑定输入
   * - 渲染主菜单
   * - 启动 game loop
   */
  launch: () => {
    Engine.initialize(Configuration);

    const { Game } = Engine;
    const { Store, UI } = Game;

    // 1. 初始化棋盘数据
    Store.resetBoard();

    // 2. 加载最高分
    Game.loadHighScore();

    // 3. 设置初始模式
    Game.setBeginningState('main-menu');

    // 4. 更新DOM节点中 data-mode 值，同步当前模式
    UI.updateMode('main-menu');

    // 5. 适配画布尺寸
    UI.resize();

    // 6. 初始化 HUD
    UI.updateHud();

    // 7. 延迟渲染主菜单 UI
    UI.lazyRender();

    // 8. 各个模块的事件订阅
    Engine.subscribe();

    // 8. 启动游戏循环
    Engine.start();
  },

  on: (event, payload) => {
    EventBus.on(event, payload);
  },

  subscribe: () => {
    const { Game, Audio } = Engine;

    Engine._subscribe();
    Audio.subscribe();
    Game.subscribe();
  },

  _subscribe() {
    const { Game } = Engine;
    const { Animations, Replay } = Game;

    Engine.on(`dispatch:command`, (cmd) => {
      const mode = Game.Store.getMode();
      const isBlocked = Animations.hasBlocking([
        'clear-lines',
        'countdown',
        'level-up',
      ]);
      const { payload } = cmd;

      // 注入数据
      payload.isBlocked = isBlocked;

      /**
       * ## 将 replay command 注入命令系统
       *
       * 统一走 dispatchCommand 管线
       */
      dispatchCommand(cmd, { mode });
    });

    Engine.on(`dispatch:input`, (input) => {
      // 注意：这里看是否需要调整参数
      const isBlocked = Animations.hasBlocking([
        'clear-lines',
        'countdown',
        'level-up',
      ]);
      const ms = Engine.lastTickTime - Replay.startTime;

      dispatchInput(input, { isBlocked, ms });
    });
  },

  /** ## 启动主循环 */
  start: () => {
    Engine.rafId = requestAnimationFrame(startGameLoop);
  },

  /** ## 停止游戏循环 */
  stop: () => {
    stopGameLoop();
  },

  /** ## 重启游戏循环 */
  restart: () => {
    restartGameLoop();
  },
};

export default Engine;
