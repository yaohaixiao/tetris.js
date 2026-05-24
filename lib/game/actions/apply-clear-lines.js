import GAME from '@/lib/game/constants/game.js';

/**
 * 创建空行
 *
 * @param {number} cols - 列数
 * @returns {number[]} - 返回根据列数创建的空数组
 */
const createEmptyRow = (cols) => Array.from({ length: cols }).fill(0);

/**
 * 计算等级与升级步长
 *
 * 等级规则：
 *
 * Level 1 -> 10 行升级 level 2 -> 12 行升级 level 3 -> 14 行升级 ... 最大步长 60
 *
 * @param {number} totalLines - 总累计行数
 * @param {number} maxLevel - 最大等级
 * @returns {{
 *   level: number;
 *   levelUpSteps: number;
 * }} - 返回计算后的等级信息
 */
const calculateLevel = (totalLines, maxLevel) => {
  let level = 1;

  /** 当前等级升级所需行数 */
  let required = 10;

  /** 已累计消耗行数 */
  let consumed = 0;

  while (level < maxLevel && totalLines >= consumed + required) {
    consumed += required;

    /** 下一等级 */
    level++;

    /** 下一等级升级步长 */
    required = Math.min(required + 2, 60);
  }

  return {
    level,
    levelUpSteps: required,
  };
};

/**
 * # 应用消行
 *
 * ## 特性
 *
 * - 纯函数
 * - 不修改原 state
 * - Replay-safe
 * - Simulation-safe
 * - Scheduler-safe
 *
 * @param {object} runtime - 游戏运行时
 * @returns {object} - 返回计算后的消除行需要的数据
 */
const applyClearLines = (runtime) => {
  const { MAX_LEVEL, CLEAR_LINE_SCORES } = GAME;

  const { Elements, Store } = runtime;

  const state = Store.getState();

  const { cols } = Elements.Main;

  /**
   * 使用已经确定好的 clearLines
   *
   * 不重新扫描 board， 保证动画 / Replay / AI 一致性
   */
  const lines = [...(state.clearLines || [])].toSorted((a, b) => b - a);

  /** 消除行数 */
  const cleared = lines.length;

  /** 深拷贝棋盘 */
  const board = structuredClone(state.board);

  /** ======== 消行 ======== */

  // 先删除
  for (const y of lines) {
    board.splice(y, 1);
  }

  // 再统一补空行
  for (let i = 0; i < cleared; i++) {
    board.unshift(createEmptyRow(cols));
  }

  /** ======== 行数 ======== */

  /** 当前累计消除行数 */
  const nextLines = state.lines + cleared;

  /** 总累计行数（用于等级） */
  const totalLines = state.baseLines + nextLines;

  /** ======== 等级 ======== */

  const { level: newLevel, levelUpSteps } = calculateLevel(
    totalLines,
    MAX_LEVEL,
  );

  /** 是否升级 */
  const levelUp = newLevel > state.level;

  /** ======== 分数 ======== */

  /** 固定基础分 */
  const baseScore = CLEAR_LINE_SCORES[cleared] || 0;

  /** 本次消除得分 */
  const clearScore = baseScore * newLevel;

  /** ======== 返回结果 ======== */

  return {
    /**
     * 状态更新函数
     *
     * @param {object} prev - 更新前的游戏状态信息
     * @returns {object} - 返回计算后的状态信息
     */
    stateHandler: (prev) => ({
      ...prev,

      /** 清空待消除行 */
      clearLines: [],

      /** 更新棋盘 */
      board,

      /** 更新累计消除行数 */
      lines: nextLines,

      /** 更新等级 */
      level: newLevel,

      /** 更新升级步长 */
      levelUpSteps,

      /** 更新总分 */
      score: prev.score + clearScore,

      /** 本次消除得分 */
      clearScore,
    }),

    /** 是否升级 */
    levelUp,

    /** 当前等级 */
    level: newLevel,

    /** 当前升级步长 */
    levelUpSteps,

    /** 是否达到最大等级 */
    isMaxOut: newLevel >= MAX_LEVEL,

    /** 本次消除得分 */
    clearScore,

    /** 消除行数 */
    cleared,
  };
};

export default applyClearLines;
