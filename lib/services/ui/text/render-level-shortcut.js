import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

/**
 * ============================================================
 *
 * # 渲染难度选择快捷键提示文本
 *
 * ============================================================
 *
 * 用于主菜单界面提示玩家可以使用 1-9 或 T 键 选择等级。
 *
 * ## 样式
 *
 * - 白色文本
 * - 标准字号（1x fontSize）
 * - 居中显示在等级区域下方
 *
 * @function renderLevelShortcut
 * @param {object} canvas - 游戏 canvas 信息对象
 * @returns {void}
 */
const renderLevelShortcut = (canvas) => {
  const { WHITE } = COLORS;
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;

  // 绘制难度选择快捷键提示文本
  renderText(canvas, {
    text: '1-9 or T KEY',
    x: width / 2,
    y: height * 0.58,
    color: WHITE,
    size: 1,
    center: true,
  });
};

export default renderLevelShortcut;
