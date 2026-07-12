import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

/**
 * ============================================================
 *
 * # 渲染垃圾行预警
 *
 * ============================================================
 *
 * 在棋盘上绘制橙色网格覆盖 + 居中警告文字， 提示即将受到垃圾行攻击。 由 GarbageWarningAnimation.render() 每帧调用。
 *
 * ## 视觉表现
 *
 * - 背景层：半透明覆盖整个棋盘（透明度 0.15）
 * - 网格层：1px 网格线覆盖（透明度 0.4）
 * - 文字层：居中分两行显示 "INCOMING" / "ATTACK"
 * - 根据 amount 显示不同颜色： 2 行黄色 / 3 行橙色 / 4 行红色
 *
 * ## 渲染层次
 *
 * 1. 半透明背景（globalAlpha = 0.15）
 * 2. 网格线（globalAlpha = 0.4, lineWidth = 1）
 * 3. "INCOMING" 文字（居中偏上）
 * 4. "ATTACK" 文字（居中偏下）
 *
 * ## 设计考量
 *
 * ### 为什么用橙色系？
 *
 * 橙色在色彩心理学中代表警告/注意， 半透明叠加不会完全遮挡棋盘， 玩家仍能看到当前游戏状态。
 *
 * ### 为什么保留网格线？
 *
 * 纯色覆盖会让棋盘失去格线参考， 叠加 1px 网格线保留了棋盘的网格结构， 玩家在预警期间仍能判断方块位置。
 *
 * ### 为什么分两行？
 *
 * "INCOMING ATTACK" 单行显示字号太小， 分两行可以在保持可读性的同时让文字更大更醒目。
 *
 * @function renderGarbageWarning
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {number} amount - 即将到来的垃圾行数量
 * @returns {void}
 */
const renderGarbageWarning = (canvas, amount) => {
  const { YELLOW, ORANGE, RED } = COLORS;
  const { gameBoardContext: ctx, blockSize, rows, cols } = canvas;

  const boardWidth = cols * blockSize;
  const boardHeight = rows * blockSize;

  // 根据垃圾行数量选择预警颜色
  let color = '';

  switch (amount) {
    case 2: {
      color = YELLOW;
      break;
    }
    case 3: {
      color = ORANGE;
      break;
    }
    case 4: {
      color = RED;
      break;
    }
    default: {
      color = YELLOW;
      break;
    }
  }

  /*
   * ============================================================
   * 步骤 1：半透明背景
   * ============================================================
   */
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, boardWidth, boardHeight);

  /*
   * ============================================================
   * 步骤 2：网格线
   * ============================================================
   */
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // 绘制竖线
  for (let x = 0; x <= cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * blockSize, 0);
    ctx.lineTo(x * blockSize, boardHeight);
    ctx.stroke();
  }

  // 绘制横线
  for (let y = 0; y <= rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * blockSize);
    ctx.lineTo(boardWidth, y * blockSize);
    ctx.stroke();
  }

  // 恢复全局透明度
  ctx.globalAlpha = 1;

  /*
   * ============================================================
   * 步骤 3：居中警告文字（分两行）
   * ============================================================
   */
  const centerX = boardWidth / 2;
  const centerY = boardHeight / 2;

  // 第一行 "INCOMING"（居中偏上）
  renderText(canvas, {
    text: 'INCOMING',
    x: centerX,
    y: centerY - blockSize * 0.6,
    color,
    size: 1.2,
    center: true,
    baseline: 'bottom',
    alpha: 0.9,
  });

  // 第二行 "ATTACK"（居中偏下）
  renderText(canvas, {
    text: 'ATTACK',
    x: centerX,
    y: centerY + blockSize * 0.6,
    color,
    size: 1.2,
    center: true,
    baseline: 'top',
    alpha: 0.9,
  });
};

export default renderGarbageWarning;
