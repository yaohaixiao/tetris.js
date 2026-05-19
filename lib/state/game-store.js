import placeGarbageOnBoard from '@/lib/state/utils/place-garbage-on-board.js';
import isFunction from '@/lib/utils/is-function.js';

/**
 * # 游戏状态存储（Game Store）
 *
 * 基于 class 的轻量级状态管理器，用于集中管理游戏运行时状态。
 *
 * ## 设计特点
 *
 * - **单一状态源**：所有游戏数据存储在 `this.state` 对象中
 * - **支持 patch 更新**：`setState` 支持对象合并和函数式更新
 * - **状态隔离**：使用 `structuredClone` 深拷贝，避免引用污染
 * - **领域方法**：提供 `getBoard`、`getScore`、`getMode` 等语义化访问方法
 *
 * ## 设计定位
 *
 * - 非 Redux / 非 Zustand
 * - 轻量级 game state container
 * - 专为 Tetris Engine 设计
 *
 * @example
 *   const store = new GameStore({ GameState, cols: 10, rows: 20 });
 *   store.setState({ score: 100 });
 *   console.log(store.getScore()); // 100
 *
 * @class GameStore
 */
class GameStore {
  /**
   * ## 构造函数
   *
   * 初始化内部状态，使用深拷贝保证与外部状态隔离。
   *
   * @param {object} options - 配置选项
   * @param {object} options.GameState - 初始状态对象
   * @param {number} options.cols - 棋盘列数
   * @param {number} options.rows - 棋盘行数
   */
  constructor(options) {
    this.initialize(options);
  }

  /**
   * ## 初始化 Store
   *
   * 保存默认状态（用于重置）和棋盘尺寸配置。
   *
   * @param {object} options - 配置选项
   * @returns {void}
   */
  initialize(options) {
    const { GameState, cols, rows } = options;

    /** @type {object} 初始状态的深拷贝，用于 ResetState 恢复 */
    this.defaults = structuredClone(GameState);

    /** @type {{ cols: number; rows: number }} 棋盘尺寸配置 */
    this.options = { cols, rows };

    /** @type {object} 当前运行时状态 */
    this.state = structuredClone(GameState);
  }

  /**
   * ## 获取完整 state
   *
   * @returns {object} 当前游戏状态对象
   */
  getState() {
    return this.state;
  }

  /**
   * ## 更新 state（支持 patch 或函数）
   *
   * 支持两种更新模式：
   *
   * 1. **对象 patch**：`setState({ score: 100 })`
   * 2. **函数式更新**：`setState((prev) => ({ score: prev.score + 50 }))`
   *
   * @param {object | Function} patch - 状态更新内容或函数
   * @returns {void}
   */
  setState(patch) {
    this.state = {
      ...this.state,
      ...(isFunction(patch) ? patch(this.state) : patch),
    };
  }

  /**
   * ## 重置状态为初始值
   *
   * 使用深拷贝恢复，确保与原默认状态完全隔离。
   *
   * @returns {void}
   */
  resetState() {
    this.state = structuredClone(this.defaults);
  }

  /**
   * ## 获取当前棋盘
   *
   * @returns {string[][]} 棋盘二维数组
   */
  getBoard() {
    return this.state.board;
  }

  /**
   * ## 重置棋盘
   *
   * 根据配置的 rows 和 cols 生成全空的棋盘。
   *
   * @returns {void}
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
   * 根据当前难度（difficulty）在棋盘底部生成对应数量的垃圾行。
   *
   * | 难度   | 垃圾行数 |
   * | ------ | -------- |
   * | easy   | 0        |
   * | normal | 3        |
   * | hard   | 6        |
   * | expert | 9        |
   *
   * @returns {string[][]} 生成的棋盘数据
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
   * ## 设置初始棋盘（深拷贝）
   *
   * 用于保存游戏开始时的棋盘状态，供回放使用。
   *
   * @param {string[][]} board - 游戏棋盘数据
   * @returns {void}
   */
  setBeginningBoard(board) {
    this.state.beginningBoard = structuredClone(board);
  }

  /**
   * ## 获取初始棋盘（深拷贝副本）
   *
   * @returns {string[][]} 初始棋盘数据的深拷贝
   */
  getBeginningBoard() {
    return structuredClone(this.state.beginningBoard);
  }

  /**
   * ## 获取当前控制者身份
   *
   * @returns {string} 控制者身份：`human` 或 `ai`
   */
  getController() {
    return this.state.controller;
  }

  /**
   * ## 设置当前控制者身份
   *
   * @param {string} controller - 控制者身份：`human` 或 `ai`
   * @returns {void}
   */
  setController(controller) {
    this.state.controller = controller;
  }

  /**
   * ## 设置游戏手柄连接状态
   *
   * @param {boolean} connected - 游戏手柄是否已连接
   * @returns {void}
   */
  setGamepadConnected(connected) {
    this.state.gamepadConnected = connected;
  }

  /**
   * ## 获取手柄连接状态
   *
   * @returns {boolean} 已连接返回 true，否则返回 false
   */
  isGamepadConnected() {
    return this.state.gamepadConnected;
  }

  /**
   * ## 获取游戏难度等级
   *
   * @returns {string} 难度等级：easy / normal / hard / expert
   */
  getDifficulty() {
    return this.state.difficulty;
  }

  /**
   * ## 设置游戏难度等级
   *
   * @param {string} [difficulty='easy'] - 难度等级（easy / normal / hard / expert）.
   *   Default is `'easy'`
   * @returns {void}
   */
  setDifficulty(difficulty = 'easy') {
    this.state.difficulty = difficulty;
  }

  /**
   * ## 获取基准行数
   *
   * 基准行数用于计算等级提升：(baseLines + lines) / 10 + 1 = level
   *
   * @returns {number} 基准行数
   */
  getBaseLines() {
    return this.state.baseLines;
  }

  /**
   * ## 设置基准行数
   *
   * @param {number} lines - 基准行数值
   * @returns {void}
   */
  setBaseLines(lines) {
    this.state.baseLines = lines;
  }

  /**
   * ## 获取当前待消除的行号数组
   *
   * @returns {number[]} 待消除的行号
   */
  getClearLines() {
    return this.state.clearLines;
  }

  /**
   * ## 设置当前待消除的行号
   *
   * @param {number[]} lines - 消除行号数组
   * @returns {void}
   */
  setClearLines(lines) {
    this.state.clearLines = lines;
  }

  /**
   * ## 获取 HUD 数据
   *
   * 返回 UI 渲染所需的核心显示数据。
   *
   * @returns {{ source: string; lines: number; level: number }} HUD 数据
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
   * @returns {void}
   */
  setHud(hud) {
    const { score, lines, level } = hud;
    this.state.score = score;
    this.state.lines = lines;
    this.state.level = level;
  }

  /**
   * ## 获取当前分数
   *
   * @returns {number} 当前得分
   */
  getScore() {
    return this.state.score;
  }

  /**
   * ## 设置最高分
   *
   * @param {number} highScore - 历史最高分
   * @returns {void}
   */
  setHighScore(highScore) {
    this.state.highScore = highScore;
  }

  /**
   * ## 获取最高分
   *
   * @returns {number} 历史最高分
   */
  getHighScore() {
    return this.state.highScore;
  }

  /**
   * ## 获取当前等级
   *
   * @returns {number} 游戏等级
   */
  getLevel() {
    return this.state.level;
  }

  /**
   * ## 设置当前等级
   *
   * @param {number} level - 游戏等级值
   * @returns {void}
   */
  setLevel(level) {
    this.state.level = level;
  }

  /**
   * ## 获取游戏模式
   *
   * @returns {string} 当前模式：main-menu / difficulty / playing / paused /
   *   game-over / replay
   */
  getMode() {
    return this.state.mode;
  }

  /**
   * ## 设置游戏模式
   *
   * @param {string} mode - 游戏模式
   * @returns {void}
   */
  setMode(mode) {
    this.state.mode = mode;
  }
}

export default GameStore;
