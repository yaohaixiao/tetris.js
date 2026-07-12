import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

/**
 * ============================================================
 *
 * # 渲染难度选择快捷键提示文本
 *
 * ============================================================
 *
 * 用于主菜单界面提示玩家选择难度的快捷键。 根据手柄连接状态显示不同提示。
 *
 * ## 快捷键映射
 *
 * | 设备 | 按键    | 对应难度 |
 * | :--- | :------ | :------- |
 * | 键盘 | E/N/H/X | 各难度   |
 * | 手柄 | A/B/Y/X | 各难度   |
 *
 * ## 样式
 *
 * - 白色文本
 * - 标准字号（1x fontSize）
 * - 居中显示在等级区域下方
 *
 * @function renderDifficultyShortcut
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {object} state - 游戏状态信息
 * @param {boolean} state.gamepadConnected - 手柄是否已连接
 * @returns {void}
 */
const renderDifficultyShortcut = (canvas, state) => {
  const { WHITE } = COLORS;
  const { gameBoard } = canvas;
  const { width, height } = gameBoard;

  // 根据手柄连接状态选择快捷键提示文本
  let text = 'E/N/H/X KEY';

  if (state.gamepadConnected) {
    text = 'A/B/Y/X KEY';
  }

  // 绘制难度选择快捷键提示文本
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
