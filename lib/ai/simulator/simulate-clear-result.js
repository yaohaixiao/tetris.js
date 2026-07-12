import GAME from '@/lib/game/constants/game.js';
import getTSpinScore from '@/lib/game/utils/get-t-spin-score.js';

/**
 * ============================================================
 *
 * # 模拟消行计分结果
 *
 * ============================================================
 *
 * AI 模拟器中的精简版计分逻辑。 对消行后的棋盘计算得分、Combo、Back-to-Back、T-Spin 等， 供 evaluateBoard
 * 在评分时参考，让 AI 能主动追求高价值消行。
 *
 * ## 与 applyClearLines 的区别
 *
 * | 函数                | 所属模块   | 职责                         |
 * | :------------------ | :--------- | :--------------------------- |
 * | applyClearLines     | 游戏运行时 | 完整计分 + Store 更新 + 动画 |
 * | simulateClearResult | AI 模拟器  | 纯数据计分，无副作用         |
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
 * 消行后的棋盘满行已被清除，无法通过遍历检测消行数。 调用方在消行前统计本次新增的满行数，通过此参数传入真实值。 如果未传入，退化为从棋盘自动检测（但此时
 * cleared 永远为 0）。
 *
 * @function simulateClearResult
 * @param {number[][]} board - 消行后的棋盘
 * @param {object} snapshot - 当前快照
 * @param {number} [actualCleared] - 本次实际消除的行数
 * @returns {object | null} 消行结果对象，无消行且非 T-Spin 时返回 null
 */
const simulateClearResult = (board, snapshot, actualCleared) => {
  const { CLEAR_LINE_SCORES } = GAME;

  // 优先使用调用方传入的真实值，未传入时从棋盘自动检测
  const cleared =
    actualCleared ??
    board.filter((row) => row.every((cell) => cell !== 0)).length;

  const { isTSpin = false, isTSpinMini = false } = snapshot.tSpin || {};

  // 无消行且非 T-Spin → 无任何得分事件
  if (cleared === 0 && !isTSpin && !isTSpinMini) {
    return null;
  }

  // 基础分：T-Spin 存在时使用 T-Spin 计分表
  const tSpinScore = getTSpinScore(cleared, isTSpin, isTSpinMini);
  const baseScore = tSpinScore || CLEAR_LINE_SCORES[cleared] || 0;

  // Back-to-Back 判定
  const isBigMove = cleared >= 4 || isTSpin || isTSpinMini;
  const isBackToBack = isBigMove && snapshot.backToBack === true;
  const multiplier = isBackToBack ? 1.5 : 1;

  // Combo 计算
  const combo = (snapshot.combo || 0) + 1;
  const comboScore = combo > 1 ? (combo - 1) * 50 : 0;

  // All Clear 判定（仅消行数 > 0 时触发）
  const isAllClear =
    cleared > 0 && board.every((row) => row.every((c) => c === 0));

  const allClearScore = isAllClear ? 2000 : 0;

  // 最终得分
  const clearScore =
    Math.floor(baseScore * multiplier) + comboScore + allClearScore;

  return {
    cleared,
    baseScore,
    clearScore,
    isTSpin,
    isTSpinMini,
    isBigMove,
    isBackToBack,
    isAllClear,
    combo,
    comboScore,
    allClearScore,
  };
};

export default simulateClearResult;
