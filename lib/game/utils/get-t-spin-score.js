/**
 * # T-Spin 计分表
 *
 * 根据消除行数和 T-Spin 类型返回对应的基础分数。
 *
 * ## 计分规则
 *
 * | 消除行数 | T-Spin | T-Spin Mini |
 * | -------- | ------ | ----------- |
 * | 0        | 400    | 100         |
 * | 1        | 800    | 200         |
 * | 2        | 1200   | 400         |
 * | 3        | 1600   | —（不存在） |
 *
 * ## 补充说明
 *
 * - T-Spin Mini 最多消除 2 行，不存在消 3 行的情况
 * - 传入非法的 `cleared` 值（如负数或 >3）时返回 0，保证不会崩溃
 * - 返回的分数为基础分，实际计分时可能再乘以当前关卡等级
 *
 * @param {number} cleared - 消除行数（0-3）
 * @param {boolean} isTSpin - 是否为 T-Spin
 * @param {boolean} isTSpinMini - 是否为 T-Spin Mini
 * @returns {number} T-Spin 基础分数，不符合条件时返回 0
 */
const getTSpinScore = (cleared, isTSpin, isTSpinMini) => {
  /*
   * ==================== T-Spin 计分 ====================
   *
   * 按消除行数从预定义数组中取分：
   * 0 行 → 400，1 行 → 800，2 行 → 1200，3 行 → 1600
   */
  if (isTSpin) {
    const scores = [400, 800, 1200, 1600];
    return scores[cleared] || 0;
  }

  /*
   * ==================== T-Spin Mini 计分 ====================
   *
   * Mini 分数较低且最多 2 行：
   * 0 行 → 100，1 行 → 200，2 行 → 400
   */
  if (isTSpinMini) {
    const scores = [100, 200, 400];
    return scores[cleared] || 0;
  }

  /*
   * ==================== 非 T-Spin ====================
   *
   * 普通消行不走此函数，兜底返回 0
   */
  return 0;
};

export default getTSpinScore;
