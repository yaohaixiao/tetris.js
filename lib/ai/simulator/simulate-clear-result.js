import GAME from '@/lib/game/constants/game.js';
import getTSpinScore from '@/lib/game/utils/get-t-spin-score.js';

/**
 * # 模拟消行计分结果
 *
 * AI 模拟器中的精简版计分逻辑。对消行后的棋盘计算得分、Combo、Back-to-Back、T-Spin 等， 供 `evaluateBoard`
 * 在评分时参考，让 AI 能主动追求高价值消行。
 *
 * ## 与 applyClearLines 的区别
 *
 * | 函数                  | 所属模块   | 职责                         |
 * | --------------------- | ---------- | ---------------------------- |
 * | `applyClearLines`     | 游戏运行时 | 完整计分 + Store 更新 + 动画 |
 * | `simulateClearResult` | AI 模拟器  | 纯数据计分，无副作用         |
 *
 * ## 计分规则
 *
 * 与游戏运行时一致：
 *
 * - 普通消行基础分 × Back-to-Back 倍率
 * - T-Spin 替代普通基础分（含 0 行 T-Spin）
 * - Combo 额外加分 = (combo - 1) × 50
 * - All Clear 固定 2000（仅消行数 > 0 时触发）
 *
 * ## actualCleared 参数
 *
 * 消行后的棋盘满行已被清除，无法通过遍历检测消行数。 调用方（selfPlay）在消行前统计**本次新增**的满行数，通过此参数传入真实值。
 * 如果未传入（?? 操作符），退化为从棋盘自动检测（兼容旧调用，但此时 cleared 永远为 0）。
 *
 * @function simulateClearResult
 * @param {number[][]} board - 消行后的棋盘
 * @param {object} snapshot - 当前快照（含 combo/backToBack/tSpin）
 * @param {number} [actualCleared] - 本次实际消除的行数（消行前统计），不传则从棋盘自动检测
 * @returns {object | null} 消行结果对象，无消行且非 T-Spin 时返回 null
 */
const simulateClearResult = (board, snapshot, actualCleared) => {
  // 从游戏常量中获取消行基础分映射表
  const { CLEAR_LINE_SCORES } = GAME;

  /**
   * 消除行数。
   *
   * 优先使用调用方传入的真实值（消行前统计）， 未传入时退化为从棋盘自动检测（此时始终为 0，因为消行后满行已被清除）。
   */
  const cleared =
    actualCleared ??
    board.filter((row) => row.every((cell) => cell !== 0)).length;

  /** T-Spin 检测结果。 从快照中读取 lock 阶段写入的 T-Spin 标记。 */
  const { isTSpin = false, isTSpinMini = false } = snapshot.tSpin || {};

  /**
   * 无消行且非 T-Spin → 没有任何得分事件。
   *
   * 注意：T-Spin 0 行仍然是一个有效的得分事件（baseScore=400）， 因此不能简单地用 cleared===0 跳过。
   */
  if (cleared === 0 && !isTSpin && !isTSpinMini) {
    return null;
  }

  /**
   * 基础分计算。
   *
   * T-Spin 存在时使用 T-Spin 计分表（覆盖普通消行基础分）， 否则使用 CLEAR_LINE_SCORES 中对应消除行数的分值。
   */
  const tSpinScore = getTSpinScore(cleared, isTSpin, isTSpinMini);
  const baseScore = tSpinScore || CLEAR_LINE_SCORES[cleared] || 0;

  /**
   * 大招判定。
   *
   * 大招定义：Tetris（消 4 行以上）或 T-Spin / T-Spin Mini 消行。 用于判断是否触发 Back-to-Back。
   */
  const isBigMove = cleared >= 4 || isTSpin || isTSpinMini;

  /**
   * Back-to-Back 判定。
   *
   * 本轮是大招 且 上一轮也是大招（snapshot.backToBack === true）时触发。 B2B 倍率为 1.5 倍。
   */
  const isBackToBack = isBigMove && snapshot.backToBack === true;
  const multiplier = isBackToBack ? 1.5 : 1;

  /**
   * Combo 计算。
   *
   * 消行时 combo +1。 Combo ≥ 2 时额外加分 = (combo - 1) × 50。
   */
  const combo = (snapshot.combo || 0) + 1;
  const comboScore = combo > 1 ? (combo - 1) * 50 : 0;

  /**
   * All Clear 判定。
   *
   * 消行后棋盘完全清空时触发。 注意：只有实际消了行（cleared > 0）才可能触发 All Clear， T-Spin 0 行即使棋盘全空也不计为
   * All Clear。
   */
  const isAllClear =
    cleared > 0 && board.every((row) => row.every((c) => c === 0));

  // All Clear 固定奖励 2000 分
  const allClearScore = isAllClear ? 2000 : 0;

  /**
   * 最终得分。
   *
   * = floor(基础分 × B2B倍率) + Combo额外加分 + All Clear加分
   */
  const clearScore =
    Math.floor(baseScore * multiplier) + comboScore + allClearScore;

  // 返回完整的消行计分结果，供 evaluateBoard 使用
  return {
    /** 消除行数 */
    cleared,
    /** 基础分（乘倍率前） */
    baseScore,
    /** 最终得分 */
    clearScore,
    /** 是否为 T-Spin */
    isTSpin,
    /** 是否为 T-Spin Mini */
    isTSpinMini,
    /** 是否为大招（用于更新 Back-to-Back 状态） */
    isBigMove,
    /** 是否触发了 Back-to-Back 奖励 */
    isBackToBack,
    /** 是否触发了 All Clear */
    isAllClear,
    /** 更新后的连击次数 */
    combo,
    /** 本次 Combo 额外加分 */
    comboScore,
    /** 本次 All Clear 加分 */
    allClearScore,
  };
};

export default simulateClearResult;
