import COLORS from '@/lib/constants/colors.js';
import OPTIONS from '@/lib/constants/options.js';
import clearBoard from '@/lib/services/ui/board/clear-board.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import renderTetrisText from '@/lib/services/ui/text/render-tetris-text.js';
import renderText from '@/lib/services/ui/text/render-text.js';
import renderSceneBackground from '@/lib/services/ui/image/render-scene-background.js';
import renderEnterContinueText from '@/lib/services/ui/text/render-enter-continue-text.js';

/**
 * # 模式选择场景
 *
 * 游戏启动后的初始界面，让玩家选择单人模式或对战模式。
 *
 * ## 交互
 *
 * - [S] 键：进入单人模式 → 跳转到等级选择
 * - [B] 键：进入对战模式 → 跳转到对战类型选择
 *
 * ## 视觉
 *
 * - 标题："TETRIS"
 * - 选项高亮显示
 * - 快捷键提示
 *
 * @param {object} canvas - Canvas 画布管理器
 * @param {object} state - 当前游戏状态
 * @returns {void}
 */
const renderGameModeScene = (canvas, state) => {
  const { gameBoard, fontSize } = canvas;
  const { width, height } = gameBoard;

  // === 1. 清空画布 ===
  clearBoard(canvas);

  // === 2. 绘制背景 ===
  renderOverlay(canvas);

  // === 3. 绘制 TETRIS.JS 标题 ===
  renderTetrisText(canvas);

  renderSceneBackground(canvas, state.mode);

  // === 4. 绘制副标题 ===
  renderText(canvas, {
    text: 'GAME',
    color: COLORS.GREEN,
    size: 2.6,
    x: width / 2,
    y: height * 0.3,
  });
  renderText(canvas, {
    text: 'MODE',
    color: COLORS.GREEN,
    size: 2.6,
    x: width / 2,
    y: height * 0.39,
  });

  // === 5. 绘制选项 ===
  const options = OPTIONS.MODE_OPTIONS;

  const yStart = height * 0.5;
  const spacing = Math.min(fontSize * 2.5, 80);

  for (const [index, option] of options.entries()) {
    const y = yStart + index * spacing;
    const isSelected = index === state.modeIndex;
    const checked = isSelected ? '>' : ' ';

    // 选项文字
    renderText(canvas, {
      text: `[${checked}] ${option.label}`,
      x: width * 0.5,
      y,
      size: 1.2,
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

export default renderGameModeScene;
