import COLORS from '@/lib/constants/colors.js';
import lighten from '@/lib/utils/color/lighten.js';

/**
 * 消行数与垃圾行数映射表。
 *
 * | 消行数 | 垃圾行数 | 说明                   |
 * | :----- | :------- | :--------------------- |
 * | 1      | 0        | Single - 无攻击力      |
 * | 2      | 1        | Double - 送 1 行垃圾   |
 * | 3      | 2        | Triple - 送 2 行垃圾   |
 * | 4      | 3        | Tetris - 送 3 行垃圾   |
 * | 5+     | 4        | 超级消除 - 送 4 行垃圾 |
 *
 * @constant {Object<number, number>}
 */
const GARBAGE_MAP = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
};

/**
 * 难度等级对应的垃圾行空洞数。
 *
 * | 难度   | 空洞数 | 说明                    |
 * | :----- | :----- | :---------------------- |
 * | easy   | 1      | 每行 1 个空洞，容易填补 |
 * | normal | 2      | 每行 2 个空洞，需要规划 |
 * | hard   | 3      | 每行 3 个空洞，较难处理 |
 * | expert | 4      | 每行 4 个空洞，极难填补 |
 *
 * @constant {Object<string, number>}
 */
const DIFFICULTY_HOLES = {
  easy: 1,
  normal: 2,
  hard: 3,
  expert: 4,
};

/**
 * ============================================================
 *
 * # 根据消行数计算攻击力
 *
 * ============================================================
 *
 * 将玩家的消行数量转换为对对手的垃圾行攻击数量。 这是对战系统中攻击计算的核心函数。
 *
 * @function calculateGarbage
 * @param {number} lines - 玩家消除的行数
 * @returns {number} 对对手造成的垃圾行数，0 表示无攻击
 */
export const calculateGarbage = (lines) => GARBAGE_MAP[lines] || 0;

/**
 * ============================================================
 *
 * # 对目标棋盘应用垃圾行
 *
 * ============================================================
 *
 * 在对手棋盘底部添加指定数量的垃圾行，模拟受到攻击的效果。 这是对战系统中垃圾行生成的核心函数。
 *
 * ## 处理流程
 *
 * 1. 检查 amount 是否有效（> 0）
 * 2. 从棋盘顶部移除 amount 行（模拟棋盘上升）
 * 3. 在棋盘底部添加 amount 行新垃圾行
 * 4. 每行随机生成 holeCount 个空洞
 *
 * ## 垃圾行结构
 *
 * 每个垃圾行是一个长度为棋盘宽度的数组：
 *
 * - 实心格子：填充灰色（lighten(COLORS.BLACK, 0.6)）
 * - 空洞格子：值为 0，可被方块填充
 *
 * @function applyGarbage
 * @param {number[][]} board - 目标棋盘，二维数组
 * @param {number} amount - 要添加的垃圾行数量
 * @param {string} difficulty - 难度等级
 * @returns {number[][]} 应用垃圾行后的新棋盘（不修改原棋盘）
 */
export const applyGarbage = (board, amount, difficulty) => {
  if (amount <= 0) {
    return board;
  }

  const width = board[0].length;
  const holeCount = DIFFICULTY_HOLES[difficulty] || 1;

  // 创建棋盘副本
  const next = [...board];

  // 步骤 1：从顶部移除行（模拟棋盘上升）
  next.splice(0, amount);

  // 步骤 2：在底部添加垃圾行
  for (let i = 0; i < amount; i += 1) {
    // 创建垃圾行，初始填充灰色
    const row = Array.from({ length: width }).fill(lighten(COLORS.BLACK, 0.6));

    // 随机生成空洞位置
    const holes = new Set();

    while (holes.size < holeCount) {
      holes.add(Math.floor(Math.random() * width));
    }

    // 将空洞位置设为 0（空格）
    for (const h of holes) {
      row[h] = 0;
    }

    next.push(row);
  }

  return next;
};
