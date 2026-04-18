import COLORS from '@/lib/constants/colors.js';
import GAME from '@/lib/game/constants/game.js';
import Canvas from '@/lib/ui/core/canvas.js';
import GameState from '@/lib/game/state/game-state.js';
import renderTetrisText from '@/lib/ui/text/render-tetris-text.js';
import renderFireworks from '@/lib/ui/effects/render-fireworks.js';

/**
 * # 绘制升级庆祝文字 + 烟花
 *
 * @function renderLevelUp
 * @param {object} state - 升级特效的状态信息对象
 * @returns {boolean} - 不在升级中，返回 false，否则 true
 */
export function renderLevelUp(state) {
  const { RGBA_BLACK, BLACK, GREEN, YELLOW } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext: ctx, fontSize } = Canvas;
  const { width, height } = gameBoard;

  if (!state.show) {
    return false;
  }

  ctx.save();

  // 半透明遮罩
  ctx.fillStyle = RGBA_BLACK;
  ctx.fillRect(0, 0, width, height);

  /* ======== 绘制文本：TETRIS.JS（绿色）======== */
  renderTetrisText();

  /* ======== 绘制文本：LEVEL UP（绿色）======== */
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `${fontSize * 1.2}px ${FONT_FAMILY}`;
  ctx.fillStyle = GREEN;
  ctx.fillText(`LEVEL UP`, width / 2, height / 2.5);
  ctx.restore();

  /* ======== 绘制文本：Level 数值 ======== */
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `${fontSize * 2.5}px ${FONT_FAMILY}`;
  ctx.fillStyle = GREEN;
  ctx.fillText(`${GameState.level}`, width / 2, height / 1.85);
  ctx.restore();

  /* ======== 绘制文本：CONGRATS!（黄色）======== */
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `${fontSize * 1.3}px ${FONT_FAMILY}`;
  ctx.fillStyle = YELLOW;
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 3;
  ctx.strokeText('CONGRATS!', width / 2, height / 1.6);
  ctx.fillText('CONGRATS!', width / 2, height / 1.6);
  ctx.restore();

  /* ======== 绘制烟花特效 ======== */
  renderFireworks(state);

  ctx.restore();

  return true;
}

export default renderLevelUp;
