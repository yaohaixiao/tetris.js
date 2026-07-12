import COLORS from '@/lib/constants/colors.js';
import OPTIONS from '@/lib/constants/options.js';
import clearBoard from '@/lib/services/ui/board/clear-board.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import renderActiveOnly from '@/lib/services/ui/board/render-active-only.js';
import renderTetrisText from '@/lib/services/ui/text/render-tetris-text.js';
import renderText from '@/lib/services/ui/text/render-text.js';
import renderEnterContinueText from '@/lib/services/ui/text/render-enter-continue-text.js';

/**
 * ============================================================
 *
 * # 渲染退出游戏菜单场景
 *
 * ============================================================
 *
 * Single 模式下按 ESC 键触发， 在游戏画布上渲染退出确认菜单覆盖层。 玩家通过 ↑↓ 方向键选择操作，Enter 确认。
 *
 * ## 菜单选项
 *
 * | 索引 | 选项        | 操作         |
 * | :--- | :---------- | :----------- |
 * | 0    | RESUME GAME | 继续游戏     |
 * | 1    | EXIT GAME   | 退出到主菜单 |
 *
 * ## 视觉布局
 *
 *     ┌────────────────────────┐
 *     │      TETRIS.JS         │  ← 标题
 *     │                        │
 *     │       GIVE             │  ← 主文字
 *     │       UP?              │
 *     │                        │
 *     │   [>] RESUME GAME      │  ← 选项列表
 *     │   [ ] EXIT GAME        │     选中项显示 > 和绿色
 *     │                        │
 *     │     ↑ ↓ SELECT         │  ← 操作提示
 *     │   ENTER CONTINUE       │
 *     └────────────────────────┘
 *
 * ## 与 battle-mode 场景的区别
 *
 * - Battle-mode：选择对战类型（VS AI / VS HUMAN）
 * - Exit-game：选择是否退出（RESUME / EXIT） 两者复用相同的布局结构，仅标题文字和选项列表不同。
 *
 * @function renderExitGameScene
 * @param {object} canvas - Canvas 画布管理器
 * @param {object} canvas.gameBoard - 主画布元素
 * @param {number} canvas.fontSize - 当前字体大小
 * @param {object} state - 当前游戏状态
 * @param {number} state.exitIndex - 当前选中的选项索引
 * @returns {void}
 */
const renderExitGameScene = (canvas, state) => {
  const { gameBoard, fontSize } = canvas;
  const { width, height } = gameBoard;

  // 1. 清空画布
  clearBoard(canvas);

  // 2. 绘制当前游戏画面作为背景
  renderActiveOnly(canvas, state);

  // 3. 绘制半透明遮罩
  renderOverlay(canvas);

  // 4. 绘制 "TETRIS.JS" 标题
  renderTetrisText(canvas);

  // 5. 绘制 "GIVE UP?" 主文字
  renderText(canvas, {
    text: 'GIVE',
    size: 2.46,
    color: COLORS.GREEN,
    x: width / 2,
    y: height * 0.3,
  });
  renderText(canvas, {
    text: 'UP?',
    size: 2.46,
    color: COLORS.GREEN,
    x: width / 2,
    y: height * 0.39,
  });

  // 6. 绘制选项列表
  const options = OPTIONS.EXIT_OPTIONS;
  const yStart = height * 0.5;
  const spacing = Math.min(fontSize * 2.5, 80);

  for (const [index, option] of options.entries()) {
    const y = yStart + index * spacing;
    const isSelected = index === state.exitIndex;
    const checked = isSelected ? '>' : ' ';

    renderText(canvas, {
      text: `[${checked}] ${option.label}`,
      x: width * 0.5,
      y,
      color: isSelected ? COLORS.GREEN : COLORS.WHITE,
    });
  }

  // 7. 底部操作提示
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

export default renderExitGameScene;
