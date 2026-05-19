import rotateMatrix from '@/lib/ai/rotate-matrix.js';
import simulateDrop from '@/lib/ai/simulate-drop.js';

/**
 * # 生成所有可能的移动
 *
 * 对当前方块，遍历所有旋转状态和水平位置， 模拟硬降后生成候选棋盘，并为每个候选生成对应的动作序列。
 *
 * ## 算法流程
 *
 * 1. 获取方块的初始形状
 * 2. 对 4 个旋转状态循环： a. 对每个合法的水平位置 x：
 *
 *    - 调用 `simulateDrop` 模拟硬降，得到结果棋盘
 *    - 根据初始位置和旋转次数生成动作序列（ROTATE → MOVE → DROP）
 *    - 将 { board, actions } 加入候选列表 b. 将形状旋转 90° 供下一次迭代使用
 * 3. 返回所有候选移动的数组
 *
 * ## 动作序列格式
 *
 * 动作按执行顺序排列，保证先旋转、再移动、最后硬降：
 *
 *     ['ROTATE', 'ROTATE', 'MOVE_LEFT', 'MOVE_LEFT', 'DROP'];
 *
 * - `ROTATE`：旋转方块的次数（0-3 次）
 * - `MOVE_LEFT` / `MOVE_RIGHT`：水平移动的次数
 * - `DROP`：硬降（每个候选序列都以 DROP 结尾）
 *
 * @example
 *   const board = createEmptyBoard();
 *   const piece = {
 *     shape: [
 *       [0, 1, 0],
 *       [1, 1, 1],
 *     ],
 *     position: { x: 3, y: 0 },
 *   };
 *   const moves = generateMoves({ board, piece });
 *   // moves.length === 32（4 个旋转 × 8 个水平位置）
 *   // moves[0] = { board: [...], actions: ['DROP'] }
 *   // moves[8] = { board: [...], actions: ['ROTATE', 'MOVE_LEFT', 'DROP'] }
 *
 * @function generateMoves
 * @param {object} params - 参数对象
 * @param {number[][]} params.board - 棋盘二维数组，0 为空，非 0 为占用
 * @param {object} params.piece - 当前方块信息
 * @returns {{ board: number[][]; actions: string[] }[]} 候选移动数组
 */
const generateMoves = ({ board, piece }) => {
  // 存储所有候选移动
  const moves = [];

  // 从初始形状开始
  let { shape } = piece;

  // 遍历 4 个旋转状态（0°, 90°, 180°, 270°）
  for (let rotation = 0; rotation < 4; rotation += 1) {
    // 当前形状的宽度
    const width = shape[0].length;

    // 遍历所有合法的水平起始位置：x 的取值范围：0 到 (棋盘宽度 - 形状宽度)
    for (let x = 0; x <= board[0].length - width; x += 1) {
      // 模拟硬降，获取结果棋盘和下落到的 y 坐标
      const result = simulateDrop(board, shape, x);

      // 构建动作序列
      const actions = [];

      // 添加旋转动作（0 到 3 次）
      for (let r = 0; r < rotation; r += 1) {
        actions.push('ROTATE');
      }

      // 计算水平移动的距离和方向
      const delta = x - piece.position.x;

      // 需要向左移动
      if (delta < 0) {
        for (let i = 0; i < Math.abs(delta); i += 1) {
          actions.push('MOVE_LEFT');
        }
      }

      // 需要向右移动
      if (delta > 0) {
        for (let i = 0; i < delta; i += 1) {
          actions.push('MOVE_RIGHT');
        }
      }

      // 最后执行硬降
      actions.push('DROP');

      // 将候选加入列表
      moves.push({
        board: result.board,
        actions,
      });
    }

    // 顺时针旋转 90°，供下一次迭代使用
    shape = rotateMatrix(shape);
  }

  return moves;
};

export default generateMoves;
