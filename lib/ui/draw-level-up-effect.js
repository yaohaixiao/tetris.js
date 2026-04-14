import COLORS from '../constants/colors.js';
import GAME from '../constants/game.js';
import Canvas from './canvas.js';
import Effects from './effects.js';
import GameState from '../state/game-state.js';
import drawTetrisText from './draw-tetris-text.js';
import drawFireworksEffect from './draw-fireworks-effect.js';

/**
 * # 绘制升级庆祝文字 + 烟花
 *
 * @function drawLevelUpEffect
 * @returns {boolean} - 不在升级中，返回 false，否则 true
 */
export function drawLevelUpEffect() {
  const { RGBA_BLACK, BLACK, GREEN, YELLOW } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext, fontSize } = Canvas;
  const { width, height } = gameBoard;
  const effect = Effects.levelUp;

  if (!effect.show) {
    return false;
  }

  gameBoardContext.save();

  // 半透明遮罩
  gameBoardContext.fillStyle = RGBA_BLACK;
  gameBoardContext.fillRect(0, 0, width, height);

  /* ======== 绘制文本：TETRIS.JS（绿色）======== */
  drawTetrisText();

  /* ======== 绘制文本：LEVEL UP（绿色）======== */
  gameBoardContext.save();
  gameBoardContext.textAlign = 'center';
  gameBoardContext.font = `${fontSize * 1.2}px ${FONT_FAMILY}`;
  gameBoardContext.fillStyle = GREEN;
  gameBoardContext.fillText(`LEVEL UP`, width / 2, height / 2.5);
  gameBoardContext.restore();

  /* ======== 绘制文本：Level 数值 ======== */
  gameBoardContext.save();
  gameBoardContext.textAlign = 'center';
  gameBoardContext.font = `${fontSize * 2.5}px ${FONT_FAMILY}`;
  gameBoardContext.fillStyle = GREEN;
  gameBoardContext.fillText(`${GameState.level}`, width / 2, height / 1.85);
  gameBoardContext.restore();

  /* ======== 绘制文本：CONGRATS!（黄色）======== */
  gameBoardContext.save();
  gameBoardContext.textAlign = 'center';
  gameBoardContext.font = `${fontSize * 1.3}px ${FONT_FAMILY}`;
  gameBoardContext.fillStyle = YELLOW;
  gameBoardContext.strokeStyle = BLACK;
  gameBoardContext.lineWidth = 3;
  gameBoardContext.strokeText('CONGRATS!', width / 2, height / 1.6);
  gameBoardContext.fillText('CONGRATS!', width / 2, height / 1.6);
  gameBoardContext.restore();

  /* ======== 绘制烟花特效 ======== */
  drawFireworksEffect();

  gameBoardContext.restore();

  return true;
}

export default drawLevelUpEffect;
