import EventBus from '@/lib/core/event-bus/index.js';
import Game from '@/lib/game';
import Replay from '@/lib/runtime/replay-runtime.js';
import UI from '@/lib/services/ui';
import Input from '@/lib/services/input';
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
    const { store } = Game;

    // 1. 初始化棋盘数据
    store.resetBoard();

    // 2. 加载最高分
    Game.loadHighScore();

    // 3. 设置初始模式
    store.setState({
      mode: 'main-menu',
      score: 0,
      lines: 0,
      level: 1,
    });

    const state = store.getState();

    // 4. 适配画布尺寸
    UI.resize(state);

    // 6. 初始化 HUD
    UI.updateHud(state);

    // 7. 延迟渲染主菜单 UI
    UI.lazyRender(state);

    // 8. Replay 初始化，订阅相关事件
    Replay.init();

    // 9. 绑定输入系统事件
    Input.Keyboards.bindEvents();

    // 10. 绑定设备层事件
    Input.Gamepad.bindEvents();

    // 11. 订阅 replay 的消息
    EventBus.on('replay:command', ({ cmd, context }) => {
      /**
       * ## 将 replay command 注入命令系统
       *
       * 统一走 dispatchCommand 管线
       */
      dispatchCommand(cmd, context);
    });

    // 12. 启动游戏循环
    Engine.start();
  },

  dispatchInput,
  dispatchCommand,

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
