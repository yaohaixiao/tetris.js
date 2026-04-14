import Effects from './effects.js';

/**
 * # 向消除特效队列中添加一行需要闪烁的行
 *
 * 用于在消行前，标记哪一行需要执行闪烁动画，同一行只会添加一次，避免重复渲染导致异常
 *
 * @function addClearEffect
 * @param {number} y - 需要闪烁消除的行号
 * @returns {void}
 */
const addClearEffect = (y) => {
  const effect = Effects.clear;
  const isLineContains = effect.lines.some((line) => line.y === y);

  // 检查当前行是否已在特效队列中，避免重复添加
  if (!isLineContains) {
    // 向队列添加新闪烁行：初始透明度 1（完全显示），计时器从 0 开始
    effect.lines.push({ y, alpha: 1, timer: 0 });
  }
};

export default addClearEffect;
