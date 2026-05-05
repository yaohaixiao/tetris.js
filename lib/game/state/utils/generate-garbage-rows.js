import COLORS from '@/lib/constants/colors.js';

const { RED, GREEN, BLUE, YELLOW, PURPLE, TEAL, ORANGE } = COLORS;
const DEFAULT_COLOR_MAP = [RED, GREEN, BLUE, YELLOW, PURPLE, TEAL, ORANGE];

/**
 * # 生成随机垃圾行
 *
 * 参考 FC 俄罗斯方块的行为：
 *
 * - 每行随机缺失 1~2 个格子
 * - 保证不会出现完全填满的行
 *
 * @function generateGarbageRows
 * @param {number} rows - 需要生成的垃圾行数量
 * @param {number} cols - 棋盘宽度
 * @param {Array} [colorMap] - 方块颜色
 * @returns {string[][]} - 返回垃圾行矩阵，格式同你的 board（有方块的位置存颜色值，空的位置存空字符串）
 */
const generateGarbageRows = (rows, cols, colorMap) => {
  // 可用的方块颜色
  const colors = colorMap || DEFAULT_COLOR_MAP;
  const garbage = [];

  for (let i = 0; i < rows; i += 1) {
    const row = Array.from({ length: cols }).fill('');

    // 先全部填满
    for (let col = 0; col < cols; col += 1) {
      // 随机选一个颜色
      row[col] = colors[Math.floor(Math.random() * colors.length)];
    }

    // 随机挖 1 ~ maxHoles 个洞
    const maxHoles = cols - 3;
    const holes = 1 + Math.floor(Math.random() * maxHoles);
    const holePositions = new Set();

    while (holePositions.size < holes) {
      holePositions.add(Math.floor(Math.random() * cols));
    }

    for (const pos of holePositions) {
      row[pos] = '';
    }

    garbage.push(row);
  }

  return garbage;
};

export default generateGarbageRows;
