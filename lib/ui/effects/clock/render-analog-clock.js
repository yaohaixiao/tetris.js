import Canvas from '@/lib/ui/core/canvas.js';
import ClockThemes from '@/lib/ui/effects/clock/constants/clock-themes.js';
import getClockAngles from '@/lib/ui/effects/clock/utils/get-clock-angles.js';
import renderChineseHourAnimalImage from '@/lib/ui/image/render-chinese-hour-animal-image.js';
import renderClockDial from '@/lib/ui/effects/clock/render-clock-dial.js';
import renderClockTicks from '@/lib/ui/effects/clock/render-clock-ticks.js';
import renderClockHands from '@/lib/ui/effects/clock/render-clock-hands.js';
import renderClockCenter from '@/lib/ui/effects/clock/render-clock-center.js';
import getChineseHourDialTheme from '@/lib/ui/effects/clock/utils/get-chinese-hour-dial-theme.js';

/**
 * # 渲染模拟时钟（Analog Clock）
 *
 * 特点：
 *
 * - 表盘 + 刻度 + 三指针
 * - HUD 风格视觉组件
 *
 * @function renderAnalogClock
 * @param {Date} [time=new Date()] - 显示时间. Default is `new Date()`
 * @returns {void}
 */
const renderAnalogClock = (time) => {
  const { gameBoard, gameBoardContext: ctx } = Canvas;
  const { width, height } = gameBoard;
  const centerX = width / 2;
  const centerY = height / 2.2;
  const radius = Math.floor(width * 0.3);
  const displayTime = time || new Date();
  const hours = displayTime.getHours();
  const angles = getClockAngles(displayTime);
  const theme = ClockThemes[getChineseHourDialTheme(hours)];

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.lineCap = 'round';

  /* ===== 表盘 ===== */
  renderClockDial(radius, theme);

  /* ===== 12 时辰文字 ===== */
  renderChineseHourAnimalImage();

  /* ===== 刻度 ===== */
  renderClockTicks(radius, theme);

  /* ===== 指针 ===== */
  renderClockHands(radius, angles, theme);

  /* ===== 中心点 ===== */
  renderClockCenter(radius, theme);

  ctx.restore();
};

export default renderAnalogClock;
