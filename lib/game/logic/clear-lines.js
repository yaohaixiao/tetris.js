import Game from '@/lib/game';
import UI from '@/lib/services/ui';

/**
 * # 消除满行核心逻辑
 *
 * 1. 检测所有满行
 * 2. 添加闪烁特效（不立即删行）
 * 3. 播放消行音效
 * 4. 更新分数与等级
 * 5. 等待 drawClearFlash 完成闪烁后再真正删行
 *
 * @function clearLines
 * @returns {Array} - 执行成功，返回 true，否则返回 false
 */
const clearLines = () => {
  const { store } = Game;
  const state = store.getState();

  const { ROWS } = UI.CONSTANTS.BOARD;

  // 记录消除行数
  let clear = 0;
  // 存储需要闪烁消除的行号
  const linesToClear = [];

  // 从底部向上遍历所有行，检测满行
  for (let y = ROWS - 1; y >= 0; y--) {
    // 优化判断：单元格有值（非空/非0）即为有方块
    const isLineFull = state.board[y].every((cell) => !!cell);

    // 如果是满行，加入待消除队列
    if (isLineFull) {
      linesToClear.push(y);
      clear++;
    }
  }

  // 如果没有满行，直接更新界面并退出
  if (clear === 0) {
    return linesToClear;
  }

  store.setClearLines(linesToClear);

  return linesToClear;
};

export default clearLines;
