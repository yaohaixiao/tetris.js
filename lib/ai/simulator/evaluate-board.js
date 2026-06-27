import getColumnHeight from '@/lib/ai/simulator/utils/get-column-height.js';
import countHoles from '@/lib/ai/simulator/utils/count-holes.js';

/**
 * # 棋盘评估函数
 *
 * 对棋盘状态进行综合评分，用于 AI 决策。 支持 survival（生存）和 versus（对战）两种模式。
 *
 * ## 设计理念
 *
 * - `aggregateHeight` 作为背景压力，防止 AI 无限养井
 * - `holes` 作为核心指标（强权重），一个洞毁全局
 * - `maxHeight` 超过 12 行后开始指数惩罚，逼迫 AI 及时消行
 * - 消行奖励从 `clearResult` 读取，表驱动区分 Single～Tetris
 * - `clearResult` 沿前瞻链传递，深层搜索也能看到消行价值
 *
 * ## 评估指标
 *
 * ### 结构指标
 *
 * | 指标                      | 权重  | 说明                                         |
 * | ------------------------- | ----- | -------------------------------------------- |
 * | aggregateHeight（总高度） | -0.45 | 背景压力，适中恐高，防止无限堆叠             |
 * | maxHeight（最高列）       | 动态  | >12 开始指数惩罚（×0.5），给 AI 留足堆叠空间 |
 * | holes（空洞数）           | -8    | 核心指标，一个洞 ≈ 10 分惩罚                 |
 * | bumpiness（不平整度）     | -0.35 | 引导 AI 保持表面平整以便多消行               |
 *
 * ### 消行奖励（表驱动）
 *
 * | 消行数 | lineReward | × completeLines/4 | 最终奖励 |
 * | ------ | ---------- | ----------------- | -------- |
 * | 1行    | 2          | × 5               | 10 分    |
 * | 2行    | 6          | × 5               | 30 分    |
 * | 3行    | 12         | × 5               | 60 分    |
 * | 4行    | 40         | × 5               | 200 分   |
 * | 5行    | 80         | × 5               | 400 分   |
 *
 * ### 计分奖励（叠加在消行奖励之上）
 *
 * | 指标         | 说明            |
 * | ------------ | --------------- |
 * | clearScore   | 消行得分 × 0.03 |
 * | isTSpin      | +8              |
 * | isTSpinMini  | +3              |
 * | isBackToBack | +5              |
 * | isAllClear   | +20             |
 * | combo        | combo × 0.8     |
 *
 * ## 危险区行为
 *
 *     ≤12 行：安全，自由堆叠
 *     13-14：轻度压力
 *     15-16：明显压力，必须找消行
 *     17+：重度压力，不消行会快速死亡
 *
 * ## 对战模式 (versus) 与生存模式 (survival)
 *
 * 对战模式在生存模式的基础上进行了以下调整：
 *
 * ### 1. 更严格的权重
 *
 * | 指标          | survival | versus | 原因                                   |
 * | ------------- | -------- | ------ | -------------------------------------- |
 * | height        | -0.6     | -0.7   | 垃圾行攻击下高度是致命弱点             |
 * | holes         | -8       | -9     | 垃圾行从底部推入，有洞更容易死         |
 * | bumpiness     | -0.35    | -0.4   | 更平整的表面有利于连续消行以应对垃圾行 |
 * | completeLines | 20       | 25     | 更大的消行奖励缩放因子，鼓励主动消行   |
 *
 * ### 2. 攻击力奖励
 *
 * 对战模式额外根据消行产生的攻击力给予加分，引导 AI 追求多行消除。
 *
 * | 消行数 | 攻击力 | attackScore | 说明           |
 * | ------ | ------ | ----------- | -------------- |
 * | 1 行   | 0      | 0           | 无攻击力不奖励 |
 * | 2 行   | 1      | 10          | 小幅度奖励     |
 * | 3 行   | 2      | 25          | 中等奖励       |
 * | 4 行   | 3      | 50          | Tetris 重奖    |
 * | 5 行   | 4      | 80          | 极限重奖       |
 *
 * 攻击力换算与 `lib/battle/garbage-system.js` 中的 `GARBAGE_MAP` 保持一致。
 *
 * @param {number[][]} board - 棋盘二维数组，0 为空，非 0 为占用
 * @param {object} weights - 权重配置，可覆盖默认值（由 AIDifficulty 提供）
 * @param {object} [clearResult] - 消行计分结果（沿前瞻链传递）
 * @param {string} [mode='survival'] - AI 模式：survival 或 versus. Default is
 *   `'survival'`
 * @returns {number} 棋盘评分，越高越好
 */
const evaluateBoard = (board, weights, clearResult, mode = 'survival') => {
  /*
   * ==================== 初始化 ====================
   *
   * heights：收集每列高度，用于后续计算总高度、最高列和不平整度
   */
  const heights = [];

  /*
   * ==================== 权重配置 ====================
   *
   * 默认权重适用于 survival 模式。
   * 调用方可通过 weights 参数覆盖任意字段。
   * 对战模式 (versus) 在此基础上进一步覆盖，使用更严格的策略。
   */
  const w = {
    holes: -8, // 空洞惩罚：一个洞 ≈ 10 分
    height: -0.7, // 背景压力：适中恐高
    bumpiness: -0.35, // 不平整度：引导平整表面
    completeLines: 20, // 消行奖励缩放因子
    ...weights,
  };

  /*
   * ==================== 对战模式覆盖权重 ====================
   *
   * 对战模式下 AI 需要更积极的策略：
   * - 更怕高：因为对手消行会发送垃圾行，高度越高越危险
   * - 更怕洞：垃圾行从底部推入，有洞的列容易形成深井
   * - 更注重平整：平整的表面可以连续消行，更高效地发送攻击
   * - 更大的消行奖励：鼓励主动消行而非被动防守
   */
  if (mode === 'versus') {
    w.height = -0.8;
    w.holes = -9;
    w.bumpiness = -0.4;
    w.completeLines = 25;
  }

  /*
   * ==================== 结构指标计算 ====================
   *
   * 逐列计算高度，然后汇总为：
   * - aggregateHeight：总高度（所有列高度之和）
   * - maxHeight：最高列高度
   * - bumpiness：不平整度（相邻列高度差的绝对值之和）
   * - holes：空洞数（被堵塞的空格数量）
   */

  // 计算每列高度
  for (let x = 0; x < board[0].length; x++) {
    heights.push(getColumnHeight(board, x));
  }

  // 总高度：所有列高度之和
  const aggregateHeight = heights.reduce((a, b) => a + b, 0);

  // 最高列：用于危险区判断
  const maxHeight = Math.max(...heights);

  // 不平整度：相邻列高度差的绝对值之和，值越小表面越平坦
  let bumpiness = 0;
  for (let i = 0; i < heights.length - 1; i++) {
    bumpiness += Math.abs(heights[i] - heights[i + 1]);
  }

  // 空洞数：被堵塞的空格数量
  const holes = countHoles(board);

  /*
   * ==================== 危险区指数惩罚 ====================
   *
   * 从 12 行开始触发，给 AI 充足的堆叠空间（10 列棋盘 12 行 = 120 格）。
   * 惩罚公式：-(maxHeight - 12)² × 0.5
   *
   * 示例：
   * - 13 行：-(1)² × 0.5 = -0.5 分（轻微）
   * - 14 行：-(2)² × 0.5 = -2 分
   * - 15 行：-(3)² × 0.5 = -4.5 分
   * - 16 行：-(4)² × 0.5 = -8 分（明显压力）
   * - 17 行：-(5)² × 0.5 = -12.5 分（重度压力）
   */
  let maxHeightPenalty = 0;
  if (maxHeight > 12) {
    maxHeightPenalty = -Math.pow(maxHeight - 12, 2) * 0.5;
  }

  /*
   * ==================== 消行奖励 ====================
   *
   * 使用表驱动的方式计算消行奖励，阶梯式引导 AI 主动追 Tetris。
   *
   * lineRewards 表：
   * - 0 行：0（无消行）
   * - 1 行：2（Single）
   * - 2 行：6（Double）
   * - 3 行：12（Triple）
   * - 4 行：40（Tetris）
   * - 5 行：80（最大消行）
   *
   * 最终奖励 = lineReward × (completeLines / 4)
   * 例如 survival 下 Tetris = 40 × (20/4) = 200 分
   * 例如 versus 下 Tetris = 40 × (25/4) = 250 分
   *
   * linesCleared 从 clearResult 中读取实际消除的行数。
   * 如果 clearResult 为 null（未消行），linesCleared = 0。
   */
  const lineRewards = [0, 2, 6, 12, 40, 80];
  const linesCleared = clearResult ? clearResult.cleared : 0;
  const lineReward = lineRewards[linesCleared] || 0;

  /*
   * ==================== 静态评分 ====================
   *
   * 综合四项结构指标和消行奖励，计算静态评分：
   * - 总高度 × 高度权重（负值，越高越差）
   * - 危险区惩罚（负值或 0）
   * - 空洞数 × 空洞权重（负值，越多越差）
   * - 不平整度 × 不平整度权重（负值，越不平越差）
   * - 消行奖励 × 缩放因子（正值，越多越好）
   */
  const staticScore =
    aggregateHeight * w.height +
    maxHeightPenalty +
    holes * w.holes +
    bumpiness * w.bumpiness +
    lineReward * (w.completeLines / 4);

  /*
   * ==================== 计分奖励 ====================
   *
   * 在静态结构分的基础上，叠加游戏内的各项得分奖励。
   * 这些奖励反映的是消行的"质量"而非"数量"。
   */
  let scoreBonus = 0;

  if (clearResult) {
    // 消行得分归一化（×0.03）：将游戏得分映射到评分空间
    scoreBonus += clearResult.clearScore * 0.03;

    // T-Spin 额外奖励
    if (clearResult.isTSpin) {
      scoreBonus += 8;
    } else if (clearResult.isTSpinMini) {
      scoreBonus += 3;
    }

    // Back-to-Back 连续大招奖励
    if (clearResult.isBackToBack) {
      scoreBonus += 5;
    }

    // All Clear 全清重奖
    if (clearResult.isAllClear) {
      scoreBonus += 20;
    }

    // Combo 连击奖励：每次连击 +0.8 分
    scoreBonus += clearResult.combo * 0.8;
  }

  /*
   * ==================== 对战模式：攻击力奖励 ====================
   *
   * 对战模式下，消行会向对手发送垃圾行。
   * AI 需要知道"消行不仅能清理自己的棋盘，还能攻击对手"。
   *
   * 攻击力换算表（与 lib/battle/garbage-system.js 的 GARBAGE_MAP 一致）：
   *
   * | 消行数 | 攻击力 | attackScore | 设计意图               |
   * | ------ | ------ | ----------- | ---------------------- |
   * | 1 行   | 0      | 0           | 消1行无攻击力，不奖励   |
   * | 2 行   | 1      | 10          | 小幅度奖励，值得做      |
   * | 3 行   | 2      | 25          | 中等奖励，主动追求      |
   * | 4 行   | 3      | 50          | Tetris 重奖，核心目标   |
   * | 5 行   | 4      | 80          | 极限重奖，鼓励极限操作  |
   *
   * 攻击力评分量级设计：
   * - 10-25 分可以覆盖"留 1-2 个洞"的惩罚（-8 ~ -18 分）
   * - 50 分可以覆盖"堆高 5 行"的惩罚（约 -25 分）
   * - 80 分可以覆盖"不平整度 20"的惩罚（约 -8 分）
   * 这让 AI 在"稍微牺牲平整度来追 Tetris"时有正确的权衡。
   */
  if (mode === 'versus') {
    const garbageMap = [0, 0, 1, 2, 3, 4];
    const attackLines = garbageMap[linesCleared] || 0;

    const attackScores = [0, 0, 10, 25, 50, 80];
    const attackScore = attackScores[attackLines] || 0;

    scoreBonus += attackScore;
  }

  /*
   * ==================== 最终评分 ====================
   *
   * 静态结构分 + 计分奖励 = 最终评分
   * 评分越高，表示棋盘状态越好。
   * AI 在 selfPlay 中根据此评分选择最佳候选移动。
   */
  return staticScore + scoreBonus;
};

export default evaluateBoard;
