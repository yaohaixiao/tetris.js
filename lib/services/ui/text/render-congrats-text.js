import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

/**
 * ============================================================
 *
 * # 渲染 CONGRATS! 提示文本
 *
 * ============================================================
 *
 * 在升级庆祝场景中显示 "CONGRATS!" 祝贺文字， 使用黄色填充 + 黑色描边增强可读性。
 *
 * ## 样式
 *
 * - 水平居中，垂直位于画布高度的 1/1.6 处
 * - 黄色填充 + 黑色描边
 * - 字体大小系数 1.3
 *
 * @function renderCongratsText
 * @param {object} canvas - Canvas 画布管理器对象
 * @returns {void}
 */
const renderCongratsText = (canvas) => {
  const { YELLOW, BLACK } = COLORS;
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;

  // 绘制 CONGRATS! 祝贺文本
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
