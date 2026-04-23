import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/ui/core/canvas.js';
import renderText from '@/lib/ui/text/render-text.js';

/**
 * # 渲染“PAUSED”暂停提示文本
 *
 * 用于暂停场景中央提示当前游戏处于暂停状态。
 *
 * 样式：
 *
 * - 黄色高亮
 * - 大字号强调（1.6x）
 * - 居中显示在画布偏下位置
 *
 * @function renderPausedText
 * @returns {void}
 */
const renderPausedText = () => {
  const { YELLOW, BLACK } = COLORS;
  const { gameBoard } = Canvas;
  const { width, height } = gameBoard;

  renderText({
    text: 'PAUSED',
    x: width / 2,
    y: height / 1.4,
    color: YELLOW,
    strokeColor: BLACK,
    size: 1.6,
    center: true,
    stroke: true,
  });
};

export default renderPausedText;
