import createHud from '@/lib/ui/hud/create-hud.js';
import getGameStateMode from '@/lib/game/state/get-game-state-mode.js';

/**
 * # 更新游戏界面上的所有 HUD 信息
 *
 * 将分数、行数、等级、最高分格式化后渲染到对应 DOM 元素
 *
 * @function updateHUD
 * @param {number} score - 当前游戏得分
 * @param {number} lines - 当前消除行数
 * @param {number} level - 当前游戏等级
 * @param {number} highScore - 历史最高得分
 * @param {boolean} [needReset=false] - 是否需要重置. Default is `false`
 * @returns {void}
 */
const updateHUD = (score, lines, level, highScore, needReset = false) => {
  const hud = createHud();
  const mode = getGameStateMode();

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

export default updateHUD;
