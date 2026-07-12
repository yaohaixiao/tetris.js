/**
 * ============================================================
 *
 * # 深拷贝棋盘
 *
 * ============================================================
 *
 * 对棋盘进行深拷贝，确保 AI 模拟操作不会污染原始棋盘数据。
 *
 * ## 使用场景
 *
 * 在 simulateDrop 中，需要对棋盘进行深拷贝后再写入方块， 以生成用于 evaluateBoard 评分的候选棋盘。
 *
 * @function cloneBoard
 * @param {number[][]} board - 棋盘二维数组
 * @returns {number[][]} 深拷贝后的新棋盘
 */
const cloneBoard = (board) => board.map((row) => [...row]);

export default cloneBoard;
