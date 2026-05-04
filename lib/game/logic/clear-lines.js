import Game from '@/lib/game';
import Effects from '@/lib/services/effects';
import findFullLines from '@/lib/game/logic/find-full-lines.js';

/**
 * # 执行消行逻辑（包含闪烁3次特效）
 *
 * 在面板中收集被方块填满的行，然后执行消除动画
 *
 * @function clearLines
 * @returns {void}
 */
const clearLines = () => {
  // 获取填满的行
  const linesToClear = findFullLines();

  if (linesToClear.length === 0) {
    return;
  }

  Game.store.setClearLines(linesToClear);
  // 等待闪烁 3 次动画完成 → 再删行
  Effects.startClearLines(linesToClear);
};

export default clearLines;
