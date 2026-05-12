/**
 * # 获取当前等级的方块自动下落速度（延迟时间 ms）
 *
 * - 等级越高，下落速度越快（延迟值越小） 最低延迟限制为 120ms，防止速度过快无法操作
 * - 计算公式：1000 - (等级 - 1) * 15，保证每级速度平滑递增
 *
 * @function getSpeed
 * @param context - 执行上下文对象
 * @returns {number} 方块下落间隔时间（毫秒）
 */
const getSpeed = (context) => {
  const { options } = context;
  const level = context.Store.getLevel();
  // 算法：达到最大级别 70%，就达到极限下落速度，后面 30% 需要有挑战性
  const step = Math.ceil(1000 / Math.floor(options.Level.max * 0.7));

  /*
   * 计算下落速度：
   *
   * 基础值1000ms，每升一级减少 step，根据配置的最大级别计算
   * 最低不低于120ms，有挑战，但不至于太极限，还是希望有人冲击 99 级
   */
  return Math.max(120, 1000 - (level - 1) * step);
};

export default getSpeed;
