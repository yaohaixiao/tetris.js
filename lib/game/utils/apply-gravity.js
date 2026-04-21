/**
 * # 应用重力下落（Apply Gravity）
 *
 * ## 功能说明
 *
 * 仅对消除行上方的方块下落，并填补消除行下方的空缺。 消除行下方的空格不应受到影响，只有上方的方块下落填补这些空缺。
 *
 * ## 核心逻辑
 *
 * 1. 按列遍历（x 轴）
 * 2. 从下往上收集非空方块（stack）
 * 3. 在消除行上方的空格中填充方块
 * 4. 记录是否发生变化（moved）
 *
 * @function applyGravity
 * @param {(number | string)[][]} board - 游戏棋盘二维数组
 * @param {number[]} clearLines - 已消除的行号数组
 * @returns {boolean} Moved - 是否发生了方块位移
 */
const applyGravity = (board, clearLines) => {
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

    // 1. 收集该列所有非空方块，排除消除行（只对消除行上方的部分进行重力处理）
    for (let y = ROWS - 1; y >= 0; y--) {
      if (!clearLines.includes(y) && board[y][x]) {
        stack.push(board[y][x]);
      }
    }

    // 2. 用指针方式回填（优化替代 shift）
    let idx = 0;

    for (let y = ROWS - 1; y >= 0; y--) {
      // 如果当前行是消除行或者以下行，跳过回填
      if (clearLines.includes(y)) continue;

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
