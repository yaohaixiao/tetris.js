import BOARD from '../constants/board.js';
import Effects from './effects.js';
import Canvas from './canvas.js';
import drawBlock from './draw-block.js';

/**
 * # 绘制整行闪烁特效
 *
 * 遍历所有待消除的行，根据当前透明度绘制白色高亮闪烁效果 仅在消行动画期间执行，不影响正常游戏画面渲染
 *
 * @function drawClearEffect
 * @returns {void}
 */
const drawClearEffect = () => {
  const { COLS } = BOARD;
  const { gameBoardContext } = Canvas;
  const effect = Effects.clear;

  // 遍历所有需要闪烁消除的行数据
  for (const line of effect.lines) {
    // 保存画布上下文状态，避免透明度影响其他绘制
    gameBoardContext.save();

    // 设置当前行的透明度，控制闪烁显隐
    gameBoardContext.globalAlpha = line.alpha;

    // 整行绘制白色闪烁块（覆盖整行，视觉效果最明显）
    for (let x = 0; x < COLS; x++) {
      drawBlock(gameBoardContext, x, line.y, line.color);
    }

    // 恢复画布上下文状态
    gameBoardContext.restore();
  }
};

export default drawClearEffect;
