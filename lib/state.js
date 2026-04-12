import { BOARD_COLS, BOARD_ROWS } from './constants.js';

/**
 * # 全局游戏状态对象（集中管理所有游戏数据）
 *
 * @typedef {object} GameState
 * @property {string[][]} board - 游戏棋盘二维数组，存储每个格子颜色
 * @property {object | null} curr - 当前正在下落的方块对象，null 表示无
 * @property {number} cx - 当前方块的 X 坐标（列）
 * @property {number} cy - 当前方块的 Y 坐标（行）
 * @property {object[]} clearEffects - 特效信息数组对象
 * @property {object} levelUpEffect - 升级特效
 * @property {boolean} isLevelUpAnim - 是否显示升级动画
 * @property {object | null} next - 下一个预览方块对象
 * @property {number} baseLines - 升级基准行数（计算等级用）
 * @property {number} score - 当前游戏得分
 * @property {number} lines - 当前已消除行数
 * @property {number} level - 当前游戏等级
 * @property {number} highScore - 历史最高得分
 * @property {boolean} isGameOver - 游戏是否结束
 * @property {boolean} isPaused - 游戏是否暂停
 * @property {boolean} isSelectLevel - 是否处于等级选择界面
 * @property {boolean} isHiddenMode - 是否开启隐藏模式
 * @property {number | null} gameInterval - 游戏主循环定时器 ID
 * @property {object | null} countDown - 倒计时信息对象
 * @property {number | null} holdP - P 键长按计时器 ID
 */

/**
 * # 全局游戏状态（集中管理）
 *
 * @type {GameState}
 */
export const gameState = {
  board: [],
  curr: null,
  cx: 0,
  cy: 0,
  next: null,
  baseLines: 0,
  clearEffects: [],
  levelUpEffect: {
    show: false,
    timer: 0,
    fireworks: [],
  },
  // 倒计时状态
  countDown: {
    show: false,
    number: 3,
    scale: 4,
    count: 0,
    timer: null,
  },
  score: 0,
  lines: 0,
  level: 1,
  highScore: 0,
  isGameOver: false,
  isPaused: false,
  isSelectLevel: true,
  isHiddenMode: false,
  gameInterval: null,
  holdP: null,
};

/**
 * # 重置游戏棋盘
 *
 * 初始化生成一个指定行数和列数的空棋盘，所有格子填充 0
 *
 * @function resetBoard
 * @returns {void}
 */
export function resetBoard() {
  // 创建 BOARD_ROWS 行 x BOARD_COLS 列的二维数组，初始值均为 0（空）
  gameState.board = Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLS }).fill(0),
  );
}

/**
 * # 从本地存储加载历史最高分
 *
 * 读取 localStorage 中的 tetris-high-score，转为数字并赋值给游戏状态 若无数据则默认设置为 0
 *
 * @function loadHighScore
 * @returns {void}
 */
export function loadHighScore() {
  // 从本地存储读取最高分，转为十进制数字，无数据时默认为 0
  gameState.highScore =
    Number.parseInt(localStorage.getItem('tetris-high-score'), 10) || 0;
}

/**
 * # 保存最高分到本地存储
 *
 * 判断当前得分是否大于历史最高分，若是则更新并保存到 localStorage
 *
 * @function loadHighScore
 * @returns {void}
 */
export function saveHighScore() {
  const { score } = gameState;

  // 仅当当前得分超过历史最高分才执行保存
  if (score > gameState.highScore) {
    // 更新游戏状态中的最高分
    gameState.highScore = score;
    // 保存到浏览器本地存储，持久化记录
    localStorage.setItem('tetris-high-score', gameState.highScore.toString());
  }
}
