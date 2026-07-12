import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

/**
 * ============================================================
 *
 * # 渲染 "ENTER START" 提示文本
 *
 * ============================================================
 *
 * 用于主菜单 / 游戏结束等场景提示玩家按 Enter 开始游戏。
 *
 * ## 样式
 *
 * - TEAL 主题色 + 黑色描边
 * - 基于全局 fontSize 缩放（1.15x）
 * - 居中显示在画布高度 70% 位置
 *
 * @function renderEnterStartText
 * @param {object} canvas - 游戏 canvas 信息对象
 * @returns {void}
 */
const renderEnterStartText = (canvas) => {
  const { TEAL, BLACK } = COLORS;
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;

  // 绘制 ENTER START 提示文本
  renderText(canvas, {
    text: 'ENTER START',
    x: width / 2,
    y: height * 0.74,
    color: TEAL,
    strokeColor: BLACK,
    size: 1.15,
    center: true,
    stroke: true,
  });
};

export default renderEnterStartText;
