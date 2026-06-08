import COLORS from '@/lib/constants/colors.js';
import lighten from '@/lib/utils/lighten.js';

/**
 * # 消行数与垃圾行数映射表
 *
 * 将消行数量映射为对应的攻击垃圾行数。
 *
 * ## 映射规则
 *
 * | 消行数 | 垃圾行数 | 说明                   |
 * | ------ | -------- | ---------------------- |
 * | 1      | 0        | Single - 无攻击力      |
 * | 2      | 1        | Double - 送 1 行垃圾   |
 * | 3      | 2        | Triple - 送 2 行垃圾   |
 * | 4      | 3        | Tetris - 送 3 行垃圾   |
 * | 5+     | 4        | 超级消除 - 送 4 行垃圾 |
 *
 * ## 设计考量
 *
 * - 单消不给攻击力，鼓励玩家构建更大的消除
 * - Tetris（4行）的收益最高（风险与回报平衡）
 * - 超过 4 行的消除极为罕见，给予额外奖励
 *
 * @constant {Object<number, number>}
 */
const GARBAGE_MAP = {
  1: 0, // 消 1 行 → 无攻击
  2: 1, // 消 2 行 → 1 行垃圾
  3: 2, // 消 3 行 → 2 行垃圾
  4: 3, // 消 4 行 → 3 行垃圾
  5: 4, // 消 5 行 → 4 行垃圾（超出常规的最大攻击）
};

/**
 * # 难度等级对应的垃圾行空洞数
 *
 * 控制垃圾行中随机空洞的数量，空洞越多越难处理。
 *
 * ## 空洞说明
 *
 * 垃圾行是填满的颜色块，但会随机留出几个**空洞**（值为 0 的格子）。 玩家需要利用当前方块填补这些空洞才能消除该行。
 *
 * ## 难度对应
 *
 * | 难度   | 空洞数 | 说明                    |
 * | ------ | ------ | ----------------------- |
 * | easy   | 1      | 每行 1 个空洞，容易填补 |
 * | normal | 2      | 每行 2 个空洞，需要规划 |
 * | hard   | 3      | 每行 3 个空洞，较难处理 |
 * | expert | 4      | 每行 4 个空洞，极难填补 |
 *
 * @constant {Object<string, number>}
 */
const DIFFICULTY_HOLES = {
  easy: 1, // 简单：1 个空洞
  normal: 2, // 普通：2 个空洞
  hard: 3, // 困难：3 个空洞
  expert: 4, // 专家：4 个空洞
};

/**
 * # 根据消行数计算攻击力
 *
 * 将玩家的消行数量转换为对对手的垃圾行攻击数量。 这是对战系统中**攻击计算**的核心函数。
 *
 * ## 计算规则
 *
 * - 查询 `GARBAGE_MAP` 映射表
 * - 如果消行数不在映射表中（如 0 行或 6+ 行），返回 0
 *
 * ## 典型使用场景
 *
 * ```javascript
 * const garbage = calculateGarbage(4); // 返回 3（Tetris 攻击）
 * const garbage = calculateGarbage(1); // 返回 0（单消无攻击）
 * const garbage = calculateGarbage(0); // 返回 0（无消除）
 * ```
 *
 * @example
 *   // 玩家完成 Tetris（4行消除）
 *   const attack = calculateGarbage(4);
 *   console.log(attack); // 3
 *
 * @param {number} lines - 玩家消除的行数
 * @returns {number} 返回对对手造成的垃圾行数，0 表示无攻击
 */
export const calculateGarbage = (lines) => GARBAGE_MAP[lines] || 0;

/**
 * # 对目标棋盘应用垃圾行
 *
 * 在对手棋盘底部添加指定数量的垃圾行，模拟受到攻击的效果。 这是对战系统中**垃圾行生成**的核心函数。
 *
 * ## 处理流程
 *
 *     输入: board, amount, difficulty
 *       ↓
 *     1. 检查 amount 是否有效（> 0）
 *       ↓
 *     2. 从棋盘顶部移除 amount 行（模拟棋盘上升）
 *       ↓
 *     3. 在棋盘底部添加 amount 行新垃圾行
 *       ↓
 *     4. 每行随机生成 holeCount 个空洞
 *       ↓
 *     输出: 新的棋盘数组
 *
 * ## 垃圾行结构
 *
 * 每个垃圾行是一个长度为 `board[0].length`（棋盘宽度）的数组：
 *
 * - **实心格子**：填充颜色值（`lighten(COLORS.BLACK, 0.6)`）- 灰色块
 * - **空洞格子**：值为 `0` - 空白，可被方块填充
 *
 * 例如（宽度 10，空洞数 2）：
 *
 *     [1, 1, 0, 1, 1, 1, 0, 1, 1, 1]
 *           ↑           ↑
 *        空洞1        空洞2
 *
 * ## 设计考量
 *
 * ### 为什么从顶部移除行？
 *
 * 当垃圾行从底部插入时，棋盘整体会**向上移动**。 如果不移除顶部的行，棋盘会超出边界。 这模拟了真实俄罗斯方块中受到攻击时方块被推高的效果。
 *
 * ### 为什么使用 `lighten(COLORS.BLACK, 0.6)`？
 *
 * - 使用灰色而非纯黑色，视觉上更有层次感
 * - `lighten()` 函数让颜色稍微变亮，与背景区分
 * - 表示这是"垃圾"而非玩家自己放置的方块
 *
 * ### 空洞的随机性
 *
 * - 空洞位置完全随机，不可预测
 * - 通过 `Set` 确保每行的空洞位置不重复
 * - 不同难度对应不同的空洞数量
 *
 * @example
 *   // 创建一个 10x20 的空棋盘
 *   const board = Array.from({ length: 20 }, () => Array(10).fill(0));
 *
 *   // 应用 3 行垃圾，难度 normal（每行 2 个空洞）
 *   const newBoard = applyGarbage(board, 3, 'normal');
 *   // newBoard 仍然是 20 行，底部 3 行是带空洞的垃圾行
 *
 * @param {number[][]} board - 目标棋盘，二维数组
 *
 *   - 外层数组：棋盘的行（从上到下）
 *   - 内层数组：每行的格子（从左到右）
 *   - 值为颜色代码，`0` 表示空格
 *
 * @param {number} amount - 要添加的垃圾行数量
 *
 *   - 必须为正整数
 *   - 如果 ≤ 0，直接返回原棋盘（无操作）
 *
 * @param {string} difficulty - 难度等级
 *
 *   - 可选值：`'easy'` | `'normal'` | `'hard'` | `'expert'`
 *   - 影响每行垃圾的空洞数量
 *   - 未匹配的值默认使用 1 个空洞
 *
 * @returns {number[][]} 应用垃圾行后的新棋盘（不修改原棋盘）
 */
export const applyGarbage = (board, amount, difficulty) => {
  /** 边界条件检查： 如果垃圾行数无效（≤ 0），不进行任何操作，直接返回原棋盘。 这避免了不必要的数组操作和性能浪费。 */
  if (amount <= 0) {
    return board;
  }

  // 获取棋盘宽度（每行的格子数）
  const width = board[0].length;

  /**
   * 根据难度获取空洞数量：
   *
   * - 从 DIFFICULTY_HOLES 映射表查询
   * - 如果难度未定义，默认使用 1 个空洞（最宽容的难度）
   */
  const holeCount = DIFFICULTY_HOLES[difficulty] || 1;

  /** 创建棋盘副本： 使用扩展运算符创建浅拷贝，避免修改原棋盘数组。 注意：内层数组（行）会在后续操作中被替换。 */
  const next = [...board];

  /**
   * ======== 步骤 1：从顶部移除行 ========
   *
   * 模拟垃圾行从底部推入时棋盘整体上移的效果。 splice(0, amount) 从数组开头删除 amount 个元素。
   *
   * 例如：
   *
   * - 原棋盘 20 行，amount = 3
   * - 删除顶部 3 行后，剩余 17 行
   * - 之后添加 3 行垃圾行，恢复为 20 行
   */
  next.splice(0, amount);

  /**
   * ======== 步骤 2：在底部添加垃圾行 ========
   *
   * 循环 amount 次，每次在棋盘底部 push 一行新的垃圾行。
   */
  for (let i = 0; i < amount; i += 1) {
    /**
     * 创建垃圾行：
     *
     * - 使用 Array.from 生成长度为 width 的数组
     * - 初始填充颜色：使用 lighten 函数处理 COLORS.BLACK
     *
     *   - COLORS.BLACK：基础黑色
     *   - Lighten(..., 0.6)：将颜色提亮 60%，得到深灰色
     *   - 视觉效果：垃圾块是灰黑色，与玩家方块区分
     */
    const row = Array.from({ length: width }).fill(lighten(COLORS.BLACK, 0.6));

    /**
     * 随机生成空洞位置：
     *
     * 使用 Set 数据结构确保空洞位置不重复。
     *
     * 生成过程：
     *
     * 1. 创建空 Set
     * 2. 当 Set 大小小于 holeCount 时循环
     * 3. 每次生成 0 到 width-1 的随机整数
     * 4. Set 自动去重，所以不会有两个空洞在同一位置
     *
     * 例如 holeCount = 2, width = 10： 可能生成 Set { 3, 7 } → 第 3 列和第 7 列是空洞
     */
    const holes = new Set();

    while (holes.size < holeCount) {
      /*
       * Math.random() * width → 0 到 width 之间的浮点数
       * Math.floor() → 向下取整，得到 0 到 width-1 的整数
       */
      holes.add(Math.floor(Math.random() * width));
    }

    /**
     * 将空洞位置的值设为 0（空格）：
     *
     * 遍历 Set 中的所有空洞位置，将对应格子设为 0。
     *
     * - 0 在游戏逻辑中表示"空格"
     * - 方块可以落入空洞进行填补
     * - 填补所有空洞后该行才能被消除
     */
    for (const h of holes) {
      row[h] = 0;
    }

    // 将构建好的垃圾行添加到棋盘底部
    next.push(row);
  }

  // 返回处理后的新棋盘
  return next;
};
