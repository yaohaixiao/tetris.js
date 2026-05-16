/**
 * # 消除满行核心逻辑
 *
 * 1. 检测所有满行
 * 2. 添加闪烁特效（不立即删行）
 * 3. 播放消行音效
 * 4. 更新分数与等级
 * 5. 等待 drawClearFlash 完成闪烁后再真正删行
 *
 * @function findFullLines
 * @param context - 执行上下文对象
 * @returns {Array} - 执行成功，返回 true，否则返回 false
 */
const findFullLines = (context) => {
  const { Elements } = context;
  const state = context.Store.getState();
  const { rows } = Elements.Main;

  // 存储需要闪烁消除的行号
  const linesToClear = [];

  // 从底部向上遍历所有行，检测满行
  for (let y = rows - 1; y >= 0; y--) {
    // 优化判断：单元格有值（非空/非0）即为有方块
    const isLineFull = state.board[y].every((cell) => !!cell);

    // 如果是满行，加入待消除队列
    if (isLineFull) {
      linesToClear.push(y);
    }
  }

  return linesToClear;
};

export default findFullLines;
