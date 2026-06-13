import COLORS from '@/lib/constants/colors.js';
import renderText from '@/lib/services/ui/text/render-text.js';

/**
 * # 渲染垃圾行预警（Garbage Warning Renderer）
 *
 * 在棋盘上绘制橙色网格覆盖 + 居中警告文字，提示即将受到垃圾行攻击。 由 `GarbageWarningAnimation.render()` 每帧调用。
 *
 * ## 视觉表现
 *
 * - **背景层**：半透明橙色覆盖整个棋盘（透明度 0.15）
 * - **网格层**：1px 橙色网格线覆盖（透明度 0.4），保留棋盘格感
 * - **文字层**：棋盘居中分两行显示 "INCOMING" / "ATTACK"
 * - **闪烁节奏**：每 100ms 切换一次（显/隐），共 5 次（500ms），由 GarbageWarningAnimation 控制
 *
 * ## 渲染层次
 *
 *     1. 半透明橙色背景（globalAlpha=0.15）
 *     2. 橙色网格线（globalAlpha=0.4, lineWidth=1）
 *     3. "INCOMING" 文字（居中偏上，baseline='bottom'）
 *     4. "ATTACK" 文字（居中偏下，baseline='top'）
 *
 * ## 文字布局
 *
 *     ┌──────────────────────────┐
 *     │                          │
 *     │        INCOMING          │  ← centerY - blockSize×0.6, baseline='bottom'
 *     │        ATTACK            │  ← centerY + blockSize×0.6, baseline='top'
 *     │                          │
 *     └──────────────────────────┘
 *
 * 两行文字间距为 `blockSize × 1.2`，字号为 `fontSize × 1.2`。
 *
 * ## 设计考量
 *
 * ### 为什么用橙色？
 *
 * 橙色在色彩心理学中代表"警告/注意"，与红色相比侵略性更弱， 适合作为"即将受到攻击"的预警提示。半透明叠加不会完全遮挡棋盘， 玩家仍能看到当前游戏状态。
 *
 * ### 为什么保留网格线？
 *
 * 纯色半透明覆盖会让棋盘失去立体感和格线参考， 叠加 1px 网格线保留了棋盘的网格结构， 玩家在预警期间仍能判断方块位置。
 *
 * ### 为什么分两行？
 *
 * "INCOMING ATTACK" 在棋盘宽度内单行显示字号会太小， 分两行可以在保持可读性的同时让文字更大更醒目。
 *
 * @example
 *   // GarbageWarningAnimation 每帧调用
 *   // 可见帧：绘制完整的预警覆盖
 *   renderGarbageWarning(canvas);
 *
 *   // 隐藏帧：GarbageWarningAnimation 不调用 render()，
 *   // 所以预警效果消失，实现闪烁
 *
 * @function renderGarbageWarning
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext - 棋盘 Canvas 2D 上下文
 * @param {number} canvas.blockSize - 每格像素尺寸（用于计算文字间距和网格线位置）
 * @param {number} canvas.rows - 棋盘总行数（20）
 * @param {number} canvas.cols - 棋盘总列数（10）
 * @param {number} canvas.fontSize - 基础字体大小（传递给 renderText）
 * @returns {void}
 */
const renderGarbageWarning = (canvas) => {
  // 从颜色常量中获取橙色
  const { ORANGE } = COLORS;

  // 解构 Canvas 渲染所需的核心参数
  const { gameBoardContext: ctx, blockSize, rows, cols } = canvas;

  /**
   * 计算棋盘像素尺寸：
   *
   * - BoardWidth = 列数 × 每格像素（如 10 × 30 = 300px）
   * - BoardHeight = 行数 × 每格像素（如 20 × 30 = 600px）
   */
  const boardWidth = cols * blockSize;
  const boardHeight = rows * blockSize;

  // ======== 步骤 1：半透明橙色背景 ========

  /**
   * 绘制覆盖整个棋盘的半透明橙色背景：
   *
   * - GlobalAlpha = 0.15：仅 15% 不透明度，能看清棋盘内容
   * - FillStyle = ORANGE：橙色填充
   * - FillRect：覆盖整个棋盘区域
   */
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, 0, boardWidth, boardHeight);

  // ======== 步骤 2：1px 橙色网格线 ========

  /**
   * 在背景上叠加橙色网格线：
   *
   * - GlobalAlpha = 0.4：网格线比背景更明显
   * - StrokeStyle = ORANGE：橙色线条
   * - LineWidth = 1：1px 细线
   *
   * 先绘制所有竖线，再绘制所有横线。 循环从 0 到 cols/rows（包含），确保最右侧和最底部的边线也绘制。
   */

  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = ORANGE;
  ctx.lineWidth = 1;

  // 绘制竖线（列分隔线）
  for (let x = 0; x <= cols; x++) {
    ctx.beginPath();
    // 从顶部 (x × blockSize, 0) 画到底部 (x × blockSize, boardHeight)
    ctx.moveTo(x * blockSize, 0);
    ctx.lineTo(x * blockSize, boardHeight);
    ctx.stroke();
  }

  // 绘制横线（行分隔线）
  for (let y = 0; y <= rows; y++) {
    ctx.beginPath();
    // 从左边缘 (0, y × blockSize) 画到右边缘 (boardWidth, y × blockSize)
    ctx.moveTo(0, y * blockSize);
    ctx.lineTo(boardWidth, y * blockSize);
    ctx.stroke();
  }

  /** 恢复全局透明度为 1： 避免后续绘制（特别是 renderText）受到前面设置的 globalAlpha 影响。 */
  ctx.globalAlpha = 1;

  // ======== 步骤 3：居中警告文字（分两行） ========

  /**
   * 计算文字居中位置：
   *
   * - CenterX = 棋盘宽度 / 2（水平居中）
   * - CenterY = 棋盘高度 / 2（垂直居中）
   */
  const centerX = boardWidth / 2;
  const centerY = boardHeight / 2;

  /**
   * 绘制第一行文字 "INCOMING"：
   *
   * - 位置：居中偏上（centerY - blockSize × 0.6）
   * - Baseline = 'bottom'：以文字底部为基准对齐
   * - Size = 1.2：字体放大 1.2 倍
   * - Alpha = 0.9：90% 不透明度
   */
  renderText(canvas, {
    text: 'INCOMING',
    x: centerX,
    y: centerY - blockSize * 0.6,
    color: ORANGE,
    size: 1.2,
    center: true,
    baseline: 'bottom',
    alpha: 0.9,
  });

  /**
   * 绘制第二行文字 "ATTACK"：
   *
   * - 位置：居中偏下（centerY + blockSize × 0.6）
   * - Baseline = 'top'：以文字顶部为基准对齐
   * - 其他参数与第一行一致
   */
  renderText(canvas, {
    text: 'ATTACK',
    x: centerX,
    y: centerY + blockSize * 0.6,
    color: ORANGE,
    size: 1.2,
    center: true,
    baseline: 'top',
    alpha: 0.9,
  });
};

export default renderGarbageWarning;
