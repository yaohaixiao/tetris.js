/**
 * # 动画管理系统
 *
 * 负责注册、更新、渲染所有游戏动画，并管理动画的层级和阻塞行为使用数组存储所有活跃的动画实例，每个动画实例需要实现：
 *
 * - Update(delta): 更新动画状态，返回 boolean 表示是否继续存活
 * - Render(): 渲染动画
 * - Layer: 渲染层级（数字越大越靠前）
 * - Blocking: 是否阻塞用户输入
 * - Name: 动画名称（用于识别特定动画）
 */

// 动画系统存储数组
const system = [];

/**
 * # 注册动画到系统中
 *
 * @function registerAnimation
 * @param {object} anim - 动画对象，必须包含 update、render 方法和 layer、blocking、name 属性
 * @returns {void}
 */
export const registerAnimation = (anim) => {
  system.push(anim);
};

/**
 * 更新所有动画 从后往前遍历数组，避免删除元素时索引错乱
 *
 * @function updateAnimations
 * @param {number} delta - 距离上一帧的时间差（秒）
 * @returns {void}
 */
export const updateAnimations = (delta) => {
  /*
   * 从数组末尾开始遍历，因为可能在遍历过程中删除元素
   * 从后往前可以避免删除元素后索引偏移的问题
   */
  for (let i = system.length - 1; i >= 0; i--) {
    const anim = system[i];

    // 调用动画的 update 方法，获取动画是否继续存活
    const active = anim.update(delta);

    // 如果动画返回 false（表示已完成），则从系统中移除
    if (!active) {
      system.splice(i, 1);
    }
  }
};

/**
 * # 渲染所有动画
 *
 * 按照 layer 属性排序，确保动画按正确的层级顺序渲染 layer 值越大的动画越靠近屏幕上层（后渲染会覆盖先渲染的）
 *
 * @function renderAnimations
 * @returns {void}
 */
export const renderAnimations = () => {
  /*
   * 创建系统数组的副本并按 layer 升序排序
   * layer 小的先渲染（底层），layer 大的后渲染（上层）
   * 注意：toSorted() 是 ES2023 方法，不会修改原数组
   */
  const sorted = system.slice().toSorted((a, b) => a.layer - b.layer);

  // 按排序后的顺序依次渲染每个动画
  for (const anim of sorted) {
    anim.render();
  }
};

/**
 * # 检查是否存在阻塞性动画
 *
 * 用于判断用户输入是否应该被阻止（例如动画播放期间不允许操作）
 *
 * @example
 *   // 检查是否有任何阻塞动画
 *   if (hasBlockingAnimation()) {
 *     // 阻止用户输入
 *   }
 *
 * @example
 *   // 只检查特定的阻塞动画（如倒计时或消除行）
 *   if (hasBlockingAnimation(['countdown', 'clear-lines'])) {
 *     // 阻止用户输入
 *   }
 *
 * @function hasBlockingAnimation
 * @param {string[]} [names] - 可选的动画名称数组，用于只检查特定动画
 * @returns {boolean} - 是否存在符合条件的阻塞动画
 */
export const hasBlockingAnimation = (names) =>
  system.some((a) => {
    // 检查动画是否设置了阻塞标志
    const isBlocking = a.blocking;

    /*
     * 如果传入了名称数组且不为空，则只检查名称匹配的动画
     * 否则检查所有阻塞动画
     */
    return names && names.length > 0
      ? isBlocking && names.includes(a.name) // 特定动画且阻塞
      : a.blocking; // 任何阻塞动画
  });
