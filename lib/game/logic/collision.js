/**
 * ============================================================
 *
 * # 碰撞检测
 *
 * ============================================================
 *
 * 检测当前活动方块在指定偏移位置后，是否与棋盘边界或已有方块发生碰撞。 用于移动、旋转前的合法性预判。
 *
 * ## 检测逻辑
 *
 * 1. 获取当前活动方块的形状矩阵 curr.shape
 * 2. 遍历方块的每个格子（跳过空格子）
 * 3. 计算偏移后的绝对棋盘坐标 (nx, ny)
 * 4. 检查以下碰撞条件：
 *
 *    - 越界：nx 超出左右边界，或 ny 超出底部
 *    - 重叠：ny 在合法范围内且目标位置已有方块
 * 5. 允许方块顶部超出棋盘（ny < 0 不视为越界）
 *
 * ## 调用场景
 *
 * - Move.js：左右移动或软降前检查目标位置
 * - Rotate.js：旋转前检查旋转后的位置是否合法
 * - Tick.js：自动下落前检查下方是否还有空间
 *
 * ## 与 AI 模块 collision 的区别
 *
 * | 函数                    | 所属模块 | 用途                |
 * | :---------------------- | :------- | :------------------ |
 * | game/logic/collision.js | 游戏逻辑 | 运行时碰撞检测      |
 * | ai/collision.js         | AI 模块  | AI 模拟时的碰撞检测 |
 *
 * 两者实现逻辑相同，但参数格式不同： 游戏逻辑层从 Store 读取状态，AI 模块直接接收参数。
 *
 * @function collision
 * @param {object} runtime - 游戏运行时对象
 * @param {number} ox - X 轴偏移量
 * @param {number} oy - Y 轴偏移量
 * @param {object} [shapeOverride] - 墙踢数据
 * @returns {boolean} 发生碰撞返回 true，无碰撞返回 false
 */
const collision = (runtime, ox, oy, shapeOverride) => {
  const { Elements, Store } = runtime;
  const { rows, cols } = Elements.Canvas;
  const state = Store.getState();
  const { curr, cx, cy, board } = state;

  // 无活动方块时无需检测
  if (!curr) {
    return false;
  }

  const s = shapeOverride || curr.shape;

  // 遍历方块格子，跳过空格子
  for (let y = 0; y < s.length; y++) {
    for (let x = 0; x < s[y].length; x++) {
      if (s[y][x]) {
        const nx = cx + x + ox;
        const ny = cy + y + oy;

        // 边界碰撞检测（墙 / 地面）
        const outOfBounds = nx < 0 || nx >= cols || ny >= rows;

        // 方块重叠检测（与已有方块）
        const hitBlock = ny >= 0 && ny < rows && board[ny][nx];

        // 任何条件满足即碰撞
        if (outOfBounds || hitBlock) {
          return true;
        }
      }
    }
  }

  // 所有实心格子都合法，无碰撞
  return false;
};

export default collision;
