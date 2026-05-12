import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

/**
 * # 渲染“ENTER CONTINUE”提示文本
 *
 * 用于主菜单提示玩家按 Enter 到难度选择界面。
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
 * @function renderEnterContinueText
 * @param {object} canvas - 游戏 canvas 信息对象
 * @returns {void}
 */
const renderEnterContinueText = (canvas) => {
  const { TEAL, BLACK } = COLORS;
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;

  renderText(canvas, {
    text: 'ENTER CONTINUE',
    x: width / 2,
    y: height * 0.74,
    color: TEAL,
    strokeColor: BLACK,
    size: 1,
    center: true,
    stroke: true,
  });
};

export default renderEnterContinueText;
