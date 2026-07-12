import COLORS from '@/lib/constants/colors.js';
import renderBlock from '@/lib/services/ui/block/render-block.js';

/**
 * ============================================================
 *
 * # 渲染垃圾行闪烁
 *
 * ============================================================
 *
 * 垃圾行中非空洞的方块在灰色和白色之间交替闪烁。 使用 renderBlock 保持与游戏方块一致的渲染风格。
 * 由GarbagePushAnimation.render() 每帧调用。
 *
 * ## 视觉表现
 *
 * - 可见帧（visible=true）：垃圾方块绘制为灰色（GRAY）
 * - 隐藏帧（visible=false）：垃圾方块绘制为白色（WHITE）
 * - 空洞位置：值为 0 的格子不绘制，保留棋盘背景
 *
 * ## 坐标计算
 *
 * 垃圾行位于棋盘底部， startRow = totalRows - rows.length：
 *
 * - 棋盘 20 行，垃圾行 3 行 → startRow = 17
 * - 垃圾行占据第 17、18、19 行（0-based）
 *
 * ## 设计考量
 *
 * ### 为什么只闪烁非空洞格子？
 *
 * 垃圾行的空洞（值为 0）是空格， 如果也绘制矩形会覆盖空洞位置。 只闪烁非空洞格子，保留了空洞的可见性。
 *
 * ### 为什么用白色而不是透明？
 *
 * 隐藏帧用白色（WHITE）而非跳过渲染， 是为了产生更强的闪烁视觉对比。 白色与灰色交替，闪烁效果比透明更明显。
 *
 * ## 示例
 *
 * ```javascript
 * // 可见帧：垃圾方块显示为灰色
 * renderGarbagePush(canvas, garbageRows, true);
 *
 * // 隐藏帧：垃圾方块显示为白色
 * renderGarbagePush(canvas, garbageRows, false);
 * ```
 *
 * @function renderGarbagePush
 * @param {object} canvas - Canvas 画布管理器对象
 * @param {number[][]} rows - 垃圾行数据，0=空洞，非0=垃圾方块
 * @param {boolean} visible - True=灰色，false=白色
 * @returns {void}
 */
const renderGarbagePush = (canvas, rows, visible) => {
  // 无垃圾行数据时直接返回
  if (!rows || rows.length === 0) return;

  const { GRAY, WHITE } = COLORS;
  const { rows: totalRows } = canvas;

  // 根据可见状态选择颜色
  const color = visible ? GRAY : WHITE;

  // 计算垃圾行在棋盘上的起始行索引
  const startRow = totalRows - rows.length;

  // 遍历垃圾行并绘制非空洞格子
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      if (rows[r][c] !== 0) {
        renderBlock(canvas, c, startRow + r, color);
      }
    }
  }
};

export default renderGarbagePush;
