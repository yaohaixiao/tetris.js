import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/ui/core/canvas.js';
import renderText from '@/lib/ui/text/render-text.js';

/**
 * # 渲染 LEVEL UP 提示文本
 *
 * 用于在关卡升级时显示短暂提示文字
 *
 * 特点：
 *
 * - 居中显示
 * - 使用绿色主题色
 * - 字体大小基于基础 fontSize 放大
 *
 * @function renderLevelUpText
 * @returns {void}
 */
const renderLevelUpText = () => {
  const { GREEN } = COLORS;
  const { gameBoard } = Canvas;
  const { width, height } = gameBoard;

  renderText({
    text: 'LEVEL UP',
    x: width / 2,
    y: height / 2.5,
    color: GREEN,
    size: 1.2,
    center: true,
  });
};

export default renderLevelUpText;
