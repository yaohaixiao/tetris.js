import rotateMatrix from '@/lib/ai/simulator/rotate-matrix.js';
import simulateDrop from '@/lib/ai/simulator/simulate-drop.js';

/**
 * ## 获取所有合法的水平位置
 *
 * 计算形状在棋盘上所有可以放置的 X 坐标范围。
 *
 * @param {number[][]} board - 游戏棋盘
 * @param {number[][]} shape - 方块形状矩阵
 * @returns {number[]} 所有合法的 X 坐标数组
 */
const getValidXPositions = (board, shape) => {
  const boardWidth = board[0].length;
  const shapeWidth = shape[0].length;
  const maxX = boardWidth - shapeWidth;
  const positions = [];

  for (let x = 0; x <= maxX; x++) {
    positions.push(x);
  }

  return positions;
};

/**
 * ## 添加旋转动作
 *
 * @param {string[]} actions - 动作数组（会被修改）
 * @param {number} count - 旋转次数
 */
const addRotateActions = (actions, count) => {
  for (let i = 0; i < count; i++) {
    actions.push('ROTATE');
  }
};

/**
 * ## 添加水平移动动作
 *
 * 根据位移距离的正负决定向左还是向右移动。
 *
 * @param {string[]} actions - 动作数组（会被修改）
 * @param {number} delta - 位移量（正数向右，负数向左）
 */
const addMoveActions = (actions, delta) => {
  if (delta === 0) return;

  const moveDirection = delta > 0 ? 'MOVE_RIGHT' : 'MOVE_LEFT';
  const moveCount = Math.abs(delta);

  for (let i = 0; i < moveCount; i++) {
    actions.push(moveDirection);
  }
};

/**
 * ## 构建动作序列
 *
 * 按照执行顺序生成动作数组：先旋转，再移动，最后硬降。
 *
 * @param {object} params - 参数对象
 * @param {number} params.rotationCount - 需要旋转的次数（0-3）
 * @param {number} params.targetX - 目标 X 坐标
 * @param {number} params.originalX - 原始 X 坐标
 * @returns {string[]} 动作序列数组
 */
const buildActionSequence = ({ rotationCount, targetX, originalX }) => {
  const actions = [];

  // 1. 添加旋转动作
  addRotateActions(actions, rotationCount);

  // 2. 添加水平移动动作
  addMoveActions(actions, targetX - originalX);

  // 3. 添加硬降动作
  actions.push('DROP');

  return actions;
};

/**
 * ## 创建单个候选移动
 *
 * 对给定的旋转状态和水平位置，模拟硬降并生成动作序列。
 *
 * @param {object} params - 参数对象
 * @param {number[][]} params.board - 游戏棋盘
 * @param {number[][]} params.currentShape - 当前旋转后的形状
 * @param {number} params.targetX - 目标水平位置
 * @param {object} params.originalPiece - 原始方块对象
 * @param {number} params.rotationCount - 旋转次数（0-3）
 * @returns {{ board: number[][]; actions: string[] }} 候选移动对象
 */
const createCandidate = ({
  board,
  currentShape,
  targetX,
  originalPiece,
  rotationCount,
}) => {
  // 模拟硬降，获取结果棋盘
  const result = simulateDrop(board, currentShape, targetX);

  // 生成动作序列
  const actions = buildActionSequence({
    rotationCount,
    targetX,
    originalX: originalPiece.position.x,
  });

  return {
    board: result.board,
    actions,
  };
};

/**
 * # 生成所有可能的移动
 *
 * 对当前方块，遍历所有旋转状态和水平位置，模拟硬降后生成候选棋盘， 并为每个候选生成对应的动作序列。
 *
 * @function generateMoves
 * @param {object} snapshot - 游戏当前状态信息的快照
 * @returns {{ board: number[][]; actions: string[] }[]} 候选移动数组
 */
const generateMoves = (snapshot) => {
  const { board, piece } = snapshot;
  const moves = [];

  // 从初始形状开始
  let currentShape = piece.shape;

  // 遍历 4 个旋转状态（0°, 90°, 180°, 270°）
  for (let rotation = 0; rotation < 4; rotation++) {
    const validXPositions = getValidXPositions(board, currentShape);

    for (const targetX of validXPositions) {
      const candidate = createCandidate({
        board,
        currentShape,
        targetX,
        originalPiece: piece,
        rotationCount: rotation,
      });
      moves.push(candidate);
    }

    currentShape = rotateMatrix(currentShape);
  }

  return moves;
};

export default generateMoves;
