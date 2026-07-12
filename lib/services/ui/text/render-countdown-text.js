import COLORS from '@/lib/constants/colors.js';
import GAME from '@/lib/game/constants/game.js';

/**
 * ============================================================
 *
 * # 渲染倒计时数字
 *
 * ============================================================
 *
 * 用于 3-2-1 开始动画等场景。
 *
 * ## 特点
 *
 * - 居中显示（translate 到中心）
 * - 支持缩放（scale）动画
 * - 填充 + 描边增强视觉冲击
 *
 * @function renderCountdownText
 * @param {object} canvas - 游戏 canvas 信息对象
 * @param {number} count - 当前倒计时数字
 * @param {number} [scale=1] - 缩放比例（用于动画）. Default is `1`
 * @returns {void}
 */
const renderCountdownText = (canvas, count, scale = 1) => {
  const { YELLOW, BLACK } = COLORS;
  const { FONT_FAMILY } = GAME;
  const { gameBoard, gameBoardContext: ctx, fontSize } = canvas;
  const { width, height } = gameBoard;

  ctx.save();

  /*
   * ============================================================
   * 步骤 1：坐标系移到中心并缩放
   * ============================================================
   */
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, scale);

  /*
   * ============================================================
   * 步骤 2：设置文本样式
   * ============================================================
   */
  ctx.font = `${fontSize * 3.25}px ${FONT_FAMILY}`;
  ctx.fillStyle = YELLOW;
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 6;

  /*
   * ============================================================
   * 步骤 3：描边 + 填充绘制
   * ============================================================
   */
  const text = String(count);

  ctx.strokeText(text, 0, 0);
  ctx.fillText(text, 0, 0);

  ctx.restore();
};

export default renderCountdownText;
