import { getBagSnapshot } from '@/lib/game/utils/random-shape.js';

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
 *   board: string[][],      // 棋盘二维数组（颜色字符串格式）
 *   bag: object[],          // 7-bag 当前袋子中的剩余方块
 *   level: number,          // 当前等级
 *   score: number,          // 当前得分
 *   lines: number,          // 已消除行数
 *   combo: number,          // 当前连击次数
 *   backToBack: boolean,    // 是否处于 Back-to-Back 状态
 *   tSpin: object|null,     // T-Spin 检测结果 { isTSpin, isTSpinMini }
 *   cur: object|null,       // 当前活动方块原始对象
 *   next: object|null,      // 下一个预览方块原始对象
 *   piece: {                // AI 需要的方块信息（从 cur 和 cx/cy 提取）
 *     shape: number[][],    //   方块形状矩阵
 *     position: {           //   方块位置
 *       x: number,          //     列坐标
 *       y: number,          //     行坐标
 *     },
 *   },
 *   mode: string,           // 游戏当前模式：'playing' | 'paused' 等
 * }
 * ```
 *
 * @example
 *   const state = game.Store.getState();
 *   const snapshot = createSnapshot(state);
 *   const bestMove = selfPlay(snapshot);
 *
 * @function createSnapshot
 * @param {object} state - 游戏 Store 的当前状态对象（`Store.getState()` 的返回值）
 * @returns {object} 游戏状态的深拷贝快照
 */
const createSnapshot = (state) =>
  structuredClone({
    // 控制者身份
    controller: state.controller,

    // 棋盘状态
    board: state.board,

    // 游戏进度
    level: state.level,
    score: state.score,
    lines: state.lines,

    // 计分状态（供 AI 评估 T-Spin / Combo / Back-to-Back）
    combo: state.combo || 0,
    backToBack: state.backToBack || false,
    tSpin: state.tSpin || null,

    // 原始方块对象（保留完整信息，方便后续扩展）
    cur: state.curr,
    next: state.next,

    // AI 决策专用的方块信息：从 state.curr 和 state.cx/cy 中提取并结构化
    piece: state.curr
      ? {
          shape: state.curr.shape,
          position: {
            x: state.cx,
            y: state.cy,
          },
        }
      : null,

    // 游戏模式
    mode: state.mode,

    // 7-bag 状态（供 AI 确定性前瞻）
    bag: getBagSnapshot(),
    hold: state.hold || null,
  });

export default createSnapshot;
