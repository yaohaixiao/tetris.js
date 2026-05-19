import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';
import formatTime from '@/lib/utils/format-time.js';
import getChineseHourDialTheme from '@/lib/services/ui/effects/clock/utils/get-chinese-hour-dial-theme.js';

/**
 * # 渲染数字时钟（Digital Clock HUD）
 *
 * 在游戏画布中居中显示当前时间的数字形式（如 `14:05:09`）。 主要用于暂停界面，让玩家在暂停时也能看到当前时间。
 *
 * ## 布局
 *
 * - **位置**：水平居中，垂直位于画布高度的 `1/4.15` 处
 * - **颜色**：默认绿色
 * - **格式**：默认 `HH:mm:ss`（24 小时制）
 *
 * @example
 *   // 显示当前时间
 *   renderDigitalClock(canvas);
 *
 *   // 显示指定时间
 *   renderDigitalClock(canvas, new Date('2024-01-01 12:00:00'));
 *
 *   // 自定义颜色和格式
 *   renderDigitalClock(canvas, new Date(), '#ff0000', 'HH:mm');
 *
 * @function renderDigitalClock
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {Date} [time=new Date()] - 要显示的时间。默认值为当前时间. Default is `new Date()`
 * @param {string} [format='HH:mm:ss'] - 时间格式字符串. Default is `'HH:mm:ss'`
 * @returns {void}
 */
const renderDigitalClock = (canvas, time, format = 'HH:mm:ss') => {
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;

  // 格式化时间字符串
  const text = formatTime(time || new Date(), format);

  // 居中渲染时间文本
  renderText(canvas, {
    text,
    x: width / 2,
    y: height / 4.15,
    color: getChineseHourDialTheme(time.getHours()) || COLORS.GREEN,
    size: 0.94,
    center: true,
  });
};

export default renderDigitalClock;
