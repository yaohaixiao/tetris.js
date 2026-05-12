import renderTetrisText from '@/lib/services/ui/text/render-tetris-text.js';
import renderFireworks from '@/lib/services/ui/effects/render-fireworks.js';
import renderLevelUpText from '@/lib/services/ui/text/render-level-up-text.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import renderLevelNumber from '@/lib/services/ui/text/render-level-number.js';
import renderCongratsText from '@/lib/services/ui/text/render-congrats-text.js';

/**
 * # 渲染升级庆祝场景（Level Up Celebration Scene）
 *
 * 包含：
 *
 * - 半透明遮罩
 * - 标题（TETRIS.JS）
 * - LEVEL UP 提示
 * - 当前等级数值
 * - CONGRATS 强调文本
 * - 烟花粒子特效
 *
 * 渲染顺序（从底到顶）：
 *
 * 1. Overlay（背景遮罩）
 * 2. 标题
 * 3. LEVEL UP 文本
 * 4. Level 数值
 * 5. CONGRATS 文本
 * 6. 烟花特效（最上层）
 *
 * @function renderLevelUp
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {number} level - 当前等级
 * @param {Array} fireworks - 烟花粒子数组
 * @returns {void}
 */
export function renderLevelUp(canvas, level, fireworks) {
  const { gameBoard } = canvas;
  const { height } = gameBoard;

  /* ======== 1. 背景层 ======== */
  renderOverlay(canvas);

  /* ======== 2. 文本层 ======== */
  renderTetrisText(canvas);
  renderLevelUpText(canvas);
  renderLevelNumber(canvas, level, height / 1.85);
  renderCongratsText(canvas);

  /* ======== 3. 特效层 ======== */
  renderFireworks(canvas, fireworks);
}

export default renderLevelUp;
