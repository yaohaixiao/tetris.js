/**
 * ## 计算井奖励（Well Bonus）
 *
 * 井是一列高度明显低于两侧的深槽，专门用来放 I 块消 Tetris。 检测条件：当前列高度比左右两列都低 3 格以上。 奖励 = 井深 × 0.8，鼓励
 * AI 留井等 I 块。
 *
 * 只检测内部列（x=1 ~ cols-2），左右边界不检测。
 *
 * @example
 *   const heights = [5, 5, 1, 5, 5];
 *   getWellBonus(heights); // (5-1) × 0.8 = 3.2
 *
 * @function getWellBonus
 * @param {number[]} heights - 每列高度数组
 * @returns {number} 井奖励分数
 */
const getWellBonus = (heights) => {
  const WELL_THRESHOLD = 3;
  const WELL_WEIGHT = 0.8;
  let bonus = 0;

  for (let x = 1; x < heights.length - 1; x++) {
    const left = heights[x - 1];
    const cur = heights[x];
    const right = heights[x + 1];

    // 当前列比两侧都低 3 格以上 → 井
    if (cur < left - WELL_THRESHOLD && cur < right - WELL_THRESHOLD) {
      const depth = Math.min(left, right) - cur;
      bonus += depth * WELL_WEIGHT;
    }
  }

  return bonus;
};

export default getWellBonus;
