import COLORS from '@/lib/constants/colors.js';
import renderText from '../text/render-text.js';

/**
 * # 渲染消除得分动画（Floating Score Renderer）
 *
 * 在消除行的位置绘制上浮渐隐的得分数字和 Combo 连击提示。 由 `ClearScoreAnimation.render()` 每帧调用，传入持续更新的
 * `scoreData`。
 *
 * ## 动画属性
 *
 * | 属性       | 说明                                     |
 * | ---------- | ---------------------------------------- |
 * | score      | 本次消除得分数字                         |
 * | combo      | 当前连击次数                             |
 * | comboScore | 本次连击额外加分                         |
 * | y          | 消除行号，内部换算为像素坐标             |
 * | alpha      | 透明度（1 = 不透明，0 = 完全透明）       |
 * | offsetY    | Y 轴上浮偏移量（逐帧递增，数字向上飘动） |
 *
 * ## 坐标计算
 *
 * - **X**：画布水平居中
 * - **Y**：消除行中心 - 上浮偏移
 *
 * ## 视觉样式
 *
 * - 得分数字：白色，`fontSize × 0.75`
 * - Combo 提示：黄色，`fontSize × 0.55`，显示在得分上方
 * - 对齐：水平居中
 *
 * @function renderClearScore
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} scoreData - 得分动画数据
 * @returns {void}
 */
const renderClearScore = (canvas, scoreData) => {
  const { WHITE, YELLOW } = COLORS;
  const { gameBoard, blockSize } = canvas;
  const { width } = gameBoard;
  const { score, y: rowY, alpha, offsetY, combo, comboScore } = scoreData;

  // 完全透明时跳过绘制
  if (alpha <= 0) {
    return;
  }

  // X = 画布宽度 / 2（水平居中）
  const x = width / 2;
  const y = rowY * blockSize + blockSize / 2 - offsetY;

  /**
   * 绘制 Combo 提示
   *
   * Combo ≥ 2 时显示黄色 "+Combo xN (+xx)" 在得分数字上方。
   */
  if (combo > 1) {
    renderText(canvas, {
      text: `Combo x${combo} (+${comboScore})`,
      x,
      y: y - blockSize * 0.65,
      color: YELLOW,
      size: 0.75,
      center: true,
      alpha,
    });
  }

  /** 绘制消除得分数字 */
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
