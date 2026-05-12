import ClockThemes from '@/lib/services/ui/effects/clock/constants/clock-themes.js';
import getClockAngles from '@/lib/services/ui/effects/clock/utils/get-clock-angles.js';
import renderChineseHourAnimal from '@/lib/services/ui/image/render-chinese-hour-animal.js';
import renderClockDial from '@/lib/services/ui/effects/clock/render-clock-dial.js';
import renderClockTicks from '@/lib/services/ui/effects/clock/render-clock-ticks.js';
import renderClockHands from '@/lib/services/ui/effects/clock/render-clock-hands.js';
import renderClockCenter from '@/lib/services/ui/effects/clock/render-clock-center.js';
import getChineseHourDialTheme from '@/lib/services/ui/effects/clock/utils/get-chinese-hour-dial-theme.js';

/**
 * # 渲染模拟时钟（Analog Clock）
 *
 * 特点：
 *
 * - 表盘 + 刻度 + 三指针
 * - HUD 风格视觉组件
 *
 * @function renderAnalogClock
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {Date} [time=new Date()] - 显示时间. Default is `new Date()`
 * @returns {void}
 */
const renderAnalogClock = (canvas, time) => {
  const { gameBoard, gameBoardContext: ctx } = canvas;
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
  renderClockDial(canvas, radius, theme);

  /* ===== 12 时辰生效动物 ===== */
  renderChineseHourAnimal(canvas);

  /* ===== 刻度 ===== */
  renderClockTicks(canvas, radius, theme);

  /* ===== 指针 ===== */
  renderClockHands(canvas, radius, angles, theme);

  /* ===== 中心点 ===== */
  renderClockCenter(canvas, radius, theme);

  ctx.restore();
};

export default renderAnalogClock;
