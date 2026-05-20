/**
 * # 深拷贝棋盘
 *
 * 使用浏览器原生 `structuredClone` API 对棋盘进行深拷贝， 确保 AI 模拟操作不会污染原始棋盘数据。
 *
 * ## 使用场景
 *
 * 在 `simulateDrop` 中，需要对棋盘进行深拷贝后再写入方块， 以生成用于 `evaluateBoard` 评分的候选棋盘。
 *
 * ## 兼容性说明
 *
 * `structuredClone` 支持现代浏览器和 Node.js 17+， 可正确拷贝二维数组及数组内的基本类型值（数字、字符串）。
 * 由于棋盘仅包含数字或字符串，不存在函数、Symbol 等不可克隆类型， 因此无需 fallback 逻辑。
 *
 * @example
 *   const original = [
 *     [1, 0],
 *     [0, 1],
 *   ];
 *   const copy = cloneBoard(original);
 *   copy[0][0] = 99;
 *   console.log(original[0][0]); // 1（不受影响）
 *
 * @function cloneBoard
 * @param {(number | string)[][]} board - 棋盘二维数组
 * @returns {(number | string)[][]} 深拷贝后的新棋盘
 */
const cloneBoard = (board) => structuredClone(board);

export default cloneBoard;
