import findFullLines from '@/lib/game/logic/find-full-lines.js';

/**
 * # 执行消行逻辑（包含闪烁3次特效）
 *
 * 在面板中收集被方块填满的行，然后执行消除动画
 *
 * @function clearLines
 * @param context - 执行上下文对象
 * @returns {void}
 */
const clearLines = (context) => {
  // 获取填满的行
  const linesToClear = findFullLines(context);

  if (linesToClear.length === 0) {
    return;
  }

  context.Store.setClearLines(linesToClear);
  // 等待闪烁 3 次动画完成 → 再删行
  context.emit('game:start:clear:lines', { linesToClear });
};

export default clearLines;
