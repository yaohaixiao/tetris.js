/**
 * ## T-Spin 计分表
 *
 * 根据消除行数和 T-Spin 类型返回对应基础分。
 *
 * | 消除行数 | T-Spin | T-Spin Mini |
 * | -------- | ------ | ----------- |
 * | 0        | 400    | 100         |
 * | 1        | 800    | 200         |
 * | 2        | 1200   | 400         |
 * | 3        | 1600   | —           |
 *
 * @param {number} cleared - 消除行数
 * @param {boolean} isTSpin - 是否为 T-Spin
 * @param {boolean} isTSpinMini - 是否为 T-Spin Mini
 * @returns {number} T-Spin 基础分
 */
const getTSpinScore = (cleared, isTSpin, isTSpinMini) => {
  if (isTSpin) {
    const scores = [400, 800, 1200, 1600];
    return scores[cleared] || 0;
  }

  if (isTSpinMini) {
    const scores = [100, 200, 400];
    return scores[cleared] || 0;
  }

  return 0;
};

export default getTSpinScore;
