/**
 * # 应用重力下落（Apply Gravity）
 *
 * 仅对消除行上方的方块下落，并填补消除行下方的空缺。
 *
 * 消除行下方的空格不应受到影响，只有上方的方块下落填补这些空缺。
 *
 * @function applyGravity
 * @param {object} board - 游戏画布对象
 * @param {Array} clearLines - 清除的方块层数信息
 * @returns {boolean} - 是否移动
 */
const applyGravity = (board, clearLines) => {
  const ROWS = board.length;
  const COLS = board[0].length;
  let moved = false;

  // 逐列处理（重力方向：Y轴向下）
  for (let x = 0; x < COLS; x++) {
    const columnBlocks = [];

    // 步骤1：收集【消除行上方】的所有非空方块
    for (let y = 0; y < ROWS; y++) {
      // 只收集：消除行 上方 的方块 + 非空
      if (!clearLines.includes(y) && board[y][x] !== 0) {
        columnBlocks.push(board[y][x]);
      }
    }

    // 步骤2：先清空整列（准备重新填充）
    for (let y = 0; y < ROWS; y++) {
      board[y][x] = 0;
    }

    // 步骤3：从【最底部】开始回填方块（真正的重力下落）
    let dropPosition = ROWS - 1;

    // 倒序回填，让方块沉底
    for (let i = columnBlocks.length - 1; i >= 0; i--) {
      board[dropPosition][x] = columnBlocks[i];
      // 标记方块移动了
      if (board[dropPosition][x] !== 0) {
        moved = true;
      }

      dropPosition--;
    }
  }

  return moved;
};

export default applyGravity;
