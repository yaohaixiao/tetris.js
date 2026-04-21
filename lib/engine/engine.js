import EngineState from '@/lib/engine/state/engine-state.js';
import startGameLoop from '@/lib/engine/start-game-loop.js';
import restartGameLoop from '@/lib/engine/restart-game-loop.js';
import stopGameLoop from '@/lib/engine/stop-game-loop.js';
import {
  renderAnimations,
  updateAnimations,
} from '@/lib/animations/animations-system.js';
import bindEvents from '@/lib/input/bind-events.js';
import resetBoard from '@/lib/engine/state/reset-board.js';
import loadHighScore from '@/lib/engine/state/load-high-score.js';
import saveHighScore from '@/lib/engine/state/save-high-score.js';
import setMode from '@/lib/engine/state/set-mode.js';
import getMode from '@/lib/engine/state/get-mode.js';
import setLevel from '@/lib/engine/state/set-level.js';
import lazyRenderMainMenu from '@/lib/ui/scenes/main-menu-scene/lazy-render-main-menu.js';
import renderScene from '@/lib/ui/scene-manager/render-scene.js';
import renderHud from '@/lib/ui/hud/render-hud.js';
import resize from '@/lib/ui/core/resize.js';

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

  // 游戏状态
  state: EngineState,

  // 状态管理模块
  resetBoard,
  loadHighScore,
  saveHighScore,
  getMode,
  setMode,
  setLevel,

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
    const { state } = Engine;

    // 1. 初始化棋盘
    resetBoard();

    // 2. 加载最高分
    loadHighScore();

    // 3. 设置初始模式
    setMode('main-menu');

    // 4. 初始化基础状态
    state.score = 0;
    state.lines = 0;
    state.level = 1;

    // 5. 适配画布尺寸
    Engine.resize();

    // 6. 初始化 HUD
    renderHud(state.score, state.lines, state.level, state.highScore);

    // 7. 延迟渲染主菜单 UI
    lazyRenderMainMenu(state);

    // 8. 绑定输入系统
    bindEvents();

    // 9. 启动游戏循环
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
    renderScene(Engine.state);
  },

  /**
   * ## 更新阶段
   *
   * 逻辑更新 + 动画更新（目前仅更新动画）
   *
   * @param {number} delta - 时间间隔
   */
  update: (delta) => {
    updateAnimations(delta);
  },

  /** ## 动画渲染层 */
  animate: () => {
    renderAnimations();
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
