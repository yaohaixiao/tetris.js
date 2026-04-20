/**
 * # 时钟角度计算器（Clock Angle Generator）
 *
 * 将 Date 对象转换为模拟时钟所需的三种角度：
 *
 * - 时针角度（hour angle）
 * - 分针角度（minute angle）
 * - 秒针角度（second angle）
 *
 * 用于：
 *
 * - 模拟时钟渲染（Analog Clock）
 * - HUD clock system
 * - UI 动画同步时间轴
 *
 * @function getClockAngles
 * @param {Date} time - 当前时间对象
 * @returns {{
 *   hAng: number;
 *   mAng: number;
 *   sAng: number;
 * }} - 各指针对应的弧度角
 */
const getClockAngles = (time) => {
  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();

  // ======== 时针（12小时制 + 分秒修正） ========
  const hAng = ((h % 12) + m / 60 + s / 3600) * ((2 * Math.PI) / 12);

  // ======== 分针（含秒修正） ========
  const mAng = (m + s / 60) * ((2 * Math.PI) / 60);

  // ======== 秒针 ========
  const sAng = s * ((2 * Math.PI) / 60);

  return {
    hAng,
    mAng,
    sAng,
  };
};

export default getClockAngles;
