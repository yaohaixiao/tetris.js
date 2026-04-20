import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/ui/core/canvas.js';
import renderText from '@/lib/ui/text/render-text.js';

/**
 * # 渲染“GAME”标题文本（带描边效果）
 *
 * 用于游戏结束或强调场景中的主标题展示。
 *
 * 样式：
 *
 * - 红色填充 + 黄色描边
 * - 大字号（2.3x fontSize）
 * - 居中显示在画布中部偏上位置
 *
 * @function renderGameText
 * @returns {void}
 */
const renderGameText = () => {
  const { RED, YELLOW } = COLORS;
  const { gameBoard } = Canvas;
  const { width, height } = gameBoard;

  renderText({
    text: 'GAME',
    x: width / 2,
    y: height / 2.2,
    color: RED,
    strokeColor: YELLOW,
    size: 2.3,
    center: true,
    stroke: true,
  });
};

export default renderGameText;
