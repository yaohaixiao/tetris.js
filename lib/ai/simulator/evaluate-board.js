import getColumnHeight from '@/lib/ai/simulator/utils/get-column-height.js';
import countHoles from '@/lib/ai/simulator/utils/count-holes.js';

/**
 * ============================================================
 *
 * # 棋盘评估函数
 *
 * ============================================================
 *
 * 对棋盘状态进行综合评分，用于 AI 决策。 支持 survival（生存）和 versus（对战）两种模式。
 *
 * ## 设计理念
 *
 * - AggregateHeight 作为背景压力，防止 AI 无限养井
 * - Holes 作为核心指标（强权重），一个洞毁全局
 * - MaxHeight 超过 12 行后开始指数惩罚，逼迫 AI 及时消行
 * - 消行奖励从 clearResult 读取，表驱动区分 Single～Tetris
 * - ClearResult 沿前瞻链传递，深层搜索也能看到消行价值
 *
 * ## 评估指标
 *
 * ### 结构指标
 *
 * | 指标                      | 权重  | 说明                                 |
 * | :------------------------ | :---- | :----------------------------------- |
 * | aggregateHeight（总高度） | -0.45 | 背景压力，适中恐高，防止无限堆叠     |
 * | maxHeight（最高列）       | 动态  | >12 开始指数惩罚，给 AI 留足堆叠空间 |
 * | holes（空洞数）           | -8    | 核心指标，一个洞 ≈ 10 分惩罚         |
 * | bumpiness（不平整度）     | -0.35 | 引导 AI 保持表面平整以便多消行       |
 *
 * ### 消行奖励（表驱动）
 *
 * | 消行数 | lineReward | × completeLines/4 | 最终奖励 |
 * | :----- | :--------- | :---------------- | :------- |
 * | 1行    | 2          | × 5               | 10 分    |
 * | 2行    | 6          | × 5               | 30 分    |
 * | 3行    | 12         | × 5               | 60 分    |
 * | 4行    | 40         | × 5               | 200 分   |
 * | 5行    | 80         | × 5               | 400 分   |
 *
 * ### 计分奖励（叠加在消行奖励之上）
 *
 * | 指标         | 说明            |
 * | :----------- | :-------------- |
 * | clearScore   | 消行得分 × 0.03 |
 * | isTSpin      | +8              |
 * | isTSpinMini  | +3              |
 * | isBackToBack | +5              |
 * | isAllClear   | +20             |
 * | combo        | combo × 0.8     |
 *
 * ## 对战模式 (versus) 与生存模式 (survival)
 *
 * 对战模式在生存模式的基础上使用更严格的权重， 并额外根据消行产生的攻击力给予加分， 引导 AI 追求多行消除以发送垃圾行给对手。
 *
 * @function evaluateBoard
 * @param {number[][]} board - 棋盘二维数组
 * @param {object} weights - 权重配置
 * @param {object} [clearResult] - 消行计分结果
 * @param {string} [mode='survival'] - AI 模式：survival 或 versus. Default is
 *   `'survival'`
 * @returns {number} 棋盘评分，越高越好
 */
const evaluateBoard = (board, weights, clearResult, mode = 'survival') => {
  const heights = [];

  // 权重配置（默认适用于 survival 模式）
  const w = {
    holes: -8,
    height: -0.7,
    bumpiness: -0.35,
    completeLines: 20,
    ...weights,
  };

  // 对战模式覆盖权重
  if (mode === 'versus') {
    w.height = -0.8;
    w.holes = -9;
    w.bumpiness = -0.4;
    w.completeLines = 25;
  }

  // 结构指标计算
  for (let x = 0; x < board[0].length; x++) {
    heights.push(getColumnHeight(board, x));
  }

  const aggregateHeight = heights.reduce((a, b) => a + b, 0);
  const maxHeight = Math.max(...heights);

  let bumpiness = 0;
  for (let i = 0; i < heights.length - 1; i++) {
    bumpiness += Math.abs(heights[i] - heights[i + 1]);
  }

  const holes = countHoles(board);

  // 危险区指数惩罚：从 12 行开始触发
  let maxHeightPenalty = 0;
  if (maxHeight > 12) {
    maxHeightPenalty = -Math.pow(maxHeight - 12, 2) * 0.5;
  }

  // 消行奖励（表驱动）
  const lineRewards = [0, 2, 6, 12, 40, 80];
  const linesCleared = clearResult ? clearResult.cleared : 0;
  const lineReward = lineRewards[linesCleared] || 0;

  // 静态评分
  const staticScore =
    aggregateHeight * w.height +
    maxHeightPenalty +
    holes * w.holes +
    bumpiness * w.bumpiness +
    lineReward * (w.completeLines / 4);

  // 计分奖励
  let scoreBonus = 0;

  if (clearResult) {
    scoreBonus += clearResult.clearScore * 0.03;

    if (clearResult.isTSpin) {
      scoreBonus += 8;
    } else if (clearResult.isTSpinMini) {
      scoreBonus += 3;
    }

    if (clearResult.isBackToBack) {
      scoreBonus += 5;
    }

    if (clearResult.isAllClear) {
      scoreBonus += 20;
    }

    scoreBonus += clearResult.combo * 0.8;
  }

  // 对战模式：攻击力奖励
  if (mode === 'versus') {
    const garbageMap = [0, 0, 1, 2, 3, 4];
    const attackLines = garbageMap[linesCleared] || 0;

    const attackScores = [0, 0, 10, 25, 50, 80];
    const attackScore = attackScores[attackLines] || 0;

    scoreBonus += attackScore;
  }

  return staticScore + scoreBonus;
};

export default evaluateBoard;
