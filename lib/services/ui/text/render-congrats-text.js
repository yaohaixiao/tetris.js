import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

/**
 * # 渲染 CONGRATS! 提示文本
 *
 * 在升级庆祝场景中显示"CONGRATS!"祝贺文字， 使用黄色填充 + 黑色描边增强可读性。
 *
 * ## 布局
 *
 * - **位置**：水平居中，垂直位于画布高度的 `1/1.6` 处
 * - **颜色**：黄色填充 + 黑色描边
 * - **尺寸**：字体大小系数 1.3
 *
 * @function renderCongratsText
 * @param {object} canvas - Canvas 画布管理器对象
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
    color: YELLOW, // 黄色填充
    stroke: true, // 启用描边
    strokeColor: BLACK, // 黑色描边
    lineWidth: 3, // 描边宽度 3px
    size: 1.3, // 字体大小系数
    center: true, // 水平居中
  });
};

export default renderCongratsText;
