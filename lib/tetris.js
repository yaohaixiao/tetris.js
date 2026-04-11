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
import { sounds, playBGM, stopBGM, toggleBGM } from './audio.js';
import { updateSpeed, spawn, rotate, move, drop } from './game.js';

/**
 * # 开始游戏（从等级选择界面进入游戏）
 *
 * 初始化游戏状态、生成开始游戏时的第一个方块、播放BGM与开场音效、启动主循环
 *
 * @function start
 * @returns {void}
 */
const start = () => {
  // 退出等级选择状态，进入游戏主界面
  gameState.isSelectLevel = false;
  // 记录初始等级的基准行数，用于后续计算等级提升
  gameState.baseLines = (gameState.level - 1) * 10;

  // 生成第一个下落的方块
  spawn();
  // 播放背景音乐
  playBGM();
  // 播放游戏开始/等级启动音效
  sounds.levelStart();
  // 根据当前等级设置下落速度，启动游戏主循环
  updateSpeed();
};

/**
 * # 切换游戏暂停 / 继续状态
 *
 * 游戏结束或等级选择界面时无法暂停
 *
 * @function togglePause
 * @returns {boolean | undefined} 无效状态时返回 false
 */
const togglePause = () => {
  // 游戏结束或处于等级选择界面时，禁止暂停/继续操作
  if (gameState.isGameOver || gameState.isSelectLevel) {
    return false;
  }

  // 切换暂停状态
  gameState.isPaused = !gameState.isPaused;

  // 执行暂停逻辑
  if (gameState.isPaused) {
    // 清除游戏主循环，方块停止下落
    clearInterval(gameState.gameInterval);
    // 暂停背景音乐
    stopBGM();
    // 播放暂停音效
    sounds.pause();
    // 绘制暂停界面
    drawPause();
  }
  // 执行继续游戏逻辑
  else {
    // 播放恢复游戏音效
    sounds.resume();
    // 恢复背景音乐
    playBGM();
    // 重启游戏主循环，恢复方块下落速度
    updateSpeed();
  }
};

/**
 * # 重新开始游戏
 *
 * 重置所有游戏数据、清空棋盘、生成新方块，并重启游戏主循环与背景音乐
 *
 * @function restartGame
 * @returns {void}
 */
const restartGame = () => {
  // 停止当前背景音乐
  stopBGM();

  // 重置核心游戏状态
  gameState.isGameOver = false;
  gameState.isPaused = false;
  gameState.score = 0;
  gameState.lines = 0;
  gameState.level = 1;

  // 重置游戏棋盘为空
  resetBoard();

  // 刷新分数、等级、行数等 UI 显示
  updateUI(
    gameState.score,
    gameState.lines,
    gameState.level,
    gameState.highScore,
  );

  // 生成第一个新方块
  spawn();
  // 重启背景音乐
  playBGM();
  // 启动游戏主循环（方块自动下落）
  updateSpeed();
};

/**
 * # 返回主菜单（等级选择界面）
 *
 * 停止游戏、清空状态、重置数据，并切换到等级选择界面
 *
 * @function executeDrawLevelSelectCommand
 * @returns {void}
 */
const executeDrawLevelSelectCommand = () => {
  // 停止背景音乐
  stopBGM();

  // 清除游戏主循环定时器
  clearInterval(gameState.gameInterval);
  // 重置游戏棋盘
  resetBoard();

  // 重置所有游戏状态
  gameState.isGameOver = false;
  gameState.isHiddenMode = false;
  // 进入等级选择界面
  gameState.isSelectLevel = true;
  gameState.score = 0;
  gameState.lines = 0;
  gameState.level = 1;
  gameState.curr = null;
  gameState.next = null;

  // 更新分数、等级等 UI 显示
  updateUI(
    gameState.score,
    gameState.lines,
    gameState.level,
    gameState.highScore,
  );

  // 绘制等级选择界面
  drawLevelSelect(gameState.level);
};

/**
 * # 开始长按 P 键计时
 *
 * 长按 3 秒后触发隐藏模式，将等级强制设为 5
 *
 * @function startHold
 * @returns {void}
 */
const startHold = () => {
  // 开启 3 秒长按计时器，超时后进入隐藏模式
  gameState.holdP = setTimeout(() => {
    gameState.isHiddenMode = true;
    gameState.level = 5;
    drawLevelSelect(gameState.level);
  }, 3000);
};

/**
 * # 停止长按 P 键计时
 *
 * 松开按键时清除计时器，不触发隐藏模式
 *
 * @function stopHold
 * @returns {void}
 */
const stopHold = () => {
  // 清除长按计时器
  clearTimeout(gameState.holdP);
  gameState.holdP = null;
};

/**
 * # 处理等级选择界面的按键操作
 *
 * 支持 1-9 设置等级、P 键长按隐藏模式、Enter 开始游戏
 *
 * @function executeLevelSelectionCommand
 * @param {string} key - 原始按键名称
 * @param {string} lowerKey - 转小写后的按键名称
 * @returns {void}
 */
const executeLevelSelectionCommand = (key, lowerKey) => {
  // 数字键 1-9 设置对应等级
  if (key >= '1' && key <= '9') {
    gameState.level = Number.parseInt(key, 10);
    sounds.levelSelect();
    drawLevelSelect(gameState.level);
  }

  // 按住 P 键开始计时（触发隐藏模式）
  if (lowerKey === 'p') {
    startHold();
  }

  // Enter 键确认并开始游戏
  if (key === 'Enter') {
    start();
  }
};

/**
 * # 处理全局快捷键（M/R/Q/P）
 *
 * @function executeShortcutsCommand
 * @param {string} lowerKey - 转小写后的按键
 * @returns {boolean} 是否触发了快捷键
 */
const executeShortcutsCommand = (lowerKey) => {
  // 全局快捷操作映射
  const commands = {
    m: toggleBGM, // M: 切换背景音乐
    r: restartGame, // R: 重新开始游戏
    q: forceOver, // Q: 强制结束游戏
    p: togglePause, // P: 暂停/继续游戏
  };
  const command = commands[lowerKey];

  if (command) {
    command();
    return true;
  }

  return false;
};

/**
 * # 处理游戏进行中的方向操控按键
 *
 * 方向键移动/旋转、空格快速下落
 *
 * @function executeDirectionControlCommand
 * @param {string} key - 原始按键名称
 * @returns {void}
 */
function executeDirectionControlCommand(key) {
  // 游戏操控映射
  const controls = {
    ArrowLeft: () => move(-1, 0), // 左移
    ArrowRight: () => move(1, 0), // 右移
    ArrowDown: () => move(0, 1), // 下移
    ArrowUp: rotate, // 旋转方块
    ' ': drop, // 空格：直接落地
  };
  const action = controls[key];

  if (action) {
    action();
  }
}

/**
 * # 窗口变化大小时
 *
 * 根据新的窗口大小，重新游戏绘制界面
 *
 * @function onResize
 * @returns {void}
 */
function onResize() {
  resize();
}

/**
 * # 松开 P 键时停止长按计时
 *
 * 用于退出隐藏模式的触发流程
 *
 * @function onPauseStop
 * @param {KeyboardEvent} e - 键盘事件对象
 */
const onPauseStop = (e) => {
  // 判断松开的是否是 P 键
  if (e.key.toLowerCase() === 'p') {
    // 清除长按计时器，取消隐藏模式触发
    stopHold();
  }
};

/**
 * # 游戏主键盘事件处理器（统一分发所有按键操作）
 *
 * 根据当前游戏状态，分发到对应逻辑：等级选择、游戏结束、全局快捷键、游戏操控
 *
 * @function handleGameControls
 * @param {KeyboardEvent} e - 键盘事件对象
 * @returns {boolean} 是否阻止后续操作
 */
const onControlButtonsPress = (e) => {
  // 获取按下的键名与小写键名
  const { key } = e;
  const lowerKey = key.toLowerCase();

  // 1. 等级选择界面操作
  if (gameState.isSelectLevel) {
    executeLevelSelectionCommand(key, lowerKey);
    return false;
  }

  // 2. 游戏结束状态：按 Enter 返回主菜单
  if (gameState.isGameOver) {
    if (key === 'Enter') {
      executeDrawLevelSelectCommand();
    }
    return false;
  }

  // 3. 全局快捷键（M/R/Q/P）优先处理
  if (executeShortcutsCommand(lowerKey)) {
    return false;
  }

  // 4. 暂停状态：不响应游戏操作
  if (gameState.isPaused) {
    return false;
  }

  // 5. 正常游戏：处理方向键/空格操控
  executeDirectionControlCommand(key);

  // 重新绘制游戏界面
  drawBoard(gameState.board);
  drawCurr(gameState.curr, gameState.cx, gameState.cy);
};

/**
 * # 绑定游戏全局事件
 *
 * 窗口大小自适应、键盘按下、键盘松开事件
 *
 * @function bindEvents
 * @returns {void}
 */
const bindEvents = () => {
  // 窗口大小变化时自适应画布
  globalThis.addEventListener('resize', onResize);

  // 监听键盘按下事件，处理所有游戏操作
  document.addEventListener('keydown', onControlButtonsPress);

  // 监听键盘松开事件，用于取消 P 键长按计时
  document.addEventListener('keyup', onPauseStop);
};

/**
 * # 游戏初始化函数（页面加载时执行）
 *
 * 重置棋盘、加载数据、设置初始状态、适配窗口、绑定事件
 *
 * @function init
 * @returns {void}
 */
const init = () => {
  // 初始化空游戏棋盘
  resetBoard();
  // 从本地存储加载历史最高分
  loadHighScore();

  // 初始化游戏基础状态
  gameState.score = 0;
  gameState.lines = 0;
  gameState.level = 1;
  gameState.isGameOver = false;
  gameState.isPaused = false;
  gameState.isHiddenMode = false;
  gameState.isSelectLevel = true;

  // 执行窗口自适应，让画布适配屏幕
  resize();
  // 更新分数、等级、行数等 UI 展示
  updateUI(
    gameState.score,
    gameState.lines,
    gameState.level,
    gameState.highScore,
  );
  // 绘制初始的等级选择界面
  drawLevelSelect(gameState.level);
  // 绑定键盘、窗口等所有游戏事件
  bindEvents();
};

// 启动
init();
