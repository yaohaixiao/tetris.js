import PALETTES from '@/lib/game/constants/color-palettes.js';
import refillBag from '@/lib/game/utils/refill-bag.js';

/**
 * ## 方块袋子
 *
 * 存储当前袋中尚未取出的方块。取空后自动重新填充。
 *
 * @type {object[]}
 */
let bag = [];

/**
 * # 随机生成一个方块（支持 7-bag + 等级配色）
 *
 * 从袋子中取出一个方块，袋子空了自动补充。 根据当前等级从 PALETTES 配色方案表中获取颜色。
 *
 * ## 方块库（SHAPES）
 *
 * 包含 8 种俄罗斯方块（含 I 型加长版）：
 *
 * | 索引 | 类型      | 形状 | colorIndex |
 * | ---- | --------- | ---- | ---------- |
 * | 0    | I（标准） | 1×4  | 0          |
 * | 1    | I（加长） | 1×5  | 1          |
 * | 2    | O         | 2×2  | 2          |
 * | 3    | T         | 2×3  | 3          |
 * | 4    | L         | 2×3  | 4          |
 * | 5    | J         | 2×3  | 5          |
 * | 6    | S         | 2×3  | 6          |
 * | 7    | Z         | 2×3  | 7          |
 *
 * ## 等级配色
 *
 * 每 32 关切换一套配色，共 8 套（256 / 32）。 等级越高配色越暗，模拟 FC 俄罗斯方块调色板切换。
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
 * | rotation   | number     | 初始旋转状态（0）            |
 * | colorIndex | number     | 配色方案中的颜色索引         |
 *
 * ## 为什么深拷贝形状矩阵？
 *
 * 方块的形状矩阵在游戏过程中会被旋转操作修改。 深拷贝确保每次生成的新方块都是独立的， 不会因为共享引用而导致其他方块的形状意外改变。
 *
 * @example
 *   const piece = randomShape(1);
 *   // piece = {
 *   //   shape: [[0, 1, 0], [1, 1, 1]],
 *   //   color: "#f1fa04"
 *   // }
 *
 * @example
 *   const piece = randomShape(200);
 *   // piece = {
 *   //   shape: [[1, 1], [1, 1]],
 *   //   color: "#303030"
 *   // }
 *
 * @function randomShape
 * @param {number} [level=1] - 当前等级（从 1 开始）。默认值为 `1`. Default is `1`
 * @returns {object} 随机选中的方块对象，含 shape、color、type、rotation、colorIndex
 */
const randomShape = (level = 1) => {
  // 袋子空了就补充新袋子
  if (bag.length === 0) {
    bag = refillBag();
  }

  // 从袋子末尾取出一个方块
  const piece = bag.pop();

  // 根据等级取配色方案：每 32 关一套，不越界
  const paletteIndex = Math.min(
    Math.floor((level - 1) / 32),
    PALETTES.length - 1,
  );
  const palette = PALETTES[paletteIndex];

  // 返回随机方块：深拷贝形状矩阵避免共享引用，颜色从配色方案获取
  return {
    shape: piece.shape.map((row) => [...row]),
    color: palette[piece.colorIndex],
    type: piece.type,
    rotation: piece.rotation ?? 0,
    colorIndex: piece.colorIndex,
  };
};

/**
 * ## 获取当前袋子快照
 *
 * 返回当前袋子中剩余方块的浅拷贝，供 AI 快照使用。
 *
 * @returns {object[]} 当前袋子中剩余方块的数组
 */
export const getBagSnapshot = () => [...bag];

export default randomShape;
