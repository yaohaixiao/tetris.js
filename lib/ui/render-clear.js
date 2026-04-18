import BOARD from './constants/board.js';
import Canvas from './canvas.js';
import renderBlock from './render-block.js';

/**
 * # 绘制整行闪烁特效
 *
 * 遍历所有待消除的行，根据当前透明度绘制白色高亮闪烁效果 仅在消行动画期间执行，不影响正常游戏画面渲染
 *
 * @function renderClear
 * @param {object} state - Clear 控制器的 state 数据
 * @returns {void}
 */
const renderClear = (state) => {
  const { COLS } = BOARD;
  const { gameBoardContext: ctx } = Canvas;

  // 遍历所有需要闪烁消除的行数据
  for (const line of state.lines) {
    // 保存画布上下文状态，避免透明度影响其他绘制
    ctx.save();

    // 设置当前行的透明度，控制闪烁显隐
    ctx.globalAlpha = line.alpha;

    // 整行绘制白色闪烁块（覆盖整行，视觉效果最明显）
    for (let x = 0; x < COLS; x++) {
      renderBlock(ctx, x, line.y, line.color);
    }

    // 恢复画布上下文状态
    ctx.restore();
  }
};

export default renderClear;
