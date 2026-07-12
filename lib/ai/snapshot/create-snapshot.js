/**
 * ============================================================
 *
 * # 创建游戏状态快照
 *
 * ============================================================
 *
 * 从游戏 Store 的当前状态中提取 AI 决策所需的核心数据， 并创建一份深拷贝，确保后续操作不会污染原始状态。
 *
 * ## 用途
 *
 * 快照是 AI 决策流程的输入数据，被传递给 selfPlay、 generateMoves、evaluateBoard 等函数。
 *
 * ## 为什么需要快照？
 *
 * 1. 数据隔离：AI 在模拟过程中大量读写棋盘数据， 深拷贝确保这些操作不会影响真实游戏状态
 * 2. 性能优化：只提取 AI 真正需要的字段， 避免克隆整个 Store 中的无关数据
 * 3. 接口稳定：快照作为稳定的数据结构， 让下游函数不直接依赖 Store 的 API
 *
 * ## 返回结构
 *
 * - Controller：控制者身份（'human' | 'ai'）
 * - Board：棋盘二维数组
 * - Bag：7-bag 当前袋子中的剩余方块
 * - Level / score / lines：当前等级/分数/已消除行数
 * - Combo / backToBack / tSpin：计分状态
 * - Cur / next：当前方块和预览方块原始对象
 * - Piece：AI 决策专用的方块位置信息
 * - Mode：游戏当前模式
 * - Hold：Hold 槽中的方块对象
 *
 * ## bag 参数说明
 *
 * Bag 是当前 Game 实例专属的 7-bag 快照， 由 Game.getBagSnapshot() 提供。 每个 Game 实例维护独立的
 * this.bag， Battle 模式下两个 Game 实例的 bag 完全隔离。
 *
 * ## structuredClone 深拷贝
 *
 * 使用 structuredClone 对整个快照对象进行深拷贝：
 *
 * - 棋盘二维数组被完全复制
 * - Bag 数组被完全复制
 * - 方块对象的 shape 矩阵被完全复制
 *
 * @function createSnapshot
 * @param {object} state - 游戏 Store 的当前状态对象
 * @param {object[]} bag - 当前 Game 实例的 7-bag 方块数据数组
 * @returns {object} 游戏状态的深拷贝快照
 */
const createSnapshot = (state, bag) =>
  structuredClone({
    controller: state.controller,
    board: state.board,
    level: state.level,
    score: state.score,
    lines: state.lines,
    combo: state.combo || 0,
    backToBack: state.backToBack || false,
    tSpin: state.tSpin || null,
    cur: state.curr,
    next: state.next,
    piece: state.curr
      ? {
          shape: state.curr.shape,
          position: {
            x: state.cx,
            y: state.cy,
          },
        }
      : null,
    mode: state.mode,
    bag,
    hold: state.hold || null,
  });

export default createSnapshot;
