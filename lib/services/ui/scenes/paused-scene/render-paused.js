import renderTetrisText from '@/lib/services/ui/text/render-tetris-text.js';
import renderPausedText from '@/lib/services/ui/text/render-paused-text.js';
import renderDigitalClock from '@/lib/services/ui/effects/render-digital-clock.js';
import renderAnalogClock from '@/lib/services/ui/effects/clock/render-analog-clock.js';
import clearBoard from '@/lib/services/ui/board/clear-board.js';
import renderActiveOnly from '@/lib/services/ui/board/render-active-only.js';
import renderOverlay from '@/lib/services/ui/overlay/render-overlay.js';
import renderSceneBackground from '@/lib/services/ui/image/render-scene-background.js';

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
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {object} state - 当前游戏状态
 * @returns {void}
 */
const renderPaused = (canvas, state) => {
  // ======== 1. 清理画布 ========
  clearBoard(canvas);

  // ======== 2. 绘制当前游戏画面（作为暂停背景） ========
  renderActiveOnly(canvas, state);

  // ======== 3. 半透明遮罩层 ========
  renderOverlay(canvas);

  renderSceneBackground(canvas, 'paused');

  // ======== 4. UI 层：标题 ========
  renderTetrisText(canvas);

  // ======== 5. UI 层：数字时间 ========
  renderDigitalClock(canvas);

  // ======== 6. UI 层：时钟 ========
  renderAnalogClock(canvas);

  // ======== 7. 暂停文本 ========
  renderPausedText(canvas);
};

export default renderPaused;
