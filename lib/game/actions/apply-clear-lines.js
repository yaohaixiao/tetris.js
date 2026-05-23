import GAME from '@/lib/game/constants/game.js';

/**
 * # 应用消除行
 *
 * 检测并消除棋盘中的满行，更新分数、行数和等级。
 *
 * ## 处理流程
 *
 * 1. **消行逻辑** — 深拷贝棋盘，从底部向上扫描满行，移除后在顶部补空行
 * 2. **状态计算** — 根据消除行数计算新的分数、累计行数和等级
 * 3. **返回更新数据** — 返回 `stateHandler` 和元数据供调用方统一更新
 *
 * ## 计分规则
 *
 * 实际得分 = 固定分 × 新等级。升级当次消除按升级后的等级计分。
 *
 * | 消除行数    | 固定分 | 计分公式        | 1 级实际 | 50 级实际 | 100 级实际 |
 * | ----------- | ------ | --------------- | -------- | --------- | ---------- |
 * | 1           | 100    | 100 × newLevel  | 100      | 5,000     | 10,000     |
 * | 2           | 300    | 300 × newLevel  | 300      | 15,000    | 30,000     |
 * | 3           | 500    | 500 × newLevel  | 500      | 25,000    | 50,000     |
 * | 4（Tetris） | 800    | 800 × newLevel  | 800      | 40,000    | 80,000     |
 * | 5           | 1200   | 1200 × newLevel | 1,200    | 60,000    | 120,000    |
 *
 * ## 等级计算
 *
 * 使用动态升级步长 `levelUpSteps`：
 *
 * - 初始 10 行升一级
 * - 每次升级后步长 +5（10 → 15 → 20 → ...）
 * - 步长封顶 90 行
 * - 等级上限 `MAX_LEVEL`（256），达到后 `isMaxOut = true`
 *
 * | 等级 | levelUpSteps | 累计需行数 |
 * | ---- | ------------ | ---------- |
 * | 1    | 10           | 10         |
 * | 2    | 15           | 25         |
 * | 3    | 20           | 45         |
 * | ...  | ...          | ...        |
 * | 17   | 90（封顶）   | 850        |
 * | 18+  | 90           | 每 90 行   |
 *
 * ## 消行算法
 *
 * 从底部向上遍历，通过 `board[y].every(Boolean)` 判断满行。 满行被移除后上方行整体下移，顶部补空行。 `y++` 抵消循环的
 * `y--`，确保不跳过因下移进入当前位置的新行。
 *
 * @function applyClearLines
 * @param {object} runtime - 游戏运行时对象
 * @param {object} runtime.Elements - 棋盘元素配置
 * @param {object} runtime.Elements.Main - 主棋盘配置
 * @param {number} runtime.Elements.Main.rows - 行数（20）
 * @param {number} runtime.Elements.Main.cols - 列数（10）
 * @param {object} runtime.Store - 游戏状态存储
 * @returns {object} 消行后的更新数据
 */
const applyClearLines = (runtime) => {
  const { MAX_LEVEL } = GAME;
  const { Elements, Store } = runtime;
  const state = Store.getState();
  const { rows, cols } = Elements.Main;
  const { CLEAR_LINE_SCORES } = GAME;
  const lines = state.clearLines || [];
  const cleared = lines.length;

  /**
   * ======== 1. 消行逻辑 ========
   *
   * 深拷贝当前棋盘，从底部向上扫描满行并移除， 在顶部补充空行。直接操作 board 结构， 属于"结构型数据修改"，不在循环中通过 setState
   * 逐次更新。
   */
  const board = structuredClone(state.board);

  // 从底部向上遍历（rows-1 → 0）
  for (let y = rows - 1; y >= 0; y--) {
    // 检查该行是否每个格子都有值
    const isFullLine = board[y].every(Boolean);

    if (isFullLine) {
      // 移除满行
      board.splice(y, 1);
      // 在顶部补充一个空行，保持棋盘总行数不变
      board.unshift(Array.from({ length: cols }).fill(0));
      // 上方行整体下移，重新检查当前位置
      y++;
    }
  }

  /** ======== 2. 状态计算 ======== */

  // 累计消除行数
  const nextLines = state.lines + cleared;
  // 总行数 = 基础行数 + 累计消除行数
  const totalLines = state.baseLines + nextLines;
  // 用动态步长计算新等级
  const newLevel = Math.floor(totalLines / state.levelUpSteps) + 1;
  // 是否超过最大等级
  const isMaxOut = newLevel > MAX_LEVEL;
  // 新等级 > 当前等级 且 未达上限 → 触发升级
  const levelUp = newLevel > state.level && !isMaxOut;

  // 升级时增大步长，封顶 90
  if (levelUp) {
    state.levelUpSteps += 5;
    state.levelUpSteps = Math.min(90, state.levelUpSteps);
  }

  return {
    /**
     * ## 状态更新处理函数
     *
     * 接收当前 state，返回消行后的新 state。
     *
     * @param {object} prev - 当前状态
     * @returns {object} 新状态
     */
    stateHandler: (prev) => ({
      ...prev,
      /** 清空待消除行列表 */
      clearLines: [],
      /** 更新累计消除行数 */
      lines: nextLines,
      /** 固定分 × 新等级 */
      score: prev.score + CLEAR_LINE_SCORES[cleared] * newLevel,
      /** 等级不低于当前，不超过 MAX_LEVEL */
      level: Math.min(Math.max(prev.level, newLevel), MAX_LEVEL),
      /** 同步升级步长 */
      levelUpSteps: state.levelUpSteps,
      /** 更新棋盘 */
      board,
    }),
    /** 是否触发了升级 */
    levelUp,
    /** 计算后的新等级 */
    level: isMaxOut ? MAX_LEVEL : newLevel,
    /** 是否达到最大等级 */
    isMaxOut,
  };
};

export default applyClearLines;
