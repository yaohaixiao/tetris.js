import GAME from '@/lib/game/constants/game.js';

/**
 * # 获取当前等级的方块自动下落速度
 *
 * 根据游戏等级计算方块自动下落的时间间隔。 等级越高，下落越快（间隔越小）。
 *
 * ## 计算公式
 *
 *     step = ceil(1000 / floor(MAX_LEVEL × 0.6))
 *     speed = max(120, 1000 - (level - 1) × step)
 *
 * ## 设计思路
 *
 * - **基础速度**：等级 1 时下落间隔为 1000ms（1 秒）
 * - **平滑递增**：每升一级，间隔减少固定值 `step`
 * - **极限保护**：最低间隔为 120ms，防止速度过快导致无法操作
 * - **挑战曲线**：前 60% 等级达到极限速度，后 40% 保持极限速度考验耐力
 *
 * ## 速度示例（MAX_LEVEL = 256）
 *
 *     step = ceil(1000 / floor(256 × 0.6))
 *      = ceil(1000 / 153)
 *      = ceil(6.53...)
 *      = 7
 *
 * | 等级 | 计算过程                           | 下落间隔 |
 * | ---- | ---------------------------------- | -------- |
 * | 1    | 1000 - 0×7 = 1000                  | 1000ms   |
 * | 50   | 1000 - 49×7 = 657                  | 657ms    |
 * | 100  | 1000 - 99×7 = 307                  | 307ms    |
 * | 126  | 1000 - 125×7 = 125                 | 125ms    |
 * | 127  | 1000 - 126×7 = 118 → max(120, 118) | 120ms    |
 * | 200  | max(120, ...)                      | 120ms    |
 * | 256  | max(120, ...)                      | 120ms    |
 *
 * 可以看到，大约在 127 级左右达到极限速度 120ms。
 *
 * ## 用途
 *
 * - **游戏主循环**：`startGameLoop` 中判断是否执行下落逻辑
 * - **AI 决策节奏**：AI 使用相同间隔进行决策，保持与人类玩家一致的速度感
 *
 * @function getSpeed
 * @param {object} runtime - 游戏运行时对象
 * @param {object} runtime.Store - 游戏状态存储
 * @returns {number} 方块自动下落的时间间隔（毫秒），范围 [120, 1000]
 */
const getSpeed = (runtime) => {
  const { MAX_LEVEL } = GAME;
  const { Store } = runtime;
  const level = Store.getLevel();

  /**
   * 计算每级的速度递减步长
   *
   * 前 60% 等级线性加速到极限速度， 后 40% 保持在极限速度考验玩家耐力。
   */
  const step = Math.ceil(1000 / Math.floor(MAX_LEVEL * 0.6));

  /**
   * 计算下落速度
   *
   * 基础值 1000ms，每升一级减少 step 毫秒，最低不低于 120ms。
   */
  return Math.max(120, 1000 - (level - 1) * step);
};

export default getSpeed;
