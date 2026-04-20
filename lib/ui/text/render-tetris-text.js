import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/ui/core/canvas.js';
import renderText from '@/lib/ui/text/render-text.js';

/**
 * 在游戏画布顶部渲染标题文本 “TETRIS.JS”
 *
 * 该函数用于在画布顶部区域（约 10% 高度）绘制游戏标题， 通常作为游戏主界面的视觉标识。
 *
 * 渲染特点：
 *
 * - 文本水平居中
 * - 使用统一游戏字体
 * - 使用主题绿色（GREEN）
 * - 字体大小基于 Canvas.fontSize 动态计算
 *
 * 依赖项：
 *
 * - COLORS.GREEN：标题颜色
 * - GAME.FONT_FAMILY：字体族
 * - Canvas：提供画布、上下文和基础字体大小
 *
 * @function renderTetrisText
 * @returns {void} 无返回值，仅执行绘制操作
 */
const renderTetrisText = () => {
  // 从颜色常量中获取 GREEN 颜色（用于标题）
  const { GREEN } = COLORS;
  // 解构 Canvas 提供的画布、上下文以及基础字体大小
  const { gameBoard } = Canvas;

  // 获取画布尺寸
  const { width, height } = gameBoard;

  /* ======== 绘制文本：TETRIS.JS（绿色） ======== */
  renderText({
    text: 'TETRIS.JS',
    x: width / 2,
    y: height * 0.1,
    color: GREEN,
    size: 1.1,
  });
};

export default renderTetrisText;
