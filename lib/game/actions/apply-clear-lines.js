import GAME from '@/lib/game/constants/game.js';
import calculateLevel from '@/lib/game/utils/calculate-level.js';
import getTSpinScore from '@/lib/game/utils/get-t-spin-score.js';

/**
 * 创建空行。
 *
 * 返回一个长度为 cols、全部填充 0 的数组，表示棋盘中的空行。
 *
 * @function createEmptyRow
 * @param {number} cols - 棋盘列数
 * @returns {number[]} 全 0 数组
 */
const createEmptyRow = (cols) => Array.from({ length: cols }).fill(0);

/**
 * ============================================================
 *
 * # 应用消除行
 *
 * ============================================================
 *
 * 纯函数，不修改原 state，可安全用于 Replay / AI Simulation。
 *
 * ## 处理流程
 *
 * 1. 从 state.clearLines 读取待消除行号
 * 2. 深拷贝棋盘，删除满行并在顶部补空行
 * 3. 计算新的累计行数、等级、分数
 * 4. 计算 T-Spin 额外加分
 * 5. 计算 Back-to-Back 连续大招奖励
 * 6. 计算 All Clear 全清奖励
 * 7. 计算 Combo 连击计数和额外加分
 * 8. 返回 stateHandler 更新函数和元数据
 *
 * ## 计分规则
 *
 * 总分 = (消行基础分 × Back-to-Back 倍率) × 新等级 + Combo 加分 + All Clear 加分
 *
 * ### 普通消行基础分
 *
 * | 消除行数   | 基础分 |
 * | :--------- | :----- |
 * | 1          | 100    |
 * | 2          | 300    |
 * | 3          | 500    |
 * | 4 (Tetris) | 800    |
 * | 5          | 1200   |
 *
 * ### T-Spin 加分（替代普通基础分）
 *
 * | 消除行数 | T-Spin | T-Spin Mini |
 * | :------- | :----- | :---------- |
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
 * | :------- | :----- | :------------- |
 * | 大招     | 大招   | ×1.5，保持状态 |
 * | 大招     | 非大招 | ×1.0，开启状态 |
 * | 普通消行 | —      | ×1.0，中断状态 |
 * | 无消行   | —      | 不影响状态     |
 *
 * ## All Clear 规则
 *
 * 消行后棋盘完全清空时触发，固定额外加 2000 分。 All Clear 加分不乘等级，直接叠加到总分中。
 *
 * ## Combo 规则
 *
 * - 每次消行 combo +1
 * - 没有消行时 combo 归零
 * - Combo ≥ 2 时，额外加分 = (combo - 1) × 50
 *
 * | combo | 额外加分 |
 * | :---- | :------- |
 * | 1     | 0        |
 * | 2     | 50       |
 * | 3     | 100      |
 * | 4     | 150      |
 * | 5     | 200      |
 *
 * @function applyClearLines
 * @param {object} runtime - 游戏运行时对象
 * @returns {object} 消行后的更新数据
 */
const applyClearLines = (runtime) => {
  const { MAX_LEVEL, CLEAR_LINE_SCORES, ALL_CLEAR_SCORE = 2000 } = GAME;
  const { Elements, Store } = runtime;
  const state = Store.getState();
  const { cols } = Elements.Canvas;

  // 使用已确定的 clearLines，从底部向上排序确保 splice 索引正确
  const lines = [...(state.clearLines || [])].toSorted((a, b) => b - a);

  /** 消除行数 */
  const cleared = lines.length;

  // 步骤 1：消行逻辑 — 深拷贝棋盘，删除满行后在顶部补空行
  const board = structuredClone(state.board);

  for (const y of lines) {
    board.splice(y, 1);
  }

  for (let i = 0; i < cleared; i++) {
    board.unshift(createEmptyRow(cols));
  }

  // 步骤 2：行数计算
  const nextLines = state.lines + cleared;
  const totalLines = state.baseLines + nextLines;

  // 步骤 3：等级计算
  const { level: newLevel, levelUpSteps } = calculateLevel(
    totalLines,
    MAX_LEVEL,
  );

  const levelUp = newLevel > state.level;

  // 步骤 4：T-Spin 检测与计分
  const { isTSpin = false, isTSpinMini = false } = state.tSpin || {};
  const tSpinScore = getTSpinScore(cleared, isTSpin, isTSpinMini);

  // 步骤 5：Back-to-Back 检测
  const isBigMove = cleared >= 4 || isTSpin || isTSpinMini;
  const isBackToBack = isBigMove && state.backToBack === true;
  const backToBackMultiplier = isBackToBack ? 1.5 : 1;
  const nextBackToBack = isBigMove;

  // 步骤 6：All Clear 检测
  const isAllClear =
    cleared > 0 && board.every((row) => row.every((cell) => cell === 0));

  const allClearScore = isAllClear ? ALL_CLEAR_SCORE : 0;

  // 步骤 7：分数计算
  const baseScore = tSpinScore || CLEAR_LINE_SCORES[cleared] || 0;
  const clearScore = Math.floor(baseScore * backToBackMultiplier * newLevel);

  // 步骤 8：Combo 计算
  const combo = cleared > 0 ? (state.combo || 0) + 1 : 0;
  const comboScore = combo > 1 ? (combo - 1) * 50 : 0;

  // 步骤 9：返回结果
  return {
    /**
     * 状态更新处理函数。
     *
     * 接收当前 state，返回消行后的新 state。
     *
     * @param {object} prev - 当前状态
     * @returns {object} 新状态
     */
    stateHandler: (prev) => ({
      ...prev,

      clearLines: [],
      tSpin: null,
      backToBack: nextBackToBack,
      board,
      lines: nextLines,
      level: newLevel,
      levelUpSteps,

      // 总分 = 原分数 + (基础分 × B2B倍率 × 等级) + Combo 额外加分 + All Clear 加分
      score: prev.score + clearScore + comboScore + allClearScore,

      clearScore,
      combo,
      comboScore,
    }),

    levelUp,
    level: newLevel,
    levelUpSteps,
    isMaxOut: newLevel >= MAX_LEVEL,
    clearScore,
    cleared,
    isTSpin,
    isTSpinMini,
    isBackToBack,
    isAllClear,
    combo,
    comboScore,
  };
};

export default applyClearLines;
