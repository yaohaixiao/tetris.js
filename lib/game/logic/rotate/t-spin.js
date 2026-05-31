/**
 * # T-Spin 检测（Guideline 标准）
 *
 * 在 T 块锁定后检测 4 个对角位置，判定 T-Spin / T-Spin Mini。
 *
 * ## 检测条件
 *
 * 1. 当前方块必须是 T 块（colorIndex === 3）
 * 2. 最后一次操作必须是旋转（_lastAction === 'rotate'）
 *
 * ## 角位置定义
 *
 * 以 T 块中心 (cx + 1, cy + 1) 为基准：
 *
 *        A ●   ● B
 *           □□□
 *           □■□  ← T 块中心
 *           □
 *        D ●   ● C
 *
 * | 角  | 坐标             |
 * | --- | ---------------- |
 * | A   | (cx, cy)         |
 * | B   | (cx + 2, cy)     |
 * | C   | (cx + 2, cy + 2) |
 * | D   | (cx, cy + 2)     |
 *
 * ## 判定规则
 *
 * - 4 个角中 ≥ 3 个被占据 → **T-Spin**
 * - 2 个角被占据 → **T-Spin Mini**
 * - 否则 → 普通消行
 *
 * ## 角落"被占据"判定
 *
 * 角落满足以下任一条件即为"被占据"：
 *
 * - 棋盘外（越界）
 * - 棋盘内有方块
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

  // 非 T 块，跳过
  if (curr?.colorIndex !== 3) {
    return { isTSpin: false, isTSpinMini: false };
  }

  // 最后一次操作不是旋转，跳过
  if (curr?._lastAction !== 'rotate') {
    return { isTSpin: false, isTSpinMini: false };
  }

  // 定义 4 个角的坐标
  const corners = [
    { x: cx, y: cy }, // A: 左上
    { x: cx + 2, y: cy }, // B: 右上
    { x: cx + 2, y: cy + 2 }, // C: 右下
    { x: cx, y: cy + 2 }, // D: 左下
  ];

  /**
   * 统计被占据的角数量
   *
   * 越界（nx < 0 || nx >= cols || ny >= rows）视为被占据。 棋盘内有方块（ny >= 0 &&
   * board[ny][nx]）也视为被占据。
   */
  let filledCorners = 0;

  for (const { x: nx, y: ny } of corners) {
    // 越界视为被占据
    if (nx < 0 || nx >= cols || ny >= rows) {
      filledCorners++;
      continue;
    }

    // ny >= 0 时检查棋盘（ny < 0 是顶部以上，不视为被占据）
    if (ny >= 0 && board[ny][nx]) {
      filledCorners++;
    }
  }

  // 判定
  if (filledCorners >= 3) {
    return { isTSpin: true, isTSpinMini: false };
  }

  if (filledCorners === 2) {
    return { isTSpin: false, isTSpinMini: true };
  }

  return { isTSpin: false, isTSpinMini: false };
};

export default detectTSpin;
