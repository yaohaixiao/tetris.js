import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

/**
 * # 渲染当前选中的 LEVEL 数字
 *
 * 用于主菜单界面显示玩家选择的难度等级。
 *
 * 样式：
 *
 * - 绿色主题色
 * - 大字号强调（3x fontSize）
 * - 居中显示在画布中部
 *
 * @function renderDifficultyWords
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {string} difficulty - 当前选中的难度等级
 * @param {number} y - Y坐标值
 * @returns {void}
 */
const renderDifficultyWords = (canvas, difficulty, y) => {
  const { GREEN } = COLORS;
  const { gameBoard } = canvas;
  const { width } = gameBoard;

  renderText(canvas, {
    text: difficulty.toUpperCase(),
    x: width / 2,
    y,
    color: GREEN,
    size: 2.2,
    center: true,
  });
};

export default renderDifficultyWords;
