import COLORS from '@/lib/constants/colors.js';

const { RED, GREEN, BLUE, YELLOW, PURPLE, TEAL, ORANGE } = COLORS;
const DEFAULT_COLOR_MAP = [RED, GREEN, BLUE, YELLOW, PURPLE, TEAL, ORANGE];

/**
 * # 生成随机垃圾行
 *
 * 参考 FC 俄罗斯方块的行为，生成带有随机空洞的垃圾行， 用于在游戏开始时根据难度预填充棋盘。
 *
 * ## 生成规则
 *
 * 1. 每行先用随机颜色填满所有格子
 * 2. 随机挖掉 1 ~ (cols - 3) 个格子（保证至少保留 3 个格子）
 * 3. 保证不会出现完全填满的行（避免开局就消行）
 *
 * ## 难度对应
 *
 * | 难度   | 垃圾行数 |
 * | ------ | -------- |
 * | easy   | 0        |
 * | normal | 3        |
 * | hard   | 6        |
 * | expert | 9        |
 *
 * @example
 *   // 生成 3 行垃圾行，棋盘宽度 10
 *   const garbage = generateGarbageRows(3, 10);
 *   // garbage.length === 3
 *   // 每行有 1 ~ 7 个随机位置为空字符串，其余为随机颜色值
 *
 * @function generateGarbageRows
 * @param {number} rows - 需要生成的垃圾行数量
 * @param {number} cols - 棋盘宽度（列数）
 * @param {string[]} [colorMap] - 可用的方块颜色数组。默认使用 7 种标准颜色
 * @returns {string[][]} 垃圾行矩阵（二维数组），有方块的位置存储颜色值，空的位置存储空字符串
 */
const generateGarbageRows = (rows, cols, colorMap) => {
  // 使用传入的颜色映射或默认的 7 种标准颜色
  const colors = colorMap || DEFAULT_COLOR_MAP;
  const garbage = [];

  // 逐行生成垃圾行
  for (let i = 0; i < rows; i += 1) {
    // 创建一行，初始全部填充空字符串
    const row = Array.from({ length: cols }).fill('');

    // 先全部填满随机颜色
    for (let col = 0; col < cols; col += 1) {
      row[col] = colors[Math.floor(Math.random() * colors.length)];
    }

    // 随机挖 1 ~ (cols - 3) 个空洞，至少保留 3 个格子，避免行太空
    const maxHoles = cols - 3;
    const holes = 1 + Math.floor(Math.random() * maxHoles);
    const holePositions = new Set();

    // 随机选择不重复的空洞位置
    while (holePositions.size < holes) {
      holePositions.add(Math.floor(Math.random() * cols));
    }

    // 将空洞位置设为空字符串
    for (const pos of holePositions) {
      row[pos] = '';
    }

    garbage.push(row);
  }

  return garbage;
};

export default generateGarbageRows;
