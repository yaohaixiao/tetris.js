import GAME from '@/lib/game/constants/game.js';

/**
 * ============================================================
 *
 * # T-Spin 计分表
 *
 * ============================================================
 *
 * 根据消除行数和 T-Spin 类型返回对应的基础分数。
 *
 * ## 计分规则
 *
 * | 消除行数 | T-Spin | T-Spin Mini |
 * | :------- | :----- | :---------- |
 * | 0        | 400    | 100         |
 * | 1        | 800    | 200         |
 * | 2        | 1200   | 400         |
 * | 3        | 1600   | —（不存在） |
 *
 * ## 补充说明
 *
 * - T-Spin Mini 最多消除 2 行，不存在消 3 行的情况
 * - 传入非法的 cleared 值时返回 0，保证不会崩溃
 * - 返回的分数为基础分，实际计分时可能再乘以当前关卡等级
 *
 * @function getTSpinScore
 * @param {number} cleared - 消除行数（0-3）
 * @param {boolean} isTSpin - 是否为 T-Spin
 * @param {boolean} isTSpinMini - 是否为 T-Spin Mini
 * @returns {number} T-Spin 基础分数，不符合条件时返回 0
 */
const getTSpinScore = (cleared, isTSpin, isTSpinMini) => {
  const { T_SPIN_SCORES, T_SPIN_MINI_SCORES } = GAME;

  // T-Spin 计分：0行→400, 1行→800, 2行→1200, 3行→1600
  if (isTSpin) {
    return T_SPIN_SCORES[cleared] || 0;
  }

  // T-Spin Mini 计分：0行→100, 1行→200, 2行→400
  if (isTSpinMini) {
    return T_SPIN_MINI_SCORES[cleared] || 0;
  }

  // 非 T-Spin，兜底返回 0
  return 0;
};

export default getTSpinScore;
