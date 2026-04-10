import { gameState, resetBoard, loadHighScore } from './state.js';
import {
  drawBoard,
  drawCurr,
  forceOver,
  resize,
  drawLevelSelect,
  updateUI,
  drawPause,
} from './ui.js';
import { playBGM, stopBGM, sounds, toggleBGM } from './audio.js';
import { spawn, updateSpeed, rotate, move, drop } from './game.js';

// 开始游戏
function start() {
  // 退出等级选择状态，进入游戏状态
  gameState.isSelectLevel = false;

  // 记录初始等级的基准行数
  gameState.baseLines = (gameState.level - 1) * 10;

  // 生成第一个方块
  spawn();
  // 启动背景音乐
  playBGM();
  // 播放等级开始音效
  sounds.levelStart();
  // 启动游戏主循环（按当前等级速度）
  updateSpeed();
}

// 暂停/继续
function togglePause() {
  // 游戏结束或处于等级选择界面时，无法暂停/恢复
  if (gameState.isGameOver || gameState.isSelectLevel) {
    return false;
  }

  // 切换暂停状态
  gameState.isPaused = !gameState.isPaused;

  // 暂停游戏时
  if (gameState.isPaused) {
    // 停止游戏主循环（方块停止下落）
    clearInterval(gameState.gameInterval);
    // 停止背景音乐
    stopBGM();
    // 播放暂停音效
    sounds.pause();
    // 绘制暂停界面（遮罩+暂停文字）
    drawPause();
  } else {
    // 播放恢复音效
    sounds.resume();
    // 重启背景音乐
    playBGM();
    // 重新启动游戏主循环（按当前等级速度）
    updateSpeed();
  }
}

// 重启
function restartGame() {
  // 停止当前背景音乐
  stopBGM();

  // 重置游戏状态
  gameState.isGameOver = false;
  gameState.isPaused = false;
  gameState.score = 0;
  gameState.lines = 0;
  gameState.level = 1;

  // 初始化游戏面板
  resetBoard();
  // 更新UI显示
  updateUI(
    gameState.score,
    gameState.lines,
    gameState.level,
    gameState.highScore,
  );
  // 生成新方块
  spawn();
  // 重启背景音乐
  playBGM();
  // 启动游戏主循环
  updateSpeed();
}

// 返回菜单
function backToMenu() {
  // 停止当前背景音乐
  stopBGM();

  clearInterval(gameState.gameInterval);
  // 重置游戏面板
  resetBoard();

  // 重置游戏状态
  gameState.isGameOver = false;
  gameState.isHiddenMode = false;
  gameState.isSelectLevel = true;
  gameState.score = 0;
  gameState.lines = 0;
  gameState.level = 1;
  gameState.curr = null;
  gameState.next = null;

  // 更新UI显示
  updateUI(
    gameState.score,
    gameState.lines,
    gameState.level,
    gameState.highScore,
  );
  // 绘制等级选择界面
  drawLevelSelect(gameState.level);
}

// 长按P隐藏模式
function startHold() {
  gameState.holdP = setTimeout(() => {
    gameState.isHiddenMode = true;
    gameState.level = 5;
    drawLevelSelect(gameState.level);
  }, 3000);
}

function stopHold() {
  clearTimeout(gameState.holdP);
}

// 处理等级选择按键
function handleLevelSelect(key, lowerKey) {
  if (key >= '1' && key <= '9') {
    gameState.level = Number.parseInt(key, 10);
    sounds.levelSelect();

    drawLevelSelect(gameState.level);
  }

  if (lowerKey === 'p') {
    startHold();
  }

  if (key === 'Enter') {
    start();
  }
}

// 处理全局快捷键 M/R/Q/P
function handleGlobalKeys(lowerKey) {
  const actions = {
    m: toggleBGM,
    r: restartGame,
    q: forceOver,
    p: togglePause,
  };
  const action = actions[lowerKey];

  if (action) {
    action();
    return true;
  }

  return false;
}

// 处理游戏中方向键/空格
function handleGameControls(key) {
  const controls = {
    ArrowLeft: () => move(-1, 0),
    ArrowRight: () => move(1, 0),
    ArrowDown: () => move(0, 1),
    ArrowUp: rotate,
    ' ': drop,
  };
  const action = controls[key];

  if (action) {
    action();
  }
}

// 事件绑定
function bindEvents() {
  globalThis.addEventListener('resize', resize);

  document.addEventListener('keydown', (e) => {
    // 获取按下的键
    const { key } = e;
    const lowerKey = key.toLowerCase();

    // 1.等级选择
    if (gameState.isSelectLevel) {
      handleLevelSelect(key, lowerKey);
      return false;
    }

    // 2.游戏结束
    if (gameState.isGameOver) {
      if (key === 'Enter') {
        backToMenu();
      }

      return false;
    }

    // 3.全局快捷键
    if (handleGlobalKeys(lowerKey)) {
      return false;
    }

    // 4.暂停时不处理游戏操作
    if (gameState.isPaused) {
      return false;
    }

    // 5.游戏控制
    handleGameControls(key);

    drawBoard(gameState.board);
    drawCurr(gameState.curr, gameState.cx, gameState.cy);
  });

  document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'p') {
      stopHold();
    }
  });
}

// 初始化
function init() {
  // 初始化游戏面板
  resetBoard();
  // 读取最高分
  loadHighScore();

  // 初始化各项游戏状态值
  gameState.score = 0;
  gameState.lines = 0;
  gameState.level = 1;
  gameState.isGameOver = false;
  gameState.isPaused = false;
  gameState.isHiddenMode = false;
  gameState.isSelectLevel = true;

  // 初始化时执行一次自适应，确保页面加载时游戏面板适配当前窗口
  resize();
  // 更新页面上的分数、等级等UI显示
  updateUI(
    gameState.score,
    gameState.lines,
    gameState.level,
    gameState.highScore,
  );
  // 绘制等级选择界面
  drawLevelSelect(gameState.level);
  // 绑定游戏界面的所有事件处理器
  bindEvents();
}

// 启动
init();
