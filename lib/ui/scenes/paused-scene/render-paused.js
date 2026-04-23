import renderTetrisText from '@/lib/ui/text/render-tetris-text.js';
import renderPausedText from '@/lib/ui/text/render-paused-text.js';
import renderDigitalClock from '@/lib/ui/effects/render-digital-clock.js';
import renderAnalogClock from '@/lib/ui/effects/clock/render-analog-clock.js';
import clearBoard from '@/lib/ui/board/clear-board.js';
import renderActiveOnly from '@/lib/ui/board/render-active-only.js';
import renderOverlay from '@/lib/ui/overlay/render-overlay.js';
import renderSceneBackground from '@/lib/ui/image/render-scene-background.js';

/**
 * # 渲染“暂停（PAUSED）”场景
 *
 * 该函数负责绘制暂停界面的完整 UI 层，包括：
 *
 * - 当前游戏画面（半透明保留）
 * - 黑色遮罩层（强调暂停状态）
 * - 游戏标题（TETRIS.JS）
 * - 数字时间显示
 * - 时钟组件
 * - PAUSED 提示文本
 *
 * 渲染结构说明：
 *
 * 1. 先清理画布
 * 2. 绘制当前游戏状态（作为背景）
 * 3. 添加半透明遮罩
 * 4. 绘制 UI 叠加层（标题 / 时间 / 暂停文字）
 *
 * @function renderPaused
 * @param {object} state - 当前游戏状态
 * @returns {void}
 */
const renderPaused = (state) => {
  // ======== 1. 清理画布 ========
  clearBoard();

  // ======== 2. 绘制当前游戏画面（作为暂停背景） ========
  renderActiveOnly(state);

  // ======== 3. 半透明遮罩层 ========
  renderOverlay();

  renderSceneBackground('paused');

  // ======== 4. UI 层：标题 ========
  renderTetrisText();

  // ======== 5. UI 层：数字时间 ========
  renderDigitalClock();

  // ======== 6. UI 层：时钟 ========
  renderAnalogClock();

  // ======== 7. 暂停文本 ========
  renderPausedText();
};

export default renderPaused;
