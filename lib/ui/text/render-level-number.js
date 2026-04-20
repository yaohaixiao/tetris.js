import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/ui/core/canvas.js';
import renderText from '@/lib/ui/text/render-text.js';

/**
 * 渲染当前选中的 LEVEL 数字
 *
 * 用于主菜单界面显示玩家选择的难度等级。
 *
 * 样式：
 *
 * - 绿色主题色
 * - 大字号强调（3x fontSize）
 * - 居中显示在画布中部
 *
 * @function renderLevelNumber
 * @param {number} level - 当前选中的难度等级
 * @param {number} y - Y坐标值
 * @returns {void}
 */
const renderLevelNumber = (level, y) => {
  const { GREEN } = COLORS;
  const { gameBoard } = Canvas;
  const { width } = gameBoard;

  renderText({
    text: String(level),
    x: width / 2,
    y,
    color: GREEN,
    size: 3,
    center: true,
  });
};

export default renderLevelNumber;
