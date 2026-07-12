import COLORS from '@/lib/constants/colors.js';

/**
 * ============================================================
 *
 * # 渲染落地高亮
 *
 * ============================================================
 *
 * 方块落地的瞬间，在落地方块的格子上覆盖半透明白色， 提供短暂的视觉反馈。 由 LandingFlashAnimation.render() 每帧调用。
 *
 * ## 视觉表现
 *
 * - 落地格子上叠加 60% 透明度的白色
 * - 200ms 后动画结束，白色消失
 * - 不影响棋盘原始数据，仅渲染层叠加
 *
 * ## 坐标计算
 *
 * 像素坐标 = 格子坐标 × 方块尺寸（blockSize）
 *
 * @function renderLandingFlash
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} flashData - 高亮数据
 * @param {{ x: number; y: number }[]} flashData.cells 需要高亮的格子坐标数组
 * @returns {void}
 */
const renderLandingFlash = (canvas, flashData) => {
  // 无数据时跳过
  if (!flashData) {
    return;
  }

  const { WHITE } = COLORS;
  const { gameBoardContext: ctx, blockSize } = canvas;
  const { cells } = flashData;

  // 设置半透明白色覆盖（alpha = 0.6）
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = WHITE;

  // 遍历所有落地格子，绘制白色矩形
  for (const { x, y } of cells) {
    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
  }

  // 恢复全局透明度，避免污染后续绘制
  ctx.globalAlpha = 1;
};

export default renderLandingFlash;
