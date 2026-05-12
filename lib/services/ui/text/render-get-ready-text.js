import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

/**
 * 渲染 “GET READY!” 提示文本
 *
 * 用于游戏开始前提示玩家准备
 *
 * 特点：
 *
 * - 居中显示
 * - 固定字号（不受动画 scale 影响）
 * - 描边 + 填充增强可读性
 *
 * @function renderGetReadyText
 * @param {object} canvas - 游戏 canvas 信息对象
 * @returns {void}
 */
const renderGetReadyText = (canvas) => {
  const { GREEN, BLACK } = COLORS;
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;

  renderText(canvas, {
    text: 'GET READY!',
    x: width / 2,
    y: height / 1.46,
    color: GREEN,
    stroke: true,
    strokeColor: BLACK,
    // 固定字号
    size: 1.1,
    center: true,
    // 对齐方式与你原逻辑一致
    baseline: 'top',
  });
};

export default renderGetReadyText;
