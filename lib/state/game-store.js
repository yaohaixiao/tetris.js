import placeGarbageOnBoard from '@/lib/state/utils/place-garbage-on-board.js';
import isFunction from '@/lib/utils/is-function.js';

/**
 * # 游戏状态存储（Game Store）
 *
 * 基于 class 的轻量状态管理器，用于管理游戏运行时状态。
 *
 * 特点：
 *
 * - 内部维护完整的游戏状态对象
 * - 提供基础 get / set API
 * - 支持 patch 更新模式
 * - 支持部分领域方法（board / hud / level 等）
 *
 * 设计定位：
 *
 * - 非 Redux / 非 Zustand
 * - 轻量 game state container
 * - 专为 Tetris Engine 设计
 *
 * @example
 *   const store = new GameStore(); // 使用默认 GameState
 *   const store2 = new GameStore(customInitialState); // 使用自定义初始状态
 */
class GameStore {
  /**
   * @param {object} [options=GameState] - 可选初始状态（用于重置或测试）. Default is
   *   `GameState`
   */
  constructor(options) {
    this.initialize(options);
  }

  initialize(options) {
    const { GameState, cols, rows } = options;

    this.defaults = structuredClone(GameState);
    this.options = { cols, rows };

    /**
     * 内部状态对象，使用 structuredClone 保证初始状态隔离
     *
     * @type {object}
     */
    this.state = structuredClone(GameState);
  }

  /**
   * ## 获取完整 state
   *
   * @returns {object} 当前游戏状态
   */
  getState() {
    return this.state;
  }

  /**
   * ## 更新 state（支持 patch 或函数）
   *
   * 支持两种模式：
   *
   * 1. Object patch
   * 2. Function (prevState) => patch
   *
   * @param {object | Function} patch - 状态更新内容或函数
   */
  setState(patch) {
    this.state = {
      ...this.state,
      ...(isFunction(patch) ? patch(this.state) : patch),
    };
  }

  /** 重置状态为默认 GameState */
  resetState() {
    this.state = structuredClone(this.defaults);
  }

  /**
   * ## 重置棋盘
   *
   * 根据 BOARD 常量重新生成空棋盘
   */
  resetBoard() {
    const { cols, rows } = this.options;
    this.state.board = Array.from({ length: rows }, () =>
      Array.from({ length: cols }).fill(0),
    );
  }

  /**
   * ## 生成游戏初始化的 board 数据
   *
   * 根据传入的 difficulty 参数，生成不同行数的方块数据
   *
   * @returns {Array} 返回生成的 board 数据
   */
  generateBoard() {
    const DIFFICULTY_GARBAGE_ROWS = {
      easy: 0,
      normal: 3,
      hard: 6,
      expert: 9,
    };
    const { board, difficulty } = this.state;
    const cols = board[0].length;
    const garbageRows = DIFFICULTY_GARBAGE_ROWS[difficulty] || 0;

    placeGarbageOnBoard(board, garbageRows, cols);

    return board;
  }

  /**
   * 设置初始棋盘（深拷贝）
   *
   * @param {Array} board - 游戏画板数据
   */
  setBeginningBoard(board) {
    this.state.beginningBoard = structuredClone(board);
  }

  /**
   * 获取初始棋盘（深拷贝副本）
   *
   * @returns {Array} - 返回初始设置难度生成的方块的画布数据
   */
  getBeginningBoard() {
    return structuredClone(this.state.beginningBoard);
  }

  /**
   * 设置游戏手柄连接状态
   *
   * @param {boolean} connected - 游戏手柄是否连接
   */
  setGamepadConnected(connected) {
    this.state.gamepadConnected = connected;
  }

  /**
   * 获取游戏手柄是否已连接
   *
   * @returns {boolean} - 游戏手柄连接，返回 true，否则返回 false
   */
  isGamepadConnected() {
    return this.state.gamepadConnected;
  }

  /**
   * ## 获取游戏难度等级
   *
   * @returns {string} - 获取游戏的难度等级
   */
  getDifficulty() {
    return this.state.difficulty;
  }

  /**
   * ## 设置游戏难度等级
   *
   * @param {string} [difficulty='easy'] - 难度等级名称，可选值：easy, normal, hard,
   *   expert. Default is `'easy'`
   */
  setDifficulty(difficulty = 'easy') {
    this.state.difficulty = difficulty;
  }

  /**
   * ## 获取已消除行数（baseLines）
   *
   * @returns {number} - 返回初始消除行数信息
   */
  getBaseLines() {
    return this.state.baseLines;
  }

  /**
   * ## 设置基础行数
   *
   * @param {number} lines - 初始消除行数
   */
  setBaseLines(lines) {
    this.state.baseLines = lines;
  }

  /**
   * ## 获取当前已消除行数据
   *
   * @returns {object[]} - 返回清理的行数数据
   */
  getClearLines() {
    return this.state.clearLines;
  }

  /**
   * ## 设置当前消除行
   *
   * @param {number[]} lines - 消除行数组
   */
  setClearLines(lines) {
    this.state.clearLines = lines;
  }

  /**
   * ## 获取 HUD 数据
   *
   * 返回 UI 渲染所需的核心数据
   *
   * @returns {object} HUD 数据
   */
  getHub() {
    const { source, lines, level } = this.state;
    return { source, lines, level };
  }

  /**
   * ## 设置 HUD 数据
   *
   * @param {object} hud - HUD 数据对象
   * @param {number} hud.score - 当前得分
   * @param {number} hud.lines - 当前消除行数
   * @param {number} hud.level - 当前等级
   */
  setHud(hud) {
    const { score, lines, level } = hud;
    this.state.score = score;
    this.state.lines = lines;
    this.state.level = level;
  }

  /**
   * 获取当前分数
   *
   * @returns {number} - 返回当前得分
   */
  getScore() {
    return this.state.score;
  }

  /**
   * ## 设置最高分
   *
   * @param {number} highScore - 历史最高分
   */
  setHighScore(highScore) {
    this.state.highScore = highScore;
  }

  /**
   * ## 获取最高分
   *
   * @returns {number} - 返回最高得分
   */
  getHighScore() {
    return this.state.highScore;
  }

  /**
   * ## 获取当前等级
   *
   * @returns {number} - 获取游戏等级
   */
  getLevel() {
    return this.state.level;
  }

  /**
   * ## 设置当前等级
   *
   * @param {number} level - 游戏等级值
   */
  setLevel(level) {
    this.state.level = level;
  }

  /**
   * ## 获取游戏模式
   *
   * @returns {string} 当前模式（main-menu / playing / paused / game-over）
   */
  getMode() {
    return this.state.mode;
  }

  /**
   * ## 设置游戏模式
   *
   * @param {string} mode - 游戏模式
   */
  setMode(mode) {
    this.state.mode = mode;
  }
}

export default GameStore;
