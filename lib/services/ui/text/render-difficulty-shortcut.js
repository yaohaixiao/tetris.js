import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

/**
 * 渲染难度选择快捷键提示文本
 *
 * 用于主菜单界面提示玩家可以使用键盘或者游戏手柄选择难度：
 *
 * - 电脑键盘：E N H T
 * - 游戏手柄：A B X Y
 *
 * 样式：
 *
 * - 白色文本
 * - 标准字号（1x fontSize）
 * - 居中显示在等级区域下方
 *
 * @function renderDifficultyShortcut
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {object} state - 游戏状态信息
 * @returns {void}
 */
const renderDifficultyShortcut = (canvas, state) => {
  const { WHITE } = COLORS;
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;
  let text = 'E/N/H/X KEY';

  if (state.gamepadConnected) {
    text = 'A/B/Y/X KEY';
  }

  renderText(canvas, {
    text,
    x: width / 2,
    y: height * 0.58,
    color: WHITE,
    size: 1,
    center: true,
  });
};

export default renderDifficultyShortcut;
