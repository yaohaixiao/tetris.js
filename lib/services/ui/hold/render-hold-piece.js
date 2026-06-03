import clearHoldPiece from '@/lib/services/ui/hold/clear-hold-piece.js';
import renderBlock from '@/lib/services/ui/block/render-block.js';

/**
 * # 渲染暂存方块预览区域（Hold Piece Preview）
 *
 * 在暂存预览画布中居中绘制暂存方块的形状，帮助玩家了解当前暂存的方块。
 *
 * ## 渲染流程
 *
 * 1. 从 state 中获取暂存方块（hold）数据
 * 2. 如果没有暂存方块，直接返回
 * 3. 清空暂存预览画布，避免新旧方块重叠
 * 4. 计算居中偏移量，让方块在预览区域中居中显示
 * 5. 遍历形状矩阵，逐个格子绘制方块
 *
 * ## 居中计算
 *
 * - `blockSize`：根据预览区域宽度计算单个方块的像素尺寸（宽度的 1/6）
 * - `ox`：水平居中偏移 = (预览宽度 - 形状宽度 × blockSize) / 2
 * - `oy`：垂直居中偏移 = (预览高度 - 形状高度 × blockSize) / 2
 *
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.holdPieceContext - 暂存预览画布的 2D 渲染上下文
 * @param {object} canvas.holdPiece - 暂存预览区域尺寸配置对象
 * @param {number} canvas.holdPiece.width - 暂存预览区域宽度（像素）
 * @param {number} canvas.holdPiece.height - 暂存预览区域高度（像素）
 * @param {string} [canvas.style='classic'] - 方块渲染风格. Default is `'classic'`
 * @param {string} [canvas.pattern='square'] - 方块纹理样式. Default is `'square'`
 * @param {object} state - 游戏状态对象
 * @param {object} [state.hold] - 暂存方块对象，为空时表示暂存区无方块
 * @param {number[][]} state.hold.shape - 暂存方块的形状矩阵
 * @param {string} state.hold.color - 暂存方块的颜色
 * @returns {void}
 */
const renderHoldPiece = (canvas, state) => {
  /*
   * ==================== 解构参数 ====================
   *
   * 从 state 中获取暂存方块，从 canvas 中获取画布上下文和配置
   */
  const { hold } = state;
  const {
    holdPieceContext: ctx,
    holdPiece: holdCanvas,
    style = 'classic',
    pattern = 'square',
  } = canvas;
  const { width, height } = holdCanvas;

  /*
   * ==================== 无暂存方块 ====================
   *
   * 暂存区为空时无需渲染，直接返回
   */
  if (!hold) {
    return;
  }

  /*
   * ==================== 计算布局参数 ====================
   *
   * blockSize — 单个方块的像素尺寸，取预览宽度的 1/6 确保方块适配
   * ox — 水平居中偏移，让方块在预览区域中水平居中
   * oy — 垂直居中偏移，让方块在预览区域中垂直居中
   */
  const { shape } = hold;
  const blockSize = Math.ceil(width / 6);
  const ox = Math.floor((width - shape[0].length * blockSize) / 2);
  const oy = Math.floor((height - shape.length * blockSize) / 2);

  /*
   * ==================== 清空画布 ====================
   *
   * 先清除整个预览区域，避免新旧方块重叠显示
   */
  clearHoldPiece(canvas);

  /*
   * ==================== 应用平移变换 ====================
   *
   * 将画布原点平移到居中偏移位置，后续绘制以方块左上角为基准
   */
  ctx.save();
  ctx.translate(ox, oy);

  /*
   * ==================== 遍历形状矩阵并绘制 ====================
   *
   * 逐个格子检查，形状矩阵中非 0 的位置绘制对应颜色的方块
   */
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;

      renderBlock(
        {
          gameBoardContext: ctx,
          blockSize,
          style,
          pattern,
        },
        x,
        y,
        hold.color,
      );
    }
  }

  /*
   * ==================== 恢复画布状态 ====================
   *
   * 撤销 translate 平移，避免影响后续其他区域的绘制
   */
  ctx.restore();
};

export default renderHoldPiece;
