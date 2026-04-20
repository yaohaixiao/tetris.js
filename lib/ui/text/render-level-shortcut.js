import COLORS from '@/lib/constants/colors.js';
import Canvas from '@/lib/ui/core/canvas.js';
import renderText from '@/lib/ui/text/render-text.js';

/**
 * 渲染难度选择快捷键提示文本
 *
 * 用于主菜单界面提示玩家可以使用 1-9 或 T 键选择等级。
 *
 * 样式：
 *
 * - 白色文本
 * - 标准字号（1x fontSize）
 * - 居中显示在等级区域下方
 *
 * @function renderLevelShortcut
 * @returns {void}
 */
const renderLevelShortcut = () => {
  const { WHITE } = COLORS;
  const { gameBoard } = Canvas;
  const { width, height } = gameBoard;

  renderText({
    text: '1-9 or T KEY',
    x: width / 2,
    y: height * 0.58,
    color: WHITE,
    size: 1,
    center: true,
  });
};

export default renderLevelShortcut;
