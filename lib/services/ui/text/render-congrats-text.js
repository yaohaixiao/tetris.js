import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

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
 * @param {object} canvas - 游戏 canvas 信息对象
 * @returns {void}
 */
const renderCongratsText = (canvas) => {
  const { YELLOW, BLACK } = COLORS;
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;

  renderText(canvas, {
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
