import EventBus from '@/lib/core/event-bus';
import Game from '@/lib/game';
import UI from '@/lib/services/ui';
import Input from '@/lib/services/input';
import Replay from '@/lib/runtime/replay-runtime.js';
import AudioRuntime from '@/lib/runtime/audio-runtime.js';
import GameRuntime from '@/lib/runtime/game-runtime.js';
import UIRuntime from '@/lib/runtime/ui-runtime.js';
import createAnimationSystem from '@/lib/runtime/animation-runtime.js';
import startGameLoop from '@/lib/engine/start-game-loop.js';
import restartGameLoop from '@/lib/engine/restart-game-loop.js';
import stopGameLoop from '@/lib/engine/stop-game-loop.js';
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
  accumulator: 0,

  // 上一帧时间戳
  timestamp: 0,

  Animations: createAnimationSystem(),

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
    // 1. 初始化棋盘数据
    Game.store.resetBoard();

    // 2. 加载最高分
    Game.loadHighScore();

    // 3. 设置初始模式
    Game.setBeginningState('main-menu');

    const state = Game.store.getState();

    // 4. 适配画布尺寸
    UI.resize(state);

    // 6. 初始化 HUD
    UI.updateHud(state);

    // 7. 延迟渲染主菜单 UI
    UI.lazyRender(state);

    // 8. 初始化，Keyboard 和 Gamepad
    Engine.Keyboard = new Input.Keyboard(state);
    Engine.Gamepad = new Input.Gamepad();

    // 9. 绑定输入系统事件
    Engine.Keyboard.addEventListeners();

    // 10. 绑定设备层事件
    Engine.Gamepad.addEventListeners();

    // 11. 各个模块的事件订阅
    Engine.subscribe();

    // 12. 启动游戏循环
    Engine.start();
  },

  subscribe: () => {
    Replay.subscribe();
    AudioRuntime.subscribe();
    GameRuntime.subscribe();
    UIRuntime.subscribe();

    EventBus.on('dispatch:command', (cmd) => {
      const mode = Game.store.getMode();

      /**
       * ## 将 replay command 注入命令系统
       *
       * 统一走 dispatchCommand 管线
       */
      dispatchCommand(cmd, mode);
    });

    EventBus.on('dispatch:input', (input) => {
      const hasBlocking = Engine.Animations.hasBlocking([
        'countdown',
        'level-up',
      ]);
      const ms = Engine.timestamp - Replay.startTime;

      dispatchInput(input, { hasBlocking, ms });
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
