import PALETTES from '@/lib/game/constants/color-palettes.js';
import refillBag from '@/lib/game/utils/refill-bag.js';

/**
 * # 随机生成一个方块（7-bag + 等级配色）
 *
 * 从袋子中取出一个方块，袋子空了自动补充。 根据当前等级从 PALETTES 配色方案表中获取对应颜色。
 *
 * ## 7-bag 机制
 *
 * 每 7 个方块为一个袋子，包含所有 7 种标准方块各一个（不含 I5 加长版）， 取空后自动生成新袋子。此机制保证不会出现连续多个同类型方块的极端情况。
 *
 * ## 方块库（SHAPES）
 *
 * 包含 8 种俄罗斯方块：
 *
 * | 索引 | 类型 | 形状     | colorIndex |
 * | ---- | ---- | -------- | ---------- |
 * | 0    | I    | 1×4 标准 | 0          |
 * | 1    | I5   | 1×5 加长 | 1          |
 * | 2    | O    | 2×2      | 2          |
 * | 3    | T    | 2×3      | 3          |
 * | 4    | L    | 2×3      | 4          |
 * | 5    | J    | 2×3      | 5          |
 * | 6    | S    | 2×3      | 6          |
 * | 7    | Z    | 2×3      | 7          |
 *
 * ## 等级配色
 *
 * 每 32 关切换一套配色，共 8 套（覆盖 256 关）。 通过 `Math.floor((level - 1) / 32)` 计算配色方案索引。
 *
 * ## 返回值
 *
 * 返回的方块对象包含：
 *
 * | 属性       | 类型       | 说明                         |
 * | ---------- | ---------- | ---------------------------- |
 * | shape      | number[][] | 深拷贝的形状矩阵             |
 * | color      | string     | 根据等级从 PALETTES 取的颜色 |
 * | type       | string     | 方块类型标识（'I', 'T' 等）  |
 * | rotation   | number     | 初始旋转状态（默认 0）       |
 * | colorIndex | number     | 配色方案中的颜色索引         |
 *
 * ## 为什么深拷贝形状矩阵？
 *
 * 方块的形状矩阵在游戏过程中会被旋转操作修改。 深拷贝确保每次生成的新方块都是独立的， 不会因为共享引用而导致其他方块的形状意外改变。
 *
 * @function randomShape
 * @param {object} runtime - 游戏运行时对象
 * @param {number} [level=1] - 当前等级（从 1 开始）. Default is `1`
 * @returns {object} 随机选中的方块对象，含 shape、color、type、rotation、colorIndex
 */
const randomShape = (runtime, level = 1) => {
  /*
   * ==================== 补充袋子 ====================
   *
   * 袋子为空时自动调用 refillBag 生成新袋子（7-bag 机制）
   */
  if (runtime.bag.length === 0) {
    runtime.updateBag(refillBag());
  }

  /*
   * ==================== 从袋子中取方块 ====================
   *
   * 使用 pop 从末尾取出，配合 refillBag 的随机顺序实现随机抽取
   */
  const piece = runtime.bag.pop();

  /*
   * ==================== 计算配色方案索引 ====================
   *
   * 每 32 关一套配色，Math.min 防止越界
   */
  const paletteIndex = Math.min(
    Math.floor((level - 1) / 32),
    PALETTES.length - 1,
  );
  const palette = PALETTES[paletteIndex];

  /*
   * ==================== 构建并返回方块对象 ====================
   *
   * - shape：深拷贝矩阵，避免多个方块共享同一引用
   * - color：从当前等级的配色方案中按 colorIndex 取色
   * - rotation：默认 0（原始朝向）
   */
  return {
    shape: piece.shape.map((row) => [...row]),
    color: palette[piece.colorIndex],
    type: piece.type,
    rotation: piece.rotation ?? 0,
    colorIndex: piece.colorIndex,
  };
};

export default randomShape;
