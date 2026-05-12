import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

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
 * @param {object} canvas - 游戏 canvas 信息对象
 * @returns {void}
 */
const renderLevelUpText = (canvas) => {
  const { GREEN } = COLORS;
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;

  renderText(canvas, {
    text: 'LEVEL UP',
    x: width / 2,
    y: height / 2.5,
    color: GREEN,
    size: 1.2,
    center: true,
  });
};

export default renderLevelUpText;
