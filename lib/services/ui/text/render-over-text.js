import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

/**
 * ============================================================
 *
 * # 渲染 "OVER" 标题文本（带描边效果）
 *
 * ============================================================
 *
 * 用于游戏结束或强调场景中的主标题展示。
 *
 * ## 样式
 *
 * - 红色填充 + 黄色描边
 * - 大字号（2.3x fontSize）
 * - 居中显示在画布中部偏上位置
 *
 * @function renderOverText
 * @param {object} canvas - 游戏 canvas 信息对象
 * @returns {void}
 */
const renderOverText = (canvas) => {
  const { RED, YELLOW } = COLORS;
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;

  // 绘制 OVER 标题文本（红色填充 + 黄色描边）
  renderText(canvas, {
    text: 'OVER',
    x: width / 2,
    y: height / 1.6,
    color: RED,
    strokeColor: YELLOW,
    size: 2.3,
    center: true,
    stroke: true,
  });
};

export default renderOverText;
