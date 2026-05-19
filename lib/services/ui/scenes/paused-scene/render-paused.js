import renderTetrisText from '@/lib/services/ui/text/render-tetris-text.js';
import renderPausedText from '@/lib/services/ui/text/render-paused-text.js';
import renderDigitalClock from '@/lib/services/ui/effects/render-digital-clock.js';
import renderAnalogClock from '@/lib/services/ui/effects/clock/render-analog-clock.js';
import clearBoard from '@/lib/services/ui/board/clear-board.js';
import renderActiveOnly from '@/lib/services/ui/board/render-active-only.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import renderSceneBackground from '@/lib/services/ui/image/render-scene-background.js';

/**
 * # 渲染"暂停（PAUSED）"场景
 *
 * 绘制暂停界面的完整 UI 层，包括当前游戏画面（作为背景）、 半透明遮罩层、时间显示和暂停提示文字。
 *
 * ## 渲染层级（从底到顶）
 *
 * | 层级 | 操作                      | 说明                         |
 * | ---- | ------------------------- | ---------------------------- |
 * | 1    | `clearBoard()`            | 清空画布                     |
 * | 2    | `renderActiveOnly()`      | 绘制当前棋盘作为暂停背景     |
 * | 3    | `renderOverlay()`         | 半透明遮罩层（强调暂停状态） |
 * | 4    | `renderSceneBackground()` | 绘制暂停场景背景             |
 * | 5    | `renderTetrisText()`      | 绘制 "TETRIS" 标题文字       |
 * | 6    | `renderDigitalClock()`    | 绘制数字时间显示             |
 * | 7    | `renderAnalogClock()`     | 绘制模拟时钟组件             |
 * | 8    | `renderPausedText()`      | 绘制 "PAUSED" 提示文字       |
 *
 * @function renderPaused
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {object} state - 当前游戏状态
 * @returns {void}
 */
const renderPaused = (canvas, state) => {
  // ======== 1. 清空画布 ========
  clearBoard(canvas);

  // ======== 2. 绘制当前游戏画面（作为暂停背景） ========
  renderActiveOnly(canvas, state);

  // ======== 3. 半透明遮罩层（强调暂停状态） ========
  renderOverlay(canvas);

  // ======== 4. 绘制暂停场景背景 ========
  renderSceneBackground(canvas, 'paused');

  // ======== 5. UI 层：标题 "TETRIS" ========
  renderTetrisText(canvas);

  // ======== 6. UI 层：数字时间显示 ========
  renderDigitalClock(canvas);

  // ======== 7. UI 层：模拟时钟组件 ========
  renderAnalogClock(canvas);

  // ======== 8. UI 层："PAUSED" 提示文字 ========
  renderPausedText(canvas);
};

export default renderPaused;
