import createHud from '@/lib/ui/hud/create-hud.js';

/**
 * # 更新游戏界面上的所有 HUD 信息
 *
 * 将分数、行数、等级、最高分格式化后渲染到对应 DOM 元素
 *
 * @function renderHud
 * @param {object} state - 当前游戏状态
 * @returns {void}
 */
const renderHud = (state) => {
  const hud = createHud();
  const { mode, score, lines, level, highScore, needReset = false } = state;

  if (mode === 'main-menu' || needReset) {
    hud.reset();
  }

  hud.update({
    score,
    lines,
    level,
    highScore,
  });
};

export default renderHud;
