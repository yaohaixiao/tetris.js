import GAME from '@/lib/game/constants/game.js';
import calculateLevel from '@/lib/game/utils/calculate-level.js';
import getTSpinScore from '@/lib/game/utils/get-t-spin-score.js';

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
 * # 应用消除行
 *
 * 纯函数，不修改原 state，可安全用于 Replay / AI Simulation。
 *
 * ## 处理流程
 *
 * 1. 从 `state.clearLines` 读取待消除行号
 * 2. 深拷贝棋盘，删除满行并在顶部补空行
 * 3. 计算新的累计行数、等级、分数
 * 4. 计算 T-Spin 额外加分
 * 5. 计算 Back-to-Back 连续大招奖励
 * 6. 计算 All Clear 全清奖励
 * 7. 计算 Combo 连击计数和额外加分
 * 8. 返回 `stateHandler` 更新函数和元数据
 *
 * ## 计分规则
 *
 * 总分 = (消行基础分 × Back-to-Back 倍率) × 新等级 + Combo 加分 + All Clear 加分
 *
 * ### 普通消行基础分
 *
 * | 消除行数   | 基础分 |
 * | ---------- | ------ |
 * | 1          | 100    |
 * | 2          | 300    |
 * | 3          | 500    |
 * | 4 (Tetris) | 800    |
 * | 5          | 1200   |
 *
 * ### T-Spin 加分（替代普通基础分）
 *
 * | 消除行数 | T-Spin | T-Spin Mini |
 * | -------- | ------ | ----------- |
 * | 0        | 400    | 100         |
 * | 1        | 800    | 200         |
 * | 2        | 1200   | 400         |
 * | 3        | 1600   | —           |
 *
 * T-Spin 加分完全替代普通消行基础分（不叠加）。
 *
 * ## Back-to-Back 规则
 *
 * 连续两次不中断地完成"大招消行"（Tetris / T-Spin / T-Spin Mini）， 第二次及之后每次基础分 ×1.5。普通消行会中断
 * Back-to-Back 状态。
 *
 * | 本轮     | 上轮   | 结果           |
 * | -------- | ------ | -------------- |
 * | 大招     | 大招   | ×1.5，保持状态 |
 * | 大招     | 非大招 | ×1.0，开启状态 |
 * | 普通消行 | —      | ×1.0，中断状态 |
 * | 无消行   | —      | 不影响状态     |
 *
 * ## All Clear 规则
 *
 * 消行后棋盘完全清空（没有任何方块）时触发，固定额外加 2000 分。 All Clear 加分不乘等级，直接叠加到总分中。
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
 * @returns {object} 消行后的更新数据
 */
const applyClearLines = (runtime) => {
  const { MAX_LEVEL, CLEAR_LINE_SCORES, ALL_CLEAR_SCORE = 2000 } = GAME;
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

  /** ======== 4. T-Spin 检测与计分 ======== */

  /** 从 Store 读取锁定阶段写入的 T-Spin 检测结果 */
  const { isTSpin = false, isTSpinMini = false } = state.tSpin || {};

  /** T-Spin 额外基础分（替代普通消行基础分） */
  const tSpinScore = getTSpinScore(cleared, isTSpin, isTSpinMini);

  /** ======== 5. Back-to-Back 检测 ======== */

  /**
   * 本轮是否为大招消行
   *
   * 大招定义：Tetris（消 4 行以上）或 T-Spin / T-Spin Mini 消行。
   */
  const isBigMove = cleared >= 4 || isTSpin || isTSpinMini;

  /**
   * 是否触发 Back-to-Back 奖励
   *
   * 本轮是大招 且 上一轮也是大招（state.backToBack === true）。
   */
  const isBackToBack = isBigMove && state.backToBack === true;

  /**
   * Back-to-Back 倍率
   *
   * 触发时为 1.5，否则为 1.0。
   */
  const backToBackMultiplier = isBackToBack ? 1.5 : 1;

  /**
   * 更新 Back-to-Back 状态
   *
   * - 本轮是大招 → true（开启或保持）
   * - 本轮消行了但不是大招 → false（中断）
   * - 本轮没消行 → 保持原值（但在本函数中不会出现，因为只在消行时调用）
   */
  const nextBackToBack = isBigMove;

  /** ======== 6. All Clear 检测 ======== */

  /**
   * 消行后棋盘是否完全清空
   *
   * 检查新棋盘的每一格是否都为 0。
   */
  const isAllClear =
    cleared > 0 && board.every((row) => row.every((cell) => cell === 0));

  /**
   * All Clear 加分
   *
   * 全清时固定加 2000 分，不乘等级。非全清时为 0。
   */
  const allClearScore = isAllClear ? ALL_CLEAR_SCORE : 0;

  /** ======== 7. 分数计算 ======== */

  /**
   * 本次消行基础分
   *
   * T-Spin 存在时使用 T-Spin 计分表，否则使用普通消行基础分。
   */
  const baseScore = tSpinScore || CLEAR_LINE_SCORES[cleared] || 0;

  /**
   * 本次消行得分
   *
   * = 基础分 × Back-to-Back 倍率 × 新等级
   */
  const clearScore = Math.floor(baseScore * backToBackMultiplier * newLevel);

  /**
   * ======== 8. Combo 计算 ========
   *
   * - 消行时 combo +1
   * - 未消行时 combo 归零
   * - Combo ≥ 2 时额外加分 = (combo - 1) × 50
   */

  /** 当前连击次数 */
  const combo = cleared > 0 ? (state.combo || 0) + 1 : 0;

  /** 本次连击额外加分（combo=1 时不加分） */
  const comboScore = combo > 1 ? (combo - 1) * 50 : 0;

  /** ======== 9. 返回结果 ======== */
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

      /** 清空 T-Spin 标记（仅当次消行有效） */
      tSpin: null,

      /** 更新 Back-to-Back 状态 */
      backToBack: nextBackToBack,

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
       * 总分 = 原分数 + (基础分 × B2B倍率 × 等级) + Combo 额外加分 + All Clear 加分
       */
      score: prev.score + clearScore + comboScore + allClearScore,

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

    /** 是否为 T-Spin */
    isTSpin,

    /** 是否为 T-Spin Mini */
    isTSpinMini,

    /** 是否为 Back-to-Back */
    isBackToBack,

    /** 是否为 All Clear */
    isAllClear,

    /** 当前连击次数 */
    combo,

    /** 本次连击额外加分 */
    comboScore,
  };
};

export default applyClearLines;
