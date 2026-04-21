/**
 * # 应用重力下落（Apply Gravity）
 *
 * ## 功能说明
 *
 * 将棋盘中每一列的方块“向下压缩”，模拟重力效果：
 *
 * - 移除空格（0 / null）
 * - 将非空方块按列向下排列
 * - 顶部补 0（空格）
 *
 * ## 核心逻辑
 *
 * 1. 按列遍历（x 轴）
 * 2. 从下往上收集非空方块（stack）
 * 3. 再从下往上回填
 * 4. 记录是否发生变化（moved）
 *
 * @param {(number | string)[][]} board - 游戏棋盘二维数组
 * @returns {boolean} Moved - 是否发生了方块位移
 */
const applyGravity = (board) => {
  const ROWS = board.length;
  const COLS = board[0].length;

  /**
   * 是否发生位移
   *
   * - True = 有方块移动（需要触发动画）
   * - False = 没有变化
   */
  let moved = false;

  // 按列处理（重力方向：Y轴）
  for (let x = 0; x < COLS; x++) {
    /**
     * 临时栈，用于存储当前列的“非空方块”
     *
     * 注意：
     *
     * - 使用数组 push + 指针访问（避免 shift 性能问题）
     */
    const stack = [];

    // 1. 收集该列所有非空方块
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y][x]) {
        stack.push(board[y][x]);
      }
    }

    // 2. 用指针方式回填（优化替代 shift）
    let idx = 0;

    for (let y = ROWS - 1; y >= 0; y--) {
      /**
       * 从 stack 顺序取值：
       *
       * - 有方块 → 填入
       * - 无方块 → 填 0
       */
      const val = stack[idx++] || 0;

      /**
       * 检测是否发生变化
       *
       * - 用于判断是否需要触发动画系统
       */
      if (board[y][x] !== val) {
        moved = true;
      }

      // 写回棋盘
      board[y][x] = val;
    }
  }

  // 返回是否发生移动
  return moved;
};

export default applyGravity;
