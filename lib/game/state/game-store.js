import BOARD from '@/lib/services/ui/constants/board.js';
import GameState from '@/lib/game/state/game-state.js';
import isFunction from '@/lib/utils/is-function.js';
import placeGarbageOnBoard from '@/lib/game/state/utils/place-garbage-on-board.js';

/**
 * # 创建游戏状态存储（Game Store Factory）
 *
 * 一个基于闭包的轻量状态管理器，用于管理游戏运行时状态。
 *
 * 特点：
 *
 * - 使用闭包封装 state（避免全局污染）
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
 * @param {object} [initialState=GameState] - 可选初始状态（用于重置或测试）. Default is
 *   `GameState`
 * @returns {object} Store API
 */
const createGameStore = (initialState) => {
  /**
   * # 内部状态对象
   *
   * 使用 structuredClone 保证初始状态隔离
   */
  let state = {
    ...structuredClone(initialState || GameState),
  };

  return {
    /**
     * ## 获取完整 state
     *
     * @returns {object} 当前游戏状态
     */
    getState: () => state,

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
    setState: (patch) => {
      state = {
        ...state,
        ...(isFunction(patch) ? patch(state) : patch),
      };
    },

    resetState: () => {
      state = {
        ...structuredClone(GameState),
      };
    },

    /**
     * ## 重置棋盘
     *
     * 根据 BOARD 常量重新生成空棋盘
     */
    resetBoard: () => {
      const { COLS, ROWS } = BOARD;

      // 创建 ROWS x COLS 的二维数组（初始值为 0，表示空格）
      state.board = Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }).fill(0),
      );
    },

    /**
     * ## 生成游戏初始化的 board 数据
     *
     * 根据传入的 difficulty 参数，生成不同行数的方块数据
     *
     * @returns {Array} - 返回生成的 board 数据
     */
    generateBoard: () => {
      // 难度配置
      const DIFFICULTY_GARBAGE_ROWS = {
        easy: 0,
        normal: 3,
        hard: 6,
        expert: 9,
      };
      const { board, difficulty } = state;
      const cols = board[0].length;
      const garbageRows = DIFFICULTY_GARBAGE_ROWS[difficulty] || 0;

      placeGarbageOnBoard(board, garbageRows, cols);

      return board;
    },

    setBeginningBoard: (board) => {
      state.beginningBoard = structuredClone(board);
    },

    getBeginningBoard: () => structuredClone(state.beginningBoard),

    setGamepadConnected: (connected) => {
      state.gamepadConnected = connected;
    },

    isGamepadConnected: () => state.gamepadConnected,

    /**
     * ## 获取游戏难度等级
     *
     * @returns {string} - 返回游戏难度等级字符串
     */
    getDifficulty: () => state.difficulty,

    /**
     * ## 设置游戏难度等级
     *
     * @param {string} [difficulty='easy'] - 难度等级名称，可选值：easy，normal, hard,
     *   export. Default is `'easy'`
     */
    setDifficulty: (difficulty = 'easy') => {
      state.difficulty = difficulty;
    },

    /**
     * ## 获取已消除行数（baseLines）
     *
     * @returns {number} - 返回基础行数
     */
    getBaseLines: () => state.baseLines,

    /**
     * ## 设置基础行数
     *
     * @param {number} lines - 基础行数
     */
    setBaseLines: (lines) => {
      state.baseLines = lines;
    },

    /**
     * ## 获取当前已消除行（findFullLines）
     *
     * @returns {object[]} - 返回清理的行数数据
     */
    getClearLines: () => state.clearLines,

    /**
     * ## 设置当前消除行
     *
     * @param {number[]} lines - 消除行数组
     */
    setClearLines: (lines) => {
      state.clearLines = lines;
    },

    /**
     * ## 获取 HUD 数据
     *
     * 返回 UI 渲染所需的核心数据
     *
     * @returns {object} HUD 数据
     */
    getHub: () => {
      const { source, lines, level } = state;

      return {
        source,
        lines,
        level,
      };
    },

    /**
     * ## 设置 HUD 数据
     *
     * @param {object} hud - HUD 数据对象
     */
    setHud: (hud) => {
      const { score, lines, level } = hud;

      state.score = score;
      state.lines = lines;
      state.level = level;
    },

    getScore: () => state.score,

    /**
     * ## 设置最高分
     *
     * @param {number} highScore - 历史最高分
     */
    setHighScore: (highScore) => {
      state.highScore = highScore;
    },

    /**
     * ## 获取最高分
     *
     * @returns {number} - 返回最高分数
     */
    getHighScore: () => state.highScore,

    /**
     * ## 获取当前等级
     *
     * @returns {number} - 放回当前等级
     */
    getLevel: () => state.level,

    /**
     * ## 设置当前等级
     *
     * @param {number} level - 当前等级
     */
    setLevel: (level) => {
      state.level = level;
    },

    /**
     * ## 获取游戏模式
     *
     * @returns {string} 当前模式（main-menu / playing / paused / game-over）
     */
    getMode: () => state.mode,

    /**
     * ## 设置游戏模式
     *
     * @param {string} mode - 游戏模式
     */
    setMode: (mode) => {
      state.mode = mode;
    },
  };
};

export default createGameStore;
