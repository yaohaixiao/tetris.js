import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

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
 * @param {object} canvas - 游戏 canvas 信息对象
 * @returns {void}
 */
const renderPausedText = (canvas) => {
  const { YELLOW, BLACK } = COLORS;
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;

  renderText(canvas, {
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
