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
 * 在暂停界面绘制一个完整的模拟时钟，包含：
 *
 * - 圆形表盘
 * - 12 时辰刻度
 * - 生肖动物装饰
 * - 时/分/秒三指针
 * - 中心圆点
 *
 * ## 布局
 *
 * - **位置**：水平居中，垂直位于画布高度的 `1/2.2` 处
 * - **半径**：画布宽度的 30%
 * - **主题色**：根据当前小时自动切换（每 2 小时一种颜色）
 *
 * ## 主题色系统
 *
 * 表盘颜色随中国时辰自动变化，12 种颜色对应 12 个时辰：
 *
 * | 时辰 | 小时  | 主题色 |
 * | ---- | ----- | ------ |
 * | 子时 | 23-1  | Red    |
 * | 丑时 | 1-3   | White  |
 * | 寅时 | 3-5   | Orange |
 * | 卯时 | 5-7   | Cyan   |
 * | 辰时 | 7-9   | Blue   |
 * | 巳时 | 9-11  | Coral  |
 * | 午时 | 11-13 | Purple |
 * | 未时 | 13-15 | Green  |
 * | 申时 | 15-17 | Yellow |
 * | 酉时 | 17-19 | Pink   |
 * | 戌时 | 19-21 | Teal   |
 * | 亥时 | 21-23 | Violet |
 *
 * @function renderAnalogClock
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {Date} [time=new Date()] - 要显示的时间。默认值为当前时间. Default is `new Date()`
 * @returns {void}
 */
const renderAnalogClock = (canvas, time) => {
  const { gameBoard, gameBoardContext: ctx } = canvas;
  const { width, height } = gameBoard;

  // 时钟中心坐标
  const centerX = width / 2;
  const centerY = height / 2.2;

  // 时钟半径（画布宽度的 30%）
  const radius = Math.floor(width * 0.3);

  // 当前显示的时间
  const displayTime = time || new Date();
  const hours = displayTime.getHours();

  // 计算三指针角度
  const angles = getClockAngles(displayTime);

  // 根据时辰获取表盘主题色
  const theme = ClockThemes[getChineseHourDialTheme(hours)];

  // 保存画布状态，将原点平移到时钟中心
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.lineCap = 'round';

  /* ===== 表盘底色 ===== */
  renderClockDial(canvas, radius, theme);

  /* ===== 12 时辰生肖动物装饰 ===== */
  renderChineseHourAnimal(canvas);

  /* ===== 刻度标记 ===== */
  renderClockTicks(canvas, radius, theme);

  /* ===== 时/分/秒指针 ===== */
  renderClockHands(canvas, radius, angles, theme);

  /* ===== 中心圆点 ===== */
  renderClockCenter(canvas, radius, theme);

  // 恢复画布状态
  ctx.restore();
};

export default renderAnalogClock;
