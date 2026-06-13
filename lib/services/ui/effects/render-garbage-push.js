import COLORS from '@/lib/constants/colors.js';
import renderBlock from '@/lib/services/ui/block/render-block.js';

/**
 * # 渲染垃圾行闪烁（Garbage Push Renderer）
 *
 * 垃圾行中非空洞的方块在灰色和白色之间交替闪烁。 使用 `renderBlock` 保持与游戏方块一致的渲染风格（经典/毛玻璃/光泽等）。 由
 * `GarbagePushAnimation.render()` 每帧调用。
 *
 * ## 视觉表现
 *
 * - **可见帧（visible=true）**：垃圾方块绘制为灰色（GRAY）
 * - **隐藏帧（visible=false）**：垃圾方块绘制为白色（WHITE）
 * - **空洞位置**：值为 0 的格子不绘制（保留棋盘背景）
 * - **闪烁节奏**：每 100ms 切换一次，共 5 次（500ms），由 GarbagePushAnimation 控制
 *
 * ## 坐标计算
 *
 * 垃圾行位于棋盘底部，通过 `startRow = totalRows - rows.length` 计算起始行：
 *
 *     棋盘 20 行，垃圾行 3 行：
 *       startRow = 20 - 3 = 17
 *       垃圾行占据第 17、18、19 行（0-based）
 *
 * ## 与 renderBlock 的关系
 *
 * 委托给 `renderBlock(canvas, x, y, color)` 处理实际绘制， 确保垃圾方块的渲染风格与游戏方块完全一致。
 * renderBlock 内部会根据 `canvas.style` 路由到对应的风格渲染函数。
 *
 * ## 设计考量
 *
 * ### 为什么只闪烁非空洞格子？
 *
 * 垃圾行的空洞（值为 0）是空格，如果也绘制灰色/白色矩形， 会覆盖空洞位置，视觉上垃圾行变成了完整的实心行。 只闪烁非空洞格子，保留了空洞的可见性。
 *
 * ### 为什么用白色而不是透明？
 *
 * 隐藏帧用白色（WHITE）而非跳过渲染，是为了产生"闪烁"的视觉对比。 如果隐藏帧完全不绘制，动画会变成"灰色→棋盘背景"，
 * 对比度不够明显。白色与灰色交替，闪烁效果更强。
 *
 * @example
 *   // 垃圾行数据示例（3 行，宽度 10，难度 normal=2 空洞）
 *   const garbageRows = [
 *     [1, 1, 0, 1, 1, 1, 1, 0, 1, 1], // 第 18 行（2 个空洞在列 2 和列 7）
 *     [1, 1, 1, 0, 1, 1, 1, 1, 1, 0], // 第 19 行（2 个空洞在列 3 和列 9）
 *     [0, 1, 1, 1, 1, 0, 1, 1, 1, 1], // 第 20 行（2 个空洞在列 0 和列 5）
 *   ];
 *
 *   // 可见帧：垃圾方块显示为灰色
 *   renderGarbagePush(canvas, garbageRows, true);
 *
 *   // 隐藏帧：垃圾方块显示为白色
 *   renderGarbagePush(canvas, garbageRows, false);
 *
 * @function renderGarbagePush
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {CanvasRenderingContext2D} canvas.gameBoardContext - 棋盘 Canvas 2D 上下文
 * @param {number} canvas.blockSize - 每格像素尺寸
 * @param {number} canvas.rows - 棋盘总行数（20）
 * @param {number} canvas.cols - 棋盘总列数（10）
 * @param {string} [canvas.style] - 方块渲染风格（传递给 renderBlock）
 * @param {number[][]} rows - 垃圾行数据，二维数组
 *
 *   - 外层数组：每一行（从棋盘顶部到底部顺序）
 *   - 内层数组：每行的格子值
 *   - `0` = 空洞（空格，不绘制）
 *   - 非 `0` = 垃圾方块（需要闪烁）
 *
 * @param {boolean} visible - 当前帧是否可见
 *
 *   - `true` = 绘制灰色（GRAY）
 *   - `false` = 绘制白色（WHITE）
 *
 * @returns {void}
 */
const renderGarbagePush = (canvas, rows, visible) => {
  // 无垃圾行数据时直接返回
  if (!rows || rows.length === 0) return;

  // 从颜色常量中获取灰色和白色
  const { GRAY, WHITE } = COLORS;

  // 获取棋盘总行数（用于计算垃圾行的起始行）
  const { rows: totalRows } = canvas;

  /**
   * 根据可见状态选择颜色：
   *
   * - Visible=true → GRAY（灰色，正常显示）
   * - Visible=false → WHITE（白色，闪烁隐藏）
   */
  const color = visible ? GRAY : WHITE;

  /**
   * 计算垃圾行在棋盘上的起始行索引
   *
   * 垃圾行位于棋盘底部，例如：
   *
   * - 棋盘 20 行，垃圾行 3 行 → startRow = 20 - 3 = 17
   * - 第 17、18、19 行是垃圾行
   */
  const startRow = totalRows - rows.length;

  // 遍历每一行垃圾行
  for (let r = 0; r < rows.length; r++) {
    // 遍历该行的每一列
    for (let c = 0; c < rows[r].length; c++) {
      /**
       * 只绘制非空洞格子：
       *
       * - Rows[r][c] !== 0：该位置是垃圾方块，需要绘制
       * - Rows[r][c] === 0：该位置是空洞，跳过（保留棋盘背景）
       */
      if (rows[r][c] !== 0) {
        /**
         * 委托给 renderBlock 绘制单个方块：
         *
         * - C：列索引（X 坐标）
         * - StartRow + r：行索引（Y 坐标）= 棋盘底部偏移 + 垃圾行内偏移
         * - Color：当前颜色（GRAY 或 WHITE）
         *
         * RenderBlock 会根据 canvas.style 使用对应的渲染风格。
         */
        renderBlock(canvas, c, startRow + r, color);
      }
    }
  }
};

export default renderGarbagePush;
