import Game from '@/lib/game';
import createAnimationSystem from '@/lib/engine/animation-system.js';
import startGameLoop from '@/lib/engine/start-game-loop.js';
import restartGameLoop from '@/lib/engine/restart-game-loop.js';
import stopGameLoop from '@/lib/engine/stop-game-loop.js';
import renderHud from '@/lib/ui/hud/render-hud.js';
import lazyRenderMainMenu from '@/lib/ui/scenes/main-menu-scene/lazy-render-main-menu.js';
import renderScene from '@/lib/ui/scene-manager/render-scene.js';
import resize from '@/lib/ui/core/resize.js';
import GamepadController from '../input/gamepad-controller.js';
import Keyboard from '../input/keyboard.js';

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
  lastTimestamp: 0,

  Animations: createAnimationSystem(),
  Game,
  Gamepad: new GamepadController(),
  Keyboards: Keyboard,

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
    const { Game, Gamepad, Keyboards } = Engine;
    const { store } = Game;

    // 1. 初始化棋盘
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

    // 5. 适配画布尺寸
    Engine.resize();

    const state = store.getState();

    // 6. 初始化 HUD
    renderHud(state);

    // 7. 延迟渲染主菜单 UI
    lazyRenderMainMenu(state);

    // 8. 绑定输入系统
    Keyboards.bindEvents();

    // 9. 绑定设备层
    Gamepad.bindEvents();

    // 10. 启动游戏循环
    Engine.start();
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

  /**
   * ## 渲染阶段
   *
   * 负责 scene 渲染调度
   */
  render: () => {
    const { Game } = Engine;
    renderScene(Game.store.getState());
  },

  /**
   * ## 更新阶段
   *
   * 逻辑更新 + 动画更新（目前仅更新动画）
   *
   * @param {number} delta - 时间间隔
   */
  update: (delta) => {
    const { Animations } = Engine;
    Animations.update(delta);
  },

  /** ## 动画渲染层 */
  animate: () => {
    const { Animations } = Engine;
    Animations.render();
  },

  /**
   * ## 自适应画布
   *
   * Resize 后立即重新渲染
   */
  resize: () => {
    resize();
    Engine.render();
  },
};

export default Engine;
