/**
 * # 获取当前等级的方块自动下落速度（延迟时间 ms）
 *
 * 等级越高，下落速度越快（延迟值越小） 最低延迟限制为 100ms，防止速度过快无法操作 计算公式：1000 - (等级 - 1) *
 * 80，保证每级速度平滑递增
 *
 * @function getSpeed
 * @param {object} state - 游戏状态. Default is `EngineState`
 * @returns {number} 方块下落间隔时间（毫秒）
 */
const getSpeed = (state) =>
  // 计算速度：基础值1000ms，每升一级减少80ms，最低不低于100ms
  Math.max(100, 1000 - (state.level - 1) * 80);

export default getSpeed;
