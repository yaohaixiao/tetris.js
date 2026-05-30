import GAME from '@/lib/game/constants/game.js';

/**
 * ## 创建空行
 *
 * 返回一个长度为 cols、全部填充 0 的数组，表示棋盘中的空行。
 *
 * @param {number} cols - 棋盘列数
 * @returns {number[]} 全 0 数组
 */
const createEmptyRow = (cols) => Array.from({ length: cols }).fill(0);

/**
 * ## 计算等级与升级步长
 *
 * 采用动态升级步长算法：
 *
 * - 初始 10 行升一级
 * - 每次升级后所需行数 +2
 * - 步长封顶 60 行
 *
 * | 等级 | 升级需行数 | 累计需行数 |
 * | ---- | ---------- | ---------- |
 * | 1    | 10         | 10         |
 * | 2    | 12         | 22         |
 * | 3    | 14         | 36         |
 * | ...  | ...        | ...        |
 * | 26   | 60         | 910        |
 * | 27+  | 60         | 每 60 行   |
 *
 * @param {number} totalLines - 总累计消除行数
 * @param {number} maxLevel - 最大等级（256）
 * @returns {{ level: number; levelUpSteps: number }} 计算后的等级和当前升级步长
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

  return { level, levelUpSteps: required };
};

/**
 * # 应用消除行
 *
 * 纯函数，不修改原 state，可安全用于 Replay / AI Simulation。
 *
 * ## 处理流程
 *
 * 1. 从 `state.clearLines` 读取待消除行号
 * 2. 深拷贝棋盘，删除满行并在顶部补空行
 * 3. 计算新的累计行数、等级、分数
 * 4. 计算 Combo 连击计数和额外加分
 * 5. 返回 `stateHandler` 更新函数和元数据
 *
 * ## 计分规则
 *
 * 总分 = 消行基础分 × 新等级 + Combo 加分
 *
 * | 消除行数   | 基础分 |
 * | ---------- | ------ |
 * | 1          | 100    |
 * | 2          | 300    |
 * | 3          | 500    |
 * | 4 (Tetris) | 800    |
 * | 5          | 1200   |
 *
 * ## Combo 规则
 *
 * - 每次消行 combo +1
 * - 没有消行时 combo 归零
 * - Combo ≥ 2 时，额外加分 = (combo - 1) × 50
 *
 * | combo | 额外加分 |
 * | ----- | -------- |
 * | 1     | 0        |
 * | 2     | 50       |
 * | 3     | 100      |
 * | 4     | 150      |
 * | 5     | 200      |
 *
 * @param {object} runtime - 游戏运行时对象
 * @param {object} runtime.Elements - 棋盘元素配置
 * @param {object} runtime.Elements.Canvas - 画布配置（含 cols）
 * @param {object} runtime.Store - 游戏状态存储
 * @returns {object} 消行后的更新数据
 */
const applyClearLines = (runtime) => {
  const { MAX_LEVEL, CLEAR_LINE_SCORES } = GAME;
  const { Elements, Store } = runtime;
  const state = Store.getState();
  const { cols } = Elements.Canvas;

  /**
   * 使用已经确定好的 clearLines
   *
   * 不重新扫描 board，保证动画 / Replay / AI 一致性。 从底部向上排序，确保 splice 时索引正确。
   */
  const lines = [...(state.clearLines || [])].toSorted((a, b) => b - a);

  /** 消除行数 */
  const cleared = lines.length;

  /**
   * ======== 1. 消行逻辑 ========
   *
   * 深拷贝棋盘，先删除满行再在顶部统一补空行。
   */
  const board = structuredClone(state.board);

  // 先删除所有满行
  for (const y of lines) {
    board.splice(y, 1);
  }

  // 再在顶部统一补空行
  for (let i = 0; i < cleared; i++) {
    board.unshift(createEmptyRow(cols));
  }

  /** ======== 2. 行数计算 ======== */

  /** 当前累计消除行数 */
  const nextLines = state.lines + cleared;

  /** 总累计行数（基础行数 + 累计消除行数），用于等级计算 */
  const totalLines = state.baseLines + nextLines;

  /** ======== 3. 等级计算 ======== */

  /** 用动态步长计算新等级 */
  const { level: newLevel, levelUpSteps } = calculateLevel(
    totalLines,
    MAX_LEVEL,
  );

  /** 新等级高于当前等级时触发升级 */
  const levelUp = newLevel > state.level;

  /** ======== 4. 分数计算 ======== */

  /** 本次消行基础分 */
  const baseScore = CLEAR_LINE_SCORES[cleared] || 0;

  /** 本次消行得分 = 基础分 × 新等级 */
  const clearScore = baseScore * newLevel;

  /**
   * ======== 5. Combo 计算 ========
   *
   * - 消行时 combo +1
   * - 未消行时 combo 归零
   * - Combo ≥ 2 时额外加分 = (combo - 1) × 50
   */

  /** 当前连击次数 */
  const combo = cleared > 0 ? (state.combo || 0) + 1 : 0;

  /** 本次连击额外加分（combo=1 时不加分） */
  const comboScore = combo > 1 ? (combo - 1) * 50 : 0;

  /** ======== 6. 返回结果 ======== */
  return {
    /**
     * ## 状态更新处理函数
     *
     * 接收当前 state，返回消行后的新 state。
     *
     * @param {object} prev - 当前状态
     * @returns {object} 新状态
     */
    stateHandler: (prev) => ({
      ...prev,

      /** 清空待消除行列表 */
      clearLines: [],

      /** 更新棋盘 */
      board,

      /** 更新累计消除行数 */
      lines: nextLines,

      /** 更新等级 */
      level: newLevel,

      /** 更新升级步长 */
      levelUpSteps,

      /**
       * 更新总分
       *
       * 总分 = 原分数 + 消行得分 + Combo 额外加分
       */
      score: prev.score + clearScore + comboScore,

      /** 本次消行得分（用于飘字动画） */
      clearScore,

      /** 当前连击次数（用于 HUD 显示） */
      combo,

      /** 本次连击额外加分（用于飘字动画） */
      comboScore,
    }),

    /** 是否触发了升级 */
    levelUp,

    /** 计算后的新等级 */
    level: newLevel,

    /** 当前升级步长 */
    levelUpSteps,

    /** 是否达到最大等级（256） */
    isMaxOut: newLevel >= MAX_LEVEL,

    /** 本次消行得分 */
    clearScore,

    /** 消除行数 */
    cleared,

    /** 当前连击次数 */
    combo,

    /** 本次连击额外加分 */
    comboScore,
  };
};

export default applyClearLines;
