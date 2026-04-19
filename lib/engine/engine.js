import EngineState from '@/lib/engine/state/engine-state.js';
import startGameLoop from '@/lib/engine/start-game-loop.js';
import restartGameLoop from '@/lib/engine/restart-game-loop.js';
import stopGameLoop from '@/lib/engine/stop-game-loop.js';
import { renderAnimations, updateAnimations } from '@/lib/animations/system.js';
import bindEvents from '@/lib/input/bind-events.js';
import resetBoard from '@/lib/engine/state/reset-board.js';
import loadHighScore from '@/lib/engine/state/load-high-score.js';
import saveHighScore from '@/lib/engine/state/save-high-score.js';
import setMode from '@/lib/engine/state/set-mode.js';
import getMode from '@/lib/engine/state/get-mode.js';
import lazyRenderMainMenu from '@/lib/ui/scenes/main-menu-scene/lazy-render-main-menu.js';
import renderScene from '@/lib/ui/scene-manager/render-scene.js';
import renderHud from '@/lib/ui/hud/render-hud.js';
import resize from '@/lib/ui/core/resize.js';

const Engine = {
  rafId: null,
  accumulator: 0,
  lastTimestamp: 0,
  state: EngineState,
  resetBoard,
  loadHighScore,
  saveHighScore,
  getMode,
  setMode,
  launch: () => {
    const { state } = Engine;

    // 初始化空游戏棋盘
    resetBoard();
    // 从本地存储加载历史最高分
    loadHighScore();
    // 设置游戏状态：初始化状态 - main-menu
    setMode('main-menu');
    // 初始化游戏基础状态
    state.score = 0;
    state.lines = 0;
    state.level = 1;

    Engine.resize();
    // 更新分数、等级、行数等 UI 展示
    renderHud(state.score, state.lines, state.level, state.highScore);
    // 延迟绘制选择级别界面
    lazyRenderMainMenu(state);

    // 绑定键盘、窗口等所有游戏事件
    bindEvents();

    Engine.start();
  },
  start: () => {
    Engine.rafId = requestAnimationFrame(startGameLoop);
  },
  stop: () => {
    stopGameLoop();
  },
  restart: () => {
    restartGameLoop();
  },
  render: () => {
    renderScene(Engine.state);
  },
  update: (delta) => {
    updateAnimations(delta);
  },
  animate: () => {
    renderAnimations();
  },
  resize: () => {
    resize();
    Engine.render();
  },
};

export default Engine;
