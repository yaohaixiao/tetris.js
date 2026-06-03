/**
 * # T-Spin 检测（Guideline 标准）
 *
 * 在 T 块锁定后检测 4 个对角位置，根据被占据的角数量判定 T-Spin 或 T-Spin Mini。
 *
 * 这是俄罗斯方块 Guideline 标准中定义的 T-Spin 判定算法。
 *
 * ## 前置条件
 *
 * 以下两个条件必须同时满足才会进行检测，否则直接返回 false：
 *
 * 1. 当前方块必须是 T 块（`colorIndex === 3`）
 * 2. 最后一次操作必须是旋转（`_lastAction === 'rotate'`）
 *
 * ## 角位置定义
 *
 * 以 T 块中心 `(cx + 1, cy + 1)` 为基准，4 个对角如下：
 *
 *          A ●   ● B
 *         □□□
 *         □■□  ← T 块中心 (cx+1, cy+1)
 *         □
 *      D ●   ● C
 *
 * | 角  | 坐标             | 位置 |
 * | --- | ---------------- | ---- |
 * | A   | (cx, cy)         | 左上 |
 * | B   | (cx + 2, cy)     | 右上 |
 * | C   | (cx + 2, cy + 2) | 右下 |
 * | D   | (cx, cy + 2)     | 左下 |
 *
 * ## 判定规则
 *
 * | 被占据角数 | 结果        |
 * | ---------- | ----------- |
 * | ≥ 3        | T-Spin      |
 * | 2          | T-Spin Mini |
 * | ≤ 1        | 普通消行    |
 *
 * ## 角落"被占据"判定
 *
 * 角落满足以下任一条件即视为"被占据"：
 *
 * - **越界**：坐标超出棋盘左右边界或底部（`nx < 0 || nx >= cols || ny >= rows`）
 * - **有方块**：坐标在棋盘内且该位置已有方块（`ny >= 0 && board[ny][nx]`）
 *
 * 注意：`ny < 0`（棋盘顶部以上）不视为被占据，因为方块从顶部生成需要空间。
 *
 * @param {object} runtime - 游戏运行时对象
 * @param {object} runtime.Store - 状态管理 Store 实例
 * @param {Function} runtime.Store.getState - 获取当前状态的方法
 * @param {object} runtime.Elements - 游戏元素对象
 * @param {object} runtime.Elements.Canvas - 画布配置对象
 * @param {number} runtime.Elements.Canvas.rows - 棋盘总行数
 * @param {number} runtime.Elements.Canvas.cols - 棋盘总列数
 * @returns {{ isTSpin: boolean; isTSpinMini: boolean }} 检测结果
 */
const detectTSpin = (runtime) => {
  /*
   * ==================== 获取游戏状态 ====================
   *
   * 从 Store 中提取当前方块信息、坐标和棋盘数据，
   * 从 Elements 中获取棋盘行列数
   */
  const { Store, Elements } = runtime;
  const state = Store.getState();
  const { curr, cx, cy, board } = state;
  const { rows, cols } = Elements.Canvas;

  /*
   * ==================== 前置条件 1：检测是否为 T 块 ====================
   *
   * T 块的 colorIndex 固定为 3，非 T 块不可能产生 T-Spin
   */
  if (curr?.colorIndex !== 3) {
    return { isTSpin: false, isTSpinMini: false };
  }

  /*
   * ==================== 前置条件 2：检测最后操作是否为旋转 ====================
   *
   * Guideline 标准要求 T-Spin 必须由旋转操作触发，
   * 仅移动后锁定不构成 T-Spin
   */
  if (curr?._lastAction !== 'rotate') {
    return { isTSpin: false, isTSpinMini: false };
  }

  /*
   * ==================== 定义 4 个对角坐标 ====================
   *
   * A: 左上角 (cx, cy)
   * B: 右上角 (cx + 2, cy)
   * C: 右下角 (cx + 2, cy + 2)
   * D: 左下角 (cx, cy + 2)
   */
  const corners = [
    { x: cx, y: cy }, // A — 左上
    { x: cx + 2, y: cy }, // B — 右上
    { x: cx + 2, y: cy + 2 }, // C — 右下
    { x: cx, y: cy + 2 }, // D — 左下
  ];

  /*
   * ==================== 统计被占据的角数量 ====================
   *
   * 遍历 4 个角，按以下规则判定是否被占据：
   * 1. 越界（左右边界外或底部以下）→ 被占据
   * 2. 棋盘内有方块 → 被占据
   * 3. 顶部以上（ny < 0）→ 不视为被占据
   */
  let filledCorners = 0;

  for (const { x: nx, y: ny } of corners) {
    /*
     * ==================== 越界检测 ====================
     *
     * 超出左右边界或底部边界视为被占据，
     * 这是 T-Spin 的常见触发条件（贴墙/贴底旋转）
     */
    if (nx < 0 || nx >= cols || ny >= rows) {
      filledCorners++;
      continue;
    }

    /*
     * ==================== 棋盘内方块检测 ====================
     *
     * ny >= 0 确保在棋盘范围内（排除顶部以上），
     * board[ny][nx] 为非零值表示该位置已被占据
     */
    if (ny >= 0 && board[ny][nx]) {
      filledCorners++;
    }
  }

  /*
   * ==================== 判定 T-Spin 等级 ====================
   *
   * ≥ 3 个角被占据 → T-Spin
   * 2 个角被占据   → T-Spin Mini
   * ≤ 1 个角被占据 → 普通消行
   */
  if (filledCorners >= 3) {
    return { isTSpin: true, isTSpinMini: false };
  }

  if (filledCorners === 2) {
    return { isTSpin: false, isTSpinMini: true };
  }

  return { isTSpin: false, isTSpinMini: false };
};

export default detectTSpin;
