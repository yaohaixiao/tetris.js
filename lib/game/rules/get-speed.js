import GAME from '@/lib/game/constants/game.js';

/**
 * ============================================================
 *
 * # 获取当前等级的方块自动下落速度
 *
 * ============================================================
 *
 * 根据游戏等级计算方块自动下落的时间间隔。 等级越高，下落越快（间隔越小）。
 *
 * ## 计算公式
 *
 * Step = ceil(1000 / floor(MAX_LEVEL × SPEED_STEPS[difficulty])) speed =
 * max(120, 1000 - (level - 1) × step)
 *
 * ## 设计思路
 *
 * - 基础速度：等级 1 时下落间隔为 1000ms
 * - 平滑递增：每升一级，间隔减少固定值 step
 * - 极限保护：最低间隔为 120ms
 * - 难度影响：不同难度使用不同的 SPEED_STEPS 系数
 *
 * ## 各难度速度系数
 *
 * | 难度   | SPEED_STEPS | 说明                       |
 * | :----- | :---------- | :------------------------- |
 * | EASY   | 0.6         | 60% 等级达到极限，加速平缓 |
 * | NORMAL | 0.4         | 40% 等级达到极限，加速适中 |
 * | HARD   | 0.2         | 20% 等级达到极限，加速较快 |
 * | EXPERT | 0.1         | 10% 等级达到极限，加速极快 |
 *
 * ## 速度示例（EASY 难度）
 *
 * | 等级 | 下落间隔 |
 * | :--- | :------- |
 * | 1    | 1000ms   |
 * | 50   | 657ms    |
 * | 100  | 307ms    |
 * | 127  | 120ms    |
 * | 256  | 120ms    |
 *
 * ## 速度示例（EXPERT 难度）
 *
 * | 等级 | 下落间隔 |
 * | :--- | :------- |
 * | 1    | 1000ms   |
 * | 10   | 640ms    |
 * | 23   | 120ms    |
 * | 256  | 120ms    |
 *
 * Expert 难度下仅 23 级就达到极限速度。
 *
 * @function getSpeed
 * @param {object} runtime - 游戏运行时对象
 * @returns {number} 方块自动下落的时间间隔（毫秒），范围 [120, 1000]
 */
const getSpeed = (runtime) => {
  const { MAX_LEVEL, SPEED_STEPS } = GAME;
  const { Store } = runtime;
  const level = Store.getLevel();
  const difficult = Store.getDifficulty().toUpperCase();

  // 计算每级的速度递减步长
  const step = Math.ceil(1000 / Math.floor(MAX_LEVEL * SPEED_STEPS[difficult]));

  // 下落间隔 = 1000 - (等级-1) × step，最低不低于 120ms
  return Math.max(120, 1000 - (level - 1) * step);
};

export default getSpeed;
