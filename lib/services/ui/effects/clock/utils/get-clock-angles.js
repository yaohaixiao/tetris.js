/**
 * # 时钟角度计算器（Clock Angle Generator）
 *
 * 将 Date 对象转换为模拟时钟所需的三种指针角度（弧度制）， 用于驱动模拟时钟的指针旋转。
 *
 * ## 角度计算
 *
 * - **时针**：12 小时制，包含分针和秒针的微调偏移
 * - **分针**：包含秒针的微调偏移
 * - **秒针**：精确到秒
 *
 * ## 弧度说明
 *
 * 所有角度以弧度表示，`0` 指向 12 点方向， 顺时针递增至 `2π`（360°）。
 *
 * @example
 *   const angles = getClockAngles(new Date('2024-01-01 12:30:45'));
 *   // angles.hAng ≈ π（12 点方向对面）
 *   // angles.mAng ≈ π（30 分指向 6 点方向）
 *   // angles.sAng ≈ 4.71（45 秒指向 9 点方向）
 *
 * @function getClockAngles
 * @param {Date} time - 当前时间对象
 * @returns {{ hAng: number; mAng: number; sAng: number }} 各指针的弧度角
 */
const getClockAngles = (time) => {
  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();

  /**
   * 时针角度（12 小时制 + 分秒修正）
   *
   * - 基础：每小时占 2π/12 弧度
   * - 修正：分针每走 60 分钟，时针走 1 小时
   * - 修正：秒针每走 3600 秒，时针走 1 小时
   */
  const hAng = ((h % 12) + m / 60 + s / 3600) * ((2 * Math.PI) / 12);

  /**
   * 分针角度（含秒修正）
   *
   * - 基础：每分钟占 2π/60 弧度
   * - 修正：秒针每走 60 秒，分针走 1 分钟
   */
  const mAng = (m + s / 60) * ((2 * Math.PI) / 60);

  /**
   * 秒针角度
   *
   * - 基础：每秒占 2π/60 弧度
   */
  const sAng = s * ((2 * Math.PI) / 60);

  return {
    hAng,
    mAng,
    sAng,
  };
};

export default getClockAngles;
