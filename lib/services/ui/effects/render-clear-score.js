import COLORS from '@/lib/constants/colors.js';
import GAME from '@/lib/game/constants/game.js';

/**
 * # 渲染消除得分动画（Floating Score Renderer）
 *
 * 在消除行的位置绘制上浮渐隐的得分数字。 由 `ClearScoreAnimation.render()` 每帧调用，传入持续更新的
 * `scoreData`。
 *
 * ## 动画属性
 *
 * | 属性    | 说明                                     |
 * | ------- | ---------------------------------------- |
 * | score   | 本次消除得分数字                         |
 * | y       | 消除行号，内部换算为像素坐标             |
 * | alpha   | 透明度（1 = 不透明，0 = 完全透明）       |
 * | offsetY | Y 轴上浮偏移量（逐帧递增，数字向上飘动） |
 *
 * ## 坐标计算
 *
 * - **X**：画布水平居中
 * - **Y**：消除行中心 - 上浮偏移
 *
 * ## 视觉样式
 *
 * - 颜色：白色（`WHITE`）
 * - 字体：`Press Start 2P`，大小为 `fontSize × 0.85`
 * - 对齐：水平居中
 *
 * @function renderClearScore
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} canvas.gameBoardContext - 主画布 2D 渲染上下文
 * @param {object} canvas.gameBoard - 主画布元素
 * @param {number} canvas.blockSize - 单个方块的像素尺寸
 * @param {number} canvas.fontSize - 基础字体大小
 * @param {object} scoreData - 得分动画数据
 * @param {number} scoreData.score - 本次消除得分
 * @param {number} scoreData.y - 消除行号
 * @param {number} scoreData.alpha - 当前透明度
 * @param {number} scoreData.offsetY - Y 轴上浮偏移量
 * @returns {void}
 */
const renderClearScore = (canvas, scoreData) => {
  const { WHITE } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoardContext: ctx, gameBoard, blockSize, fontSize } = canvas;
  const { score, y: rowY, alpha, offsetY } = scoreData;

  // 完全透明时跳过绘制
  if (alpha <= 0) {
    return;
  }

  /**
   * 计算像素坐标
   *
   * X = 画布宽度 / 2（水平居中） Y = 行号 × 方块尺寸 + 半个方块（行中心）- 上浮偏移
   */
  const x = gameBoard.width / 2;
  const y = rowY * blockSize + blockSize / 2;

  // 设置透明度（渐隐效果）
  ctx.globalAlpha = alpha;

  // 设置文字样式
  ctx.fillStyle = WHITE;
  ctx.font = `${fontSize * 0.85}px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';

  // 绘制上浮的得分数字
  ctx.fillText(String(score), x, y - offsetY);

  // 恢复全局透明度，避免污染后续绘制
  ctx.globalAlpha = 1;
};

export default renderClearScore;
