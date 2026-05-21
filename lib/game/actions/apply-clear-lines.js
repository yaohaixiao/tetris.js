import GAME from '@/lib/game/constants/game.js';

/**
 * # 应用消除行
 *
 * 检测并消除棋盘中的满行，更新分数、行数和等级。
 *
 * ## 处理流程
 *
 * 1. **消行逻辑**：从底部向上扫描棋盘，将满行移除并在顶部补充空行
 * 2. **状态计算**：计算消除后的行数、分数和等级
 * 3. **返回更新数据**：返回 stateHandler 和其他元数据供调用方使用
 *
 * ## 计分规则
 *
 * 根据一次消除的行数给予不同分数（由 `CLEAR_LINE_SCORES` 配置）：
 *
 * | 消除行数    | 分数倍率 |
 * | ----------- | -------- |
 * | 1           | 100      |
 * | 2           | 300      |
 * | 3           | 500      |
 * | 4（Tetris） | 800      |
 *
 * ## 等级计算
 *
 * - 每消除 10 行升一级
 * - 等级受配置的 min/max 限制
 * - 如果达到最大等级（maxLevel），标记 `isMaxOut`
 *
 * @function applyClearLines
 * @param {object} runtime - 游戏运行时对象
 * @returns {object} 返回消行后的更新数据
 */
const applyClearLines = (runtime) => {
  const { Elements, Level, Store } = runtime;
  const state = Store.getState();
  const { rows, cols } = Elements.Main;
  const { CLEAR_LINE_SCORES } = GAME;
  const lines = state.clearLines || [];
  const cleared = lines.length;

  /**
   * ======== 1. 真实消行逻辑 ========
   *
   * 深拷贝当前棋盘，从底部向上扫描满行并移除， 在顶部补充空行。这里直接操作 board 结构， 属于"结构型数据修改"，暂时不通过 setState
   * 处理。
   */
  const board = structuredClone(state.board);

  // 从底部向上遍历
  for (let y = rows - 1; y >= 0; y--) {
    // 检查该行是否被填满（每个格子都有值）
    const isFullLine = board[y].every(Boolean);

    if (isFullLine) {
      // 移除满行
      board.splice(y, 1);
      // 在顶部补充一个空行
      board.unshift(Array.from({ length: cols }).fill(0));
      // 由于上方行下移，需要重新检查当前位置
      y++;
    }
  }

  /**
   * ======== 2. 状态收敛 ========
   *
   * 计算消除后的行数、分数和等级。
   */
  // 更新累计消除行数
  const nextLines = state.lines + cleared;
  // 计算总行数（基础行数 + 累计行数），用于等级计算
  const totalLines = state.baseLines + nextLines;
  // 每 10 行升一级，初始等级为 1
  const newLevel = Math.floor(totalLines / 10) + 1;
  // 检查是否达到最大等级
  const { max } = Level;
  const isMaxOut = newLevel > max;
  // 新等级高于当前等级且未达到上限时触发升级
  const levelUp = newLevel > state.level && !isMaxOut;

  return {
    /**
     * ## 状态更新处理函数
     *
     * 接收当前 state，返回消行后的新 state。 清除 clearLines 数组、更新行数和分数、修正等级。
     *
     * @param {object} prev - 当前状态
     * @returns {object} 新状态
     */
    stateHandler: (prev) => ({
      ...prev,
      clearLines: [], // 清空待消除行列表
      lines: nextLines, // 更新累计消除行数
      score: prev.score + CLEAR_LINE_SCORES[cleared], // 根据消除行数加分
      level: Math.min(Math.max(prev.level, newLevel), max), // 更新等级（限制在有效范围内）
      board, // 更新棋盘
    }),
    /** ## 是否触发了升级 */
    levelUp,
    /** ## 计算后的新等级 */
    level: isMaxOut ? max : newLevel,
    /** ## 是否达到最大等级 */
    isMaxOut,
  };
};

export default applyClearLines;
