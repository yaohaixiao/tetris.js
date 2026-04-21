import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/ui/core/canvas.js';
import formatTime from '@/lib/utils/format-time.js';
import renderText from '@/lib/ui/text/render-text.js';

/**
 * # 渲染数字时钟（Digital Clock HUD）
 *
 * 用于在游戏画布中显示当前时间的数字形式，例如： 14:05:09
 *
 * 特点：
 *
 * - 支持自定义颜色
 * - 支持自定义时间格式
 * - 基于 formatTime 工具
 * - 使用 renderText 统一渲染
 *
 * @function renderDigitalClock
 * @param {string} [color] - 文本颜色（默认绿色）
 * @param {string} [format='HH:mm:ss'] - 时间格式. Default is `'HH:mm:ss'`
 * @returns {void}
 */
const renderDigitalClock = (color, format = 'HH:mm:ss') => {
  const { GREEN } = COLORS;
  const { gameBoard } = Canvas;
  const { width, height } = gameBoard;

  const text = formatTime(new Date(), format);

  renderText({
    text,
    x: width / 2,
    y: height / 4.15,
    color: color || GREEN,
    size: 0.94,
    center: true,
  });
};

export default renderDigitalClock;
