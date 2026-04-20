import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/ui/core/canvas.js';
import renderText from '@/lib/ui/text/render-text.js';

/**
 * # 渲染 CONGRATS! 提示文本
 *
 * 用于达成目标/胜利时的强调提示
 *
 * 特点：
 *
 * - 居中显示
 * - 填充 + 描边（增强可读性）
 * - 使用黄色 + 黑色描边
 *
 * @function renderCongratsText
 * @returns {void}
 */
const renderCongratsText = () => {
  const { YELLOW, BLACK } = COLORS;
  const { gameBoard } = Canvas;
  const { width, height } = gameBoard;

  renderText({
    text: 'CONGRATS!',
    x: width / 2,
    y: height / 1.6,
    color: YELLOW,
    stroke: true,
    strokeColor: BLACK,
    lineWidth: 3,
    size: 1.3,
    center: true,
  });
};

export default renderCongratsText;
