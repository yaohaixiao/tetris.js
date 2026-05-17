const GARBAGE_MAP = {
  1: 0,
  2: 1,
  3: 2,
  4: 4,
};

/** 根据消行数计算攻击 */
export const calculateGarbage = (lines) => GARBAGE_MAP[lines] || 0;

/** 给目标 board 添加垃圾行 */
export const applyGarbage = (board, amount) => {
  if (amount <= 0) {
    return board;
  }

  const width = board[0].length;

  const next = [...board];

  /** 删除顶部 */
  next.splice(0, amount);

  /** 添加底部垃圾 */
  for (let i = 0; i < amount; i += 1) {
    const hole = Math.floor(Math.random() * width);

    const row = Array.from({ length: width }).fill(8);

    row[hole] = 0;

    next.push(row);
  }

  return next;
};
