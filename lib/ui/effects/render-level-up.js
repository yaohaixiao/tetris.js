import Canvas from '@/lib/ui/core/canvas.js';
import renderTetrisText from '@/lib/ui/text/render-tetris-text.js';
import renderFireworks from '@/lib/ui/effects/render-fireworks.js';
import renderLevelUpText from '@/lib/ui/text/render-level-up-text.js';
import renderOverlay from '@/lib/ui/overlay/render-overlay.js';
import renderLevelNumber from '@/lib/ui/text/render-level-number.js';
import renderCongratsText from '@/lib/ui/text/render-congrats-text.js';

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
 * @param {number} level - 当前等级
 * @param {Array} fireworks - 烟花粒子数组
 * @returns {void}
 */
export function renderLevelUp(level, fireworks) {
  const { gameBoard } = Canvas;
  const { height } = gameBoard;

  /* ======== 1. 背景层 ======== */
  renderOverlay();

  /* ======== 2. 文本层 ======== */
  renderTetrisText();
  renderLevelUpText();
  renderLevelNumber(level, height / 1.85);
  renderCongratsText();

  /* ======== 3. 特效层 ======== */
  renderFireworks(fireworks);
}

export default renderLevelUp;
