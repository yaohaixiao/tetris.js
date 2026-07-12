import renderBlock from '@/lib/services/ui/block/render-block.js';

/**
 * ============================================================
 *
 * # 绘制消行闪烁特效
 *
 * ============================================================
 *
 * 在消行动画期间，遍历所有待消除的行， 根据当前的透明度（alpha）绘制白色高亮闪烁效果。
 *
 * ## 动画原理
 *
 * - 每行的 alpha 值由 ClearLinesAnimation 更新
 * - 偶数阶段（0, 2, 4）：alpha = 1，完全显示
 * - 奇数阶段（1, 3, 5）：alpha = 0，完全隐藏
 * - 6 个阶段（共 0.72 秒）闪烁后执行实际消行
 *
 * ## 视觉表现
 *
 * - 待消除的整行被白色方块覆盖
 * - 通过 save / restore 隔离透明度设置
 * - 不影响其他行的正常渲染
 *
 * @function renderClearLines
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} state - 消行动画的状态数据
 * @param {{ y: number; alpha: number; color: string }[]} state.lines 待消除行的动画数据
 * @returns {void}
 */
const renderClearLines = (canvas, state) => {
  const { gameBoardContext: ctx, cols } = canvas;

  // 遍历所有需要闪烁消除的行
  for (const line of state.lines) {
    ctx.save();

    // 设置当前行的透明度（由动画控制闪烁）
    ctx.globalAlpha = line.alpha;

    // 整行绘制白色闪烁块
    for (let x = 0; x < cols; x++) {
      renderBlock(canvas, x, line.y, line.color);
    }

    ctx.restore();
  }
};

export default renderClearLines;
