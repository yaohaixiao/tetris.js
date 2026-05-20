import randomShape from '@/lib/game/utils/random-shape.js';
import simulatePlacement from '@/lib/ai/simulator/simulate-placement.js';
import clearFullLines from '@/lib/ai/utils/clear-full-lines.js';

/**
 * # 推进快照（Advance Snapshot）
 *
 * 在 AI 前瞻搜索中，模拟"执行一个移动后游戏进入的下一个状态"。 这是 lookahead（多步前瞻）的核心衔接函数。
 *
 * ## 处理流程
 *
 * | 步骤 | 操作                | 说明                           |
 * | ---- | ------------------- | ------------------------------ |
 * | 1    | `simulatePlacement` | 将当前方块放置到棋盘指定位置   |
 * | 2    | `clearFullLines`    | 清除棋盘中的满行               |
 * | 3    | `randomShape`       | 随机生成下一个活动方块         |
 * | 4    | 构建新快照          | 合并清理后的棋盘、新方块等信息 |
 *
 * ## 设计考量
 *
 * ### 为什么新方块是随机生成的？
 *
 * 在真实游戏中，玩家无法预知下一个方块是什么。 为了模拟这种不确定性，AI 在每次前瞻时**随机生成** 一个方块作为"假设的下一个方块"。这样评估出的结果
 * 是对各种可能性的综合预判，而非依赖某种特定方块顺序。
 *
 * ### 为什么新方块的 X 坐标是居中计算的？
 *
 * 真实游戏中，新方块总是在棋盘顶部居中生成（`spawn` 逻辑）。 这里模拟同样的行为：`cols/2 - shapeWidth/2`。
 * 注意：`cols` 当前硬编码为 `10`，后续可改为从 `snapshot.board[0].length` 读取， 以支持不同宽度的棋盘。
 *
 * ### 与真实 spawn 的区别
 *
 * | 函数              | 所属模块   | 职责                                             |
 * | ----------------- | ---------- | ------------------------------------------------ |
 * | `spawn`           | 游戏运行时 | 生成方块 + 碰撞检测 + 游戏结束判断 + 渲染 + 录制 |
 * | `advanceSnapshot` | AI 模拟器  | 纯数据结构推进，无副作用，不检测游戏结束         |
 *
 * ## 不可变性
 *
 * 函数通过扩展运算符 `{ ...snapshot }` 创建新对象， 不会修改传入的原始 `snapshot`。 `simulatePlacement`
 * 和 `clearFullLines` 也都返回新棋盘， 确保整个前瞻链路上的状态完全隔离。
 *
 * @example
 *   const snapshot = createSnapshot(state);
 *   const moves = generateMoves(snapshot);
 *   const nextSnapshot = advanceSnapshot(snapshot, moves[0]);
 *   // nextSnapshot 包含新的 board、新的 piece、新的 cur/next
 *
 * @function advanceSnapshot
 * @param {object} snapshot - 当前游戏状态快照（由 `createSnapshot` 创建）
 * @param {object} move - 要执行的移动（由 `simulateDrop` 返回）
 * @param {number} move.y - 方块下落后所在的 Y 坐标
 * @returns {object} 执行移动后的新快照
 */
const advanceSnapshot = (snapshot, move) => {
  // 1. 将当前方块放置到棋盘上（在深拷贝的棋盘上操作）
  const board = simulatePlacement(
    snapshot.board,
    snapshot.piece.shape,
    snapshot.piece.position.x,
    move.y, // simulateDrop 返回的最终 Y 坐标
  );

  // 2. 清除满行（模拟消行，纯数据结构操作，无动画）
  const clearedBoard = clearFullLines(board);

  // 3. 随机生成下一个活动方块
  const nextPiece = randomShape();

  /*
   * ========== 构建新方块的 piece 信息 ==========
   * X 坐标居中：棋盘宽度的一半减去方块宽度的一半
   * 注意：此处 cols=10 为硬编码，与 Configuration 中的配置一致
   */
  const newPiece = {
    shape: nextPiece.shape,
    position: {
      x: Math.floor(10 / 2) - Math.floor(nextPiece.shape[0].length / 2),
      y: 0, // 从顶部开始
    },
  };

  // 4. 构建并返回推进后的新快照
  return {
    ...snapshot, // 保留原始快照中的其他字段
    board: clearedBoard, // 更新为清理后的棋盘
    piece: newPiece, // 新活动方块
    cur: nextPiece, // 新活动方块的原始对象
    next: randomShape(), // 再随机生成下一个预览方块
  };
};

export default advanceSnapshot;
