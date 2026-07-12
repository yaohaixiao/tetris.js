/**
 * ============================================================
 *
 * # 清除棋盘中的所有满行
 *
 * ============================================================
 *
 * 扫描棋盘的每一行，将完全填满的行移除， 并在棋盘顶部补充对应数量的空行，保持棋盘总行数不变。
 *
 * ## 处理逻辑
 *
 * 1. 过滤掉所有满行（每个格子都非 0 的行）
 * 2. 计算被移除的行数
 * 3. 在棋盘顶部补充等量的空行（全 0 行）
 *
 * ## 为什么在 AI 模拟中需要这个函数？
 *
 * 在 lookahead（前瞻搜索）过程中， AI 需要模拟"放完方块后消除满行"的场景， 才能正确评估后续步骤的棋盘状态。
 *
 * 真实游戏中的消行由 applyClearLines 处理（含动画、计分），AI 模拟只需要纯数据操作。
 *
 * ## 不可变性
 *
 * - Filter() 返回新数组，不修改原棋盘
 * - 函数整体返回一个新棋盘，原始 board 不受影响
 *
 * ## 与真实消行的区别
 *
 * | 函数            | 所属模块   | 职责                       |
 * | :-------------- | :--------- | :------------------------- |
 * | applyClearLines | 游戏运行时 | 消行动画 + 计分 + 等级更新 |
 * | clearFullLines  | AI 模拟器  | 纯数据结构消行，无副作用   |
 *
 * @function clearFullLines
 * @param {number[][]} board - 棋盘二维数组
 * @returns {number[][]} 消除满行后的新棋盘（行数与原棋盘相同）
 */
const clearFullLines = (board) => {
  // 过滤掉所有满行
  const result = board.filter((row) => !row.every((cell) => cell !== 0));

  // 在顶部补充等量空行
  while (result.length < board.length) {
    result.unshift(Array.from({ length: board[0].length }).fill(0));
  }

  return result;
};

export default clearFullLines;
