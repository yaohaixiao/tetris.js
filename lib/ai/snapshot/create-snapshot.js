/**
 * # 创建游戏状态快照
 *
 * 从游戏 Store 的当前状态中提取 AI 决策所需的核心数据， 并创建一份**深拷贝**，确保后续操作不会污染原始状态。
 *
 * ## 用途
 *
 * 快照是 AI 决策流程的**输入数据**。它被传递给以下函数：
 *
 * - `selfPlay(snapshot)`：在快照基础上生成候选移动并评分
 * - `generateMoves(snapshot)`：基于快照生成所有可能的移动
 * - `evaluateBoard(move.board, weights, clearResult)`：评估每个候选的结果棋盘
 *
 * ## 为什么需要快照？
 *
 * 1. **数据隔离**：AI 在模拟过程中会大量读写棋盘数据， 使用深拷贝可以确保这些操作不会影响真实游戏状态。
 * 2. **性能优化**：提取 AI 真正需要的字段（棋盘、方块、模式）， 避免克隆整个 Store 中的无关数据（如 highScore、difficulty
 *    等）。
 * 3. **接口稳定**：快照作为一个稳定的数据结构， 让 `generateMoves`、`selfPlay` 等函数不直接依赖 Store 的 API，
 *    便于测试和模块替换。
 *
 * ## 返回结构
 *
 * ```js
 * {
 *   controller: string,     // 控制者身份：'human' | 'ai'
 *   board: string[][],      // 棋盘二维数组（0 为空，非 0 为占用）
 *   bag: object[],          // 7-bag 当前袋子中的剩余方块，供 AI 确定性前瞻
 *   level: number,          // 当前等级
 *   score: number,          // 当前得分
 *   lines: number,          // 已消除行数
 *   combo: number,          // 当前连击次数
 *   backToBack: boolean,    // 是否处于 Back-to-Back 状态
 *   tSpin: object|null,     // T-Spin 检测结果 { isTSpin, isTSpinMini }
 *   cur: object|null,       // 当前活动方块原始对象（含 shape、type、color 等）
 *   next: object|null,      // 下一个预览方块原始对象
 *   piece: {                // AI 决策专用的方块位置信息（从 cur 和 cx/cy 提取）
 *     shape: number[][],    //   方块形状矩阵
 *     position: {           //   方块在棋盘上的位置
 *       x: number,          //     列坐标
 *       y: number,          //     行坐标
 *     },
 *   },
 *   mode: string,           // 游戏当前模式：'playing' | 'paused' 等
 *   hold: object|null,      // Hold 槽中的方块对象
 * }
 * ```
 *
 * ## bag 参数说明
 *
 * `bag` 是当前 Game 实例专属的 7-bag 快照，由 `Game.getBagSnapshot()` 提供。 每个 Game 实例维护独立的
 * `this.bag`，不再使用模块级全局变量。 这确保了 Battle 模式下两个 Game 实例的 bag 不会互相干扰， AI
 * 的前瞻搜索基于正确的方块序列。
 *
 * ## structuredClone 深拷贝
 *
 * 使用 `structuredClone` 对整个快照对象进行深拷贝：
 *
 * - 棋盘二维数组被完全复制，AI 模拟放置不会污染真实棋盘
 * - Bag 数组被完全复制，advanceSnapshot 中的 shift 操作不会影响原始 bag
 * - 方块对象的 shape 矩阵被完全复制，旋转模拟不会影响原始方块
 *
 * @example
 *   const state = game.Store.getState();
 *   const bag = game.getBagSnapshot();
 *   const snapshot = createSnapshot(state, bag);
 *   const bestMove = selfPlay(snapshot);
 *
 * @function createSnapshot
 * @param {object} state - 游戏 Store 的当前状态对象（`Store.getState()` 的返回值）
 * @param {object[]} bag - 当前 Game 实例的 7-bag 方块数据数组
 * @returns {object} 游戏状态的深拷贝快照
 */
const createSnapshot = (state, bag) =>
  structuredClone({
    /*
     * ==================== 控制者身份 ====================
     *
     * 标识当前由谁控制：'human' 或 'ai'。
     * 保留此字段方便后续扩展（如根据控制者调整 AI 策略）。
     */
    controller: state.controller,

    /*
     * ==================== 棋盘状态 ====================
     *
     * 20 行 × 10 列的二维数组。
     * 每个格子的值为 0（空格）或颜色字符串（如 "#00c8ff"）。
     * 这是 AI 决策的核心数据——所有候选移动都在此棋盘上模拟。
     */
    board: state.board,

    /*
     * ==================== 游戏进度 ====================
     *
     * 保留 level、score、lines 供 AI 参考。
     * level 影响下落速度和配色方案，score 和 lines 可用于评估游戏进程。
     */
    level: state.level,
    score: state.score,
    lines: state.lines,

    /*
     * ==================== 计分状态 ====================
     *
     * 这些状态沿前瞻链传递，供 AI 评估 T-Spin / Combo / Back-to-Back。
     * 使用 || 运算符提供默认值，防止 undefined 导致计算错误。
     */
    combo: state.combo || 0,
    backToBack: state.backToBack || false,
    tSpin: state.tSpin || null,

    /*
     * ==================== 原始方块对象 ====================
     *
     * cur：当前正在下落的活动方块，包含 shape、type、color、rotation 等完整信息
     * next：下一个预览方块，用于 Hold 槽为空时作为备选
     *
     * 保留原始对象方便后续扩展（如根据方块类型调整策略）。
     */
    cur: state.curr,
    next: state.next,

    /*
     * ==================== AI 决策专用的方块位置信息 ====================
     *
     * 从 state.curr 和 state.cx/cy 中提取并结构化。
     *
     * piece.shape：当前方块的形状矩阵（如 [[1,1],[1,1]] 表示 O 块）
     * piece.position.x：方块左上角在棋盘上的列坐标（0-9）
     * piece.position.y：方块左上角在棋盘上的行坐标（0 为顶部）
     *
     * 这是 generateMoves 的输入——AI 基于此位置生成所有旋转和平移候选。
     * 如果 curr 为 null（无活动方块），piece 也为 null。
     */
    piece: state.curr
      ? {
          shape: state.curr.shape,
          position: {
            x: state.cx,
            y: state.cy,
          },
        }
      : null,

    /*
     * ==================== 游戏模式 ====================
     *
     * 标识游戏当前所处的阶段：'playing'、'paused'、'game-over' 等。
     * AI 只在 'playing' 模式下进行决策。
     */
    mode: state.mode,

    /*
     * ==================== 7-bag 状态 ====================
     *
     * 当前 Game 实例专属的 7-bag 快照。
     *
     * Battle 模式修复：
     * 之前使用模块级全局变量 `getBagSnapshot()`，导致两个 Game 实例
     * 共享同一个 bag。现在每个 Game 实例维护独立的 `this.bag`，
     * 通过 `Game.getBagSnapshot()` 获取深拷贝快照。
     *
     * 此数组在 advanceSnapshot 中被 shift 消费，用于确定性前瞻——
     * AI 可以精确知道接下来会拿到哪些方块。
     */
    bag,

    /*
     * ==================== Hold 槽状态 ====================
     *
     * 暂存区中的方块对象。null 表示暂存区为空。
     * generateMoves 使用此字段生成 Hold 候选——
     * 如果 hold 有方块，AI 可以评估"换出来是否更好"。
     * 如果 hold 为空，AI 使用 next 作为备选评估"Hold 一下值不值得"。
     */
    hold: state.hold || null,
  });

export default createSnapshot;
