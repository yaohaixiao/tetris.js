import GAME from '@/lib/game/constants/game.js';

/**
 * # 获取当前等级的方块自动下落速度
 *
 * 根据游戏等级计算方块自动下落的时间间隔。 等级越高，下落越快（间隔越小）。
 *
 * ## 计算公式
 *
 *     step = ceil(1000 / floor(MAX_LEVEL × SPEED_STEPS[difficulty]))
 *     speed = max(120, 1000 - (level - 1) × step)
 *
 * ## 设计思路
 *
 * - **基础速度**：等级 1 时下落间隔为 1000ms（1 秒）
 * - **平滑递增**：每升一级，间隔减少固定值 `step`
 * - **极限保护**：最低间隔为 120ms，防止速度过快导致无法操作
 * - **难度影响**：不同难度使用不同的 SPEED_STEPS 系数， 难度越高系数越小，step 越大，加速越快
 *
 * ## 各难度速度系数
 *
 * | 难度   | SPEED_STEPS | 说明                       |
 * | ------ | ----------- | -------------------------- |
 * | EASY   | 0.6         | 60% 等级达到极限，加速平缓 |
 * | NORMAL | 0.4         | 40% 等级达到极限，加速适中 |
 * | HARD   | 0.2         | 20% 等级达到极限，加速较快 |
 * | EXPERT | 0.1         | 10% 等级达到极限，加速极快 |
 *
 * ## 速度示例（EASY 难度，MAX_LEVEL = 256）
 *
 *     step = ceil(1000 / floor(256 × 0.6))
 *      = ceil(1000 / 153)
 *      = ceil(6.53...)
 *      = 7
 *
 * | 等级 | 计算过程          | 下落间隔 |
 * | ---- | ----------------- | -------- |
 * | 1    | 1000 - 0×7 = 1000 | 1000ms   |
 * | 50   | 1000 - 49×7 = 657 | 657ms    |
 * | 100  | 1000 - 99×7 = 307 | 307ms    |
 * | 127  | max(120, 118)     | 120ms    |
 * | 256  | max(120, ...)     | 120ms    |
 *
 * ## 速度示例（EXPERT 难度，MAX_LEVEL = 256）
 *
 *     step = ceil(1000 / floor(256 × 0.1))
 *      = ceil(1000 / 25)
 *      = 40
 *
 * | 等级 | 计算过程           | 下落间隔 |
 * | ---- | ------------------ | -------- |
 * | 1    | 1000 - 0×40 = 1000 | 1000ms   |
 * | 10   | 1000 - 9×40 = 640  | 640ms    |
 * | 23   | max(120, 120)      | 120ms    |
 * | 256  | max(120, ...)      | 120ms    |
 *
 * Expert 难度下仅 23 级就达到极限速度，远快于 Easy 的 127 级。
 *
 * ## 用途
 *
 * - **游戏主循环**：`flush` 中判断是否执行下落逻辑
 * - **AI 决策节奏**：AI 使用相同间隔进行决策，保持与人类玩家一致的速度感
 *
 * @function getSpeed
 * @param {object} runtime - 游戏运行时对象
 * @param {object} runtime.Store - 游戏状态存储，需提供 getLevel() 和 getDifficulty() 方法
 * @returns {number} 方块自动下落的时间间隔（毫秒），范围 [120, 1000]
 */
const getSpeed = (runtime) => {
  // 从 GAME 常量中获取最大等级和速度系数配置
  const { MAX_LEVEL, SPEED_STEPS } = GAME;
  // 解构 Store 用于读取当前等级和难度
  const { Store } = runtime;
  // 获取当前等级（1-256）
  const level = Store.getLevel();
  /*
   * ==================== 获取当前难度并转为大写 ====================
   *
   * 用于 SPEED_STEPS 的 key 查找：
   * SPEED_STEPS 的 key 是 EASY/NORMAL/HARD/EXPERT（大写）
   */
  const difficult = Store.getDifficulty().toUpperCase();

  /*
   * ==================== 计算每级的速度递减步长 ====================
   *
   * 1. MAX_LEVEL × SPEED_STEPS[difficulty] — 计算该难度下加速阶段的等级数
   *    例如 EASY: 256 × 0.6 = 153.6 → floor(153.6) = 153
   *    例如 EXPERT: 256 × 0.1 = 25.6 → floor(25.6) = 25
   *
   * 2. 1000 / 加速等级数 — 将 1000ms 的总加速量均匀分配到加速阶段
   *    例如 EASY: 1000 / 153 = 6.53...
   *    例如 EXPERT: 1000 / 25 = 40
   *
   * 3. Math.ceil — 向上取整确保加速量足够，避免最后几级速度不减
   *    例如 EASY: ceil(6.53) = 7ms/级
   *    例如 EXPERT: ceil(40) = 40ms/级
   *
   * 加速阶段等级数越小，step 越大，加速越快，越早达到极限速度。
   */
  const step = Math.ceil(1000 / Math.floor(MAX_LEVEL * SPEED_STEPS[difficult]));

  /*
   * ==================== 计算下落速度 ====================
   *
   * 基础值 1000ms（等级 1），每升一级减少 step 毫秒。
   * 等级 N 的下落间隔 = 1000 - (N-1) × step
   *
   * Math.max(120, ...) 确保最低不低于 120ms，
   * 防止速度过快导致人类玩家无法操作。
   *
   * 例如 EASY 难度等级 127:
   *   1000 - 126×7 = 1000 - 882 = 118
   *   max(120, 118) = 120
   */
  return Math.max(120, 1000 - (level - 1) * step);
};

export default getSpeed;
