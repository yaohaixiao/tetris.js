import COLORS from '@/lib/constants/colors.js';
import OPTIONS from '@/lib/constants/options.js';
import clearBoard from '@/lib/services/ui/board/clear-board.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import renderTetrisText from '@/lib/services/ui/text/render-tetris-text.js';
import renderText from '@/lib/services/ui/text/render-text.js';
import renderSceneBackground from '@/lib/services/ui/image/render-scene-background.js';
import renderEnterContinueText from '@/lib/services/ui/text/render-enter-continue-text.js';

/**
 * # 对战模式子选择场景
 *
 * 玩家选择对战模式后，进一步选择对手类型。
 *
 * ## 交互
 *
 * - [A] 键：HUMAN VS AI
 * - [H] 键：HUMAN VS HUMAN
 * - [ESC] 键：返回模式选择
 *
 * @param {object} canvas - Canvas 画布管理器
 * @param {object} state - 当前游戏状态
 * @returns {void}
 */
const renderBattleModeScene = (canvas, state) => {
  const { gameBoard, fontSize } = canvas;
  const { width, height } = gameBoard;

  // === 1. 清空画布 ===
  clearBoard(canvas);

  // === 2. 绘制背景 ===
  renderOverlay(canvas);

  // === 3. 绘制 TETRIS.JS 标题 ===
  renderTetrisText(canvas);

  renderSceneBackground(canvas, state.mode);

  // === 4. 绘制 BATTLE MODE 标题 ===
  renderText(canvas, {
    text: 'BATTLE',
    size: 2.46,
    color: COLORS.GREEN,
    x: width / 2,
    y: height * 0.3,
  });
  renderText(canvas, {
    text: 'MODE',
    size: 2.46,
    color: COLORS.GREEN,
    x: width / 2,
    y: height * 0.39,
  });

  // === 5. 绘制选项 ===
  const options = OPTIONS.BATTLE_OPTIONS;

  const yStart = height * 0.5;
  const spacing = Math.min(fontSize * 2.5, 80);

  for (const [index, option] of options.entries()) {
    const y = yStart + index * spacing;
    const isSelected = index === state.battleIndex;
    const checked = isSelected ? '>' : ' ';

    renderText(canvas, {
      text: `[${checked}] ${option.label}`,
      x: width * 0.5,
      y,
      color: isSelected ? COLORS.GREEN : COLORS.WHITE,
    });
  }

  // === 6. 底部提示 ===
  renderText(canvas, {
    text: '↑ ↓ SELECT',
    size: 1,
    color: COLORS.TEAL,
    x: width / 2,
    y: height * 0.68,
    strokeColor: COLORS.BLACK,
    center: true,
    stroke: true,
  });
  renderEnterContinueText(canvas);
};

export default renderBattleModeScene;
