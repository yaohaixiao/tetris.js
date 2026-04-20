import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/ui/core/canvas.js';
import renderText from '@/lib/ui/text/render-text.js';

/**
 * 渲染 LEVEL 标题文本
 *
 * 用于主菜单界面显示“LEVEL”提示文字。
 *
 * 样式：
 *
 * - 绿色主题色
 * - 标准字体大小（1x fontSize）
 * - 居中显示在画布上方区域
 *
 * @function renderLevelText
 * @returns {void}
 */
const renderLevelText = () => {
  const { GREEN } = COLORS;
  const { gameBoard } = Canvas;
  const { width, height } = gameBoard;

  renderText({
    text: 'LEVEL',
    x: width / 2,
    y: height * 0.35,
    color: GREEN,
    size: 1,
    center: true,
  });
};

export default renderLevelText;
