import COLORS from '@/lib/constants/colors.js';
import ClockThemes from '@/lib/services/ui/effects/clock/constants/clock-themes.js';
import renderText from '@/lib/services/ui/text/render-text.js';
import formatTime from '@/lib/utils/date/format-time.js';
import getChineseHourDialTheme from '@/lib/services/ui/effects/clock/utils/get-chinese-hour-dial-theme.js';

/**
 * ============================================================
 *
 * # 渲染数字时钟
 *
 * ============================================================
 *
 * 在游戏画布中居中显示当前时间的数字形式。 主要用于暂停界面，让玩家在暂停时也能看到当前时间。
 *
 * ## 布局
 *
 * - 水平居中，垂直位于画布高度的 1/4.15 处
 * - 颜色根据时辰主题动态切换，默认绿色
 * - 格式默认 HH:mm:ss（24 小时制）
 *
 * ## 示例
 *
 * ```javascript
 * // 显示当前时间
 * renderDigitalClock(canvas);
 *
 * // 显示指定时间
 * renderDigitalClock(canvas, new Date('2024-01-01 12:00:00'));
 *
 * // 自定义格式
 * renderDigitalClock(canvas, new Date(), 'HH:mm');
 * ```
 *
 * @function renderDigitalClock
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {Date} [time=new Date()] - 要显示的时间. Default is `new Date()`
 * @param {string} [format='HH:mm:ss'] - 时间格式字符串. Default is `'HH:mm:ss'`
 * @returns {void}
 */
const renderDigitalClock = (canvas, time, format = 'HH:mm:ss') => {
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;
  const targetTime = time || new Date();

  // 格式化时间字符串
  const text = formatTime(targetTime, format);

  // 根据时辰获取表盘主题颜色
  const theme = ClockThemes[getChineseHourDialTheme(targetTime.getHours())];

  // 居中渲染时间文本
  renderText(canvas, {
    text,
    x: width / 2,
    y: height / 4.15,
    color: theme?.secondHand || COLORS.GREEN,
    size: 0.94,
    center: true,
  });
};

export default renderDigitalClock;
