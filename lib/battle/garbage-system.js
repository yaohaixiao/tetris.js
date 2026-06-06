import COLORS from '@/lib/constants/colors.js';
import lighten from '@/lib/utils/lighten.js';

const GARBAGE_MAP = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
};

const DIFFICULTY_HOLES = {
  easy: 1,
  normal: 2,
  hard: 3,
  expert: 4,
};

/**
 * # 根据消行数计算攻击
 *
 * @param {Array} lines - 删除
 * @returns {number} - 返回垃圾行数
 */
export const calculateGarbage = (lines) => GARBAGE_MAP[lines] || 0;

/**
 * # 给目标 board 添加垃圾行
 *
 * @param {object} board - Board 对象信息
 * @param {number} amount - 消减数据
 * @param {string} difficulty - 难度等级
 * @returns {object} - 返回 next 数据
 */
export const applyGarbage = (board, amount, difficulty) => {
  if (amount <= 0) {
    return board;
  }

  const width = board[0].length;
  const holeCount = DIFFICULTY_HOLES[difficulty] || 1;
  const next = [...board];

  /** 删除顶部 */
  next.splice(0, amount);

  /** 添加底部垃圾 */
  for (let i = 0; i < amount; i += 1) {
    const row = Array.from({ length: width }).fill(lighten(COLORS.BLACK, 0.6));
    // 随机选择 holeCount 个位置作为空洞
    const holes = new Set();

    while (holes.size < holeCount) {
      holes.add(Math.floor(Math.random() * width));
    }

    for (const h of holes) {
      row[h] = 0;
    }

    next.push(row);
  }

  return next;
};
