import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

/**
 * 渲染 DIFFICULTY 标题文本
 *
 * 用于主菜单界面显示“DIFFICULTY”提示文字。
 *
 * 样式：
 *
 * - 绿色主题色
 * - 标准字体大小（1x fontSize）
 * - 居中显示在画布上方区域
 *
 * @function renderDifficultText
 * @param {object} canvas - 游戏 canvas 信息对象
 * @returns {void}
 */
const renderDifficultText = (canvas) => {
  const { GREEN } = COLORS;
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;

  renderText(canvas, {
    text: 'DIFFICULTY',
    x: width / 2,
    y: height * 0.35,
    color: GREEN,
    size: 1,
    center: true,
  });
};

export default renderDifficultText;
