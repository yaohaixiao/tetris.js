import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/ui/core/canvas.js';
import renderText from '@/lib/ui/text/render-text.js';

/**
 * # 渲染“ENTER START”提示文本
 *
 * 用于主菜单 / 游戏结束等场景提示玩家按 Enter 开始游戏。
 *
 * 位置：
 *
 * - 居中
 * - 画布高度 70% 位置
 *
 * 样式：
 *
 * - TEAL 主题色
 * - 基于全局 fontSize 缩放
 *
 * @function renderEnterStartText
 * @returns {void}
 */
const renderEnterStartText = () => {
  const { TEAL } = COLORS;
  const { gameBoard } = Canvas;
  const { width, height } = gameBoard;

  renderText({
    text: 'ENTER START',
    x: width / 2,
    y: height * 0.7,
    color: TEAL,
    size: 1.15,
    center: true,
  });
};

export default renderEnterStartText;
