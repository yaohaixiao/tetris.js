import COLORS from '@/lib/constants/colors.js';
import renderText from '../text/render-text.js';

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
 * @param {object} scoreData - 得分动画数据
 * @returns {void}
 */
const renderClearScore = (canvas, scoreData) => {
  const { WHITE } = COLORS;
  const { gameBoard, blockSize } = canvas;
  const { width } = gameBoard;
  const { score, y: rowY, alpha, offsetY } = scoreData;

  // 完全透明时跳过绘制
  if (alpha <= 0) {
    return;
  }

  // X = 画布宽度 / 2（水平居中）
  const x = width / 2;
  const y = rowY * blockSize + blockSize / 2 - offsetY;

  renderText(canvas, {
    text: String(score),
    x,
    y,
    color: WHITE,
    size: 0.75,
    center: true,
    alpha,
  });
};

export default renderClearScore;
