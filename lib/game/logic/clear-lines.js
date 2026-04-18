import BOARD from '../../ui/constants/board.js';
import GameState from '../../game/state/game-state.js';
import Sounds from '../../audio/sounds.js';
import startClearLines from '../../controllers/clear-lines-controller.js';
import saveHighScore from '../state/save-high-score.js';

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
 * @returns {boolean} - 执行成功，返回 true，否则返回 false
 */
const clearLines = () => {
  const { ROWS } = BOARD;

  // 记录消除行数
  let clear = 0;
  // 存储需要闪烁消除的行号
  const linesToClear = [];

  // 从底部向上遍历所有行，检测满行
  for (let y = ROWS - 1; y >= 0; y--) {
    // 优化判断：单元格有值（非空/非0）即为有方块
    const isLineFull = GameState.board[y].every((cell) => !!cell);

    // 如果是满行，加入待消除队列
    if (isLineFull) {
      linesToClear.push(y);
      clear++;
    }
  }

  // 如果没有满行，直接更新界面并退出
  if (clear === 0) {
    saveHighScore();

    return false;
  }

  // 播放悦耳消行音效
  Sounds.clear();

  // 等待闪烁 3 次动画完成 → 再删行
  startClearLines(linesToClear);

  return true;
};

export default clearLines;
