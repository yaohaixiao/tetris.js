import renderTetrisText from '@/lib/services/ui/text/render-tetris-text.js';
import renderFireworks from '@/lib/services/ui/effects/render-fireworks.js';
import renderLevelUpText from '@/lib/services/ui/text/render-level-up-text.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import renderLevelNumber from '@/lib/services/ui/text/render-level-number.js';
import renderCongratsText from '@/lib/services/ui/text/render-congrats-text.js';

/**
 * ============================================================
 *
 * # 渲染升级庆祝场景
 *
 * ============================================================
 *
 * 在玩家升级时渲染完整的庆祝界面， 包括遮罩层、等级提示文字和烟花粒子特效。
 *
 * ## 渲染层级（从底到顶）
 *
 * | 层级 | 操作                 | 说明                 |
 * | :--- | :------------------- | :------------------- |
 * | 1    | renderOverlay()      | 半透明遮罩层         |
 * | 2    | renderTetrisText()   | 绘制 "TETRIS" 标题   |
 * | 3    | renderLevelUpText()  | 绘制 "LEVEL UP" 提示 |
 * | 4    | renderLevelNumber()  | 绘制新等级数字       |
 * | 5    | renderCongratsText() | 绘制 "CONGRATS" 祝贺 |
 * | 6    | renderFireworks()    | 绘制烟花粒子特效     |
 *
 * @function renderLevelUp
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {number} level - 升级后的新等级
 * @param {object[]} fireworks - 烟花粒子数组
 * @returns {void}
 */
export function renderLevelUp(canvas, level, fireworks) {
  const { gameBoard } = canvas;
  const { height } = gameBoard;

  // 1. 背景层：半透明遮罩
  renderOverlay(canvas);

  // 2. 文本层
  renderTetrisText(canvas);
  renderLevelUpText(canvas);
  renderLevelNumber(canvas, level, height / 1.85);
  renderCongratsText(canvas);

  // 3. 特效层：烟花粒子
  renderFireworks(canvas, fireworks);
}

export default renderLevelUp;
