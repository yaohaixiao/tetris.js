import generateForPiece from '@/lib/ai/planner/generate-for-piece.js';

/**
 * # 生成所有可能的移动（含 Hold 决策支持）
 *
 * 对当前方块和 Hold 方块（如果有），遍历所有旋转状态和水平位置， 模拟硬降后生成候选棋盘，并为每个候选生成对应的动作序列。
 *
 * ## Hold 决策
 *
 * 同时生成当前方块和 Hold 方块的候选移动，让 AI 在评分时自然比较两者的优劣。 如果 Hold 方块的落点评分更高，AI 就会选择执行 Hold
 * 操作。
 *
 * **Hold 为空时**：使用 `snapshot.next`（下一个预览块）作为"Hold 后会得到的方块"生成候选。 这让 AI 在 Hold
 * 槽为空时也能评估"Hold 一下把 next 换出来值不值得"。
 *
 * ## 候选结构
 *
 * 每个候选移动包含：
 *
 * - `board` — 硬降后、消行前的棋盘状态
 * - `actions` — 动作序列数组，如 `['ROTATE', 'MOVE_LEFT', 'DROP']`
 * - Hold 候选的 `actions` 第一项为 `'HOLD'`
 *
 * @param {object} snapshot - 游戏当前状态信息的快照
 * @param {number[][]} snapshot.board - 棋盘二维数组（0 表示空格，其他值表示已占用）
 * @param {object} snapshot.piece - 当前活动方块对象
 * @param {number[][]} snapshot.piece.shape - 方块的形状矩阵
 * @param {object} snapshot.piece.position - 方块的当前位置
 * @param {number} snapshot.piece.position.x - 方块的当前 X 坐标
 * @param {number} snapshot.piece.position.y - 方块的当前 Y 坐标
 * @param {object} [snapshot.hold] - Hold 缓存方块对象，结构与 piece 相同。为空时表示 Hold 槽为空
 * @param {number[][]} snapshot.hold.shape - Hold 方块的形状矩阵
 * @param {object} [snapshot.next] - 下一个预览方块对象。仅在 Hold 为空时用作备选方块
 * @param {number[][]} snapshot.next.shape - 预览方块的形状矩阵
 * @returns {{ board: number[][]; actions: string[] }[]} 候选移动数组，每个元素包含模拟棋盘和动作序列
 */
const generateMoves = (snapshot) => {
  /*
   * ==================== 解构快照数据 ====================
   *
   * 从 snapshot 中提取棋盘、当前方块、Hold 方块和预览方块
   */
  const { board, piece, hold, next } = snapshot;

  /*
   * ==================== 生成当前方块的候选移动 ====================
   *
   * 遍历当前方块的 4 个旋转状态 × 所有合法水平位置，
   * isHold 传 false，表示不追加 HOLD 指令
   */
  const moves = generateForPiece(board, piece, false);

  /*
   * ==================== 确定 Hold 方块来源 ====================
   *
   * 优先使用 hold 槽中的方块。
   * 如果 hold 为空，则使用 next（下一个预览块）作为"Hold 后会得到的方块"。
   * 这让 AI 在 Hold 槽为空时也能评估"Hold 一下把 next 换出来值不值得"。
   */
  const holdPieceSource = hold || next;

  /*
   * ==================== 生成 Hold 方块的候选移动 ====================
   *
   * 如果存在可用的 Hold 方块来源，构建其 piece 数据并生成候选。
   * isHold 传 true，会在动作序列前自动追加 'HOLD' 指令。
   */
  if (holdPieceSource) {
    /*
     * ==================== 构建 Hold 方块数据 ====================
     *
     * 将 Hold 方块居中放置在棋盘顶部：
     * X 坐标 = 棋盘宽度的一半 - 方块宽度的一半
     * Y 坐标 = 0（从顶部开始）
     */
    const holdPiece = {
      shape: holdPieceSource.shape,
      position: {
        x:
          Math.floor(board[0].length / 2) -
          Math.floor(holdPieceSource.shape[0].length / 2),
        y: 0,
      },
    };

    /*
     * ==================== 合并 Hold 候选到移动列表 ====================
     *
     * 使用展开运算符将 Hold 方块的候选追加到 moves 数组末尾，
     * isHold=true 确保每个候选的 actions 以 'HOLD' 开头
     */
    moves.push(...generateForPiece(board, holdPiece, true));
  }

  return moves;
};

export default generateMoves;
