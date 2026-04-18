import GameState from '../../game/state/game-state.js';

/**
 * # 获取当前等级的方块自动下落速度（延迟时间 ms）
 *
 * 等级越高，下落速度越快（延迟值越小） 最低延迟限制为 100ms，防止速度过快无法操作 计算公式：1000 - (等级 - 1) *
 * 80，保证每级速度平滑递增
 *
 * @function getSpeed
 * @returns {number} 方块下落间隔时间（毫秒）
 */
const getSpeed = () =>
  // 计算速度：基础值1000ms，每升一级减少80ms，最低不低于100ms
  Math.max(100, 1000 - (GameState.level - 1) * 80);

export default getSpeed;
