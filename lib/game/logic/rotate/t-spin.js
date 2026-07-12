/**
 * ============================================================
 *
 * # T-Spin 检测（Guideline 标准）
 *
 * ============================================================
 *
 * 在 T 块锁定后检测 4 个对角位置，根据被占据的角数量判定 T-Spin 或 T-Spin Mini。
 *
 * 这是俄罗斯方块 Guideline 标准中定义的 T-Spin 判定算法。
 *
 * ## 前置条件
 *
 * 以下两个条件必须同时满足才会进行检测：
 *
 * 1. 当前方块必须是 T 块（colorIndex === 3）
 * 2. 最后一次操作必须是旋转（_lastAction === 'rotate'）
 *
 * ## 角位置定义
 *
 * 以 T 块中心 (cx + 1, cy + 1) 为基准，4 个对角如下：
 *
 *          A ●   ● B
 *         □□□
 *         □■□  ← T 块中心 (cx+1, cy+1)
 *         □
 *      D ●   ● C
 *
 * | 角  | 坐标             | 位置 |
 * | :-- | :--------------- | :--- |
 * | A   | (cx, cy)         | 左上 |
 * | B   | (cx + 2, cy)     | 右上 |
 * | C   | (cx + 2, cy + 2) | 右下 |
 * | D   | (cx, cy + 2)     | 左下 |
 *
 * ## 判定规则
 *
 * | 被占据角数 | 结果        |
 * | :--------- | :---------- |
 * | ≥ 3        | T-Spin      |
 * | 2          | T-Spin Mini |
 * | ≤ 1        | 普通消行    |
 *
 * ## 角落"被占据"判定
 *
 * 角落满足以下任一条件即视为"被占据"：
 *
 * - 越界：坐标超出棋盘左右边界或底部
 * - 有方块：坐标在棋盘内且该位置已有方块
 *
 * 注意：ny < 0（棋盘顶部以上）不视为被占据。
 *
 * @function detectTSpin
 * @param {object} runtime - 游戏运行时对象
 * @returns {{ isTSpin: boolean; isTSpinMini: boolean }} 检测结果
 */
const detectTSpin = (runtime) => {
  const { Store, Elements } = runtime;
  const state = Store.getState();
  const { curr, cx, cy, board } = state;
  const { rows, cols } = Elements.Canvas;

  // 前置条件 1：必须是 T 块
  if (curr?.colorIndex !== 3) {
    return { isTSpin: false, isTSpinMini: false };
  }

  // 前置条件 2：最后一次操作必须是旋转
  if (curr?._lastAction !== 'rotate') {
    return { isTSpin: false, isTSpinMini: false };
  }

  // 定义 4 个对角坐标
  const corners = [
    { x: cx, y: cy }, // A — 左上
    { x: cx + 2, y: cy }, // B — 右上
    { x: cx + 2, y: cy + 2 }, // C — 右下
    { x: cx, y: cy + 2 }, // D — 左下
  ];

  // 统计被占据的角数量
  let filledCorners = 0;

  for (const { x: nx, y: ny } of corners) {
    // 越界检测
    if (nx < 0 || nx >= cols || ny >= rows) {
      filledCorners++;
      continue;
    }

    // 棋盘内方块检测
    if (ny >= 0 && board[ny][nx]) {
      filledCorners++;
    }
  }

  // 判定 T-Spin 等级
  if (filledCorners >= 3) {
    return { isTSpin: true, isTSpinMini: false };
  }

  if (filledCorners === 2) {
    return { isTSpin: false, isTSpinMini: true };
  }

  return { isTSpin: false, isTSpinMini: false };
};

export default detectTSpin;
