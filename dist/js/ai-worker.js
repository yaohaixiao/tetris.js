// lib/ai/simulator/rotate-matrix.js
var rotateMatrix = (matrix) => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const next = Array.from(
    { length: cols },
    () => Array.from({ length: rows }).fill(0)
  );
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      next[x][rows - y - 1] = matrix[y][x];
    }
  }
  return next;
};
var rotate_matrix_default = rotateMatrix;

// lib/ai/planner/utils/get-valid-x-positions.js
var getValidXPositions = (board, shape) => {
  const boardWidth = board[0].length;
  const shapeWidth = shape[0].length;
  const maxX = boardWidth - shapeWidth;
  const positions = [];
  for (let x = 0; x <= maxX; x++) {
    positions.push(x);
  }
  return positions;
};
var get_valid_x_positions_default = getValidXPositions;

// lib/ai/utils/collision.js
var collision = (board, shape, offsetX, offsetY) => {
  for (let y = 0; y < shape.length; y += 1) {
    for (let x = 0; x < shape[y].length; x += 1) {
      if (!shape[y][x]) {
        continue;
      }
      const bx = offsetX + x;
      const by = offsetY + y;
      if (bx < 0 || bx >= board[0].length || by >= board.length) {
        return true;
      }
      if (by >= 0 && board[by][bx]) {
        return true;
      }
    }
  }
  return false;
};
var collision_default = collision;

// lib/ai/simulator/simulate-drop.js
var simulateDrop = (board, shape, startX) => {
  let y = 0;
  while (!collision_default(board, shape, startX, y + 1)) {
    y++;
  }
  const placeOn = (targetBoard) => {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[0].length; col++) {
        if (!shape[row][col]) continue;
        const by = y + row;
        const bx = startX + col;
        if (by >= 0 && by < targetBoard.length) {
          targetBoard[by][bx] = 1;
        }
      }
    }
    return targetBoard;
  };
  return {
    /** 硬降终点的 Y 坐标 */
    y,
    /** 放置函数：在分支棋盘上写入方块 */
    placeOn
  };
};
var simulate_drop_default = simulateDrop;

// lib/ai/planner/utils/add-rotate-actions.js
var addRotateActions = (actions, count) => {
  for (let i = 0; i < count; i++) {
    actions.push("ROTATE");
  }
};
var add_rotate_actions_default = addRotateActions;

// lib/ai/planner/utils/add-move-actions.js
var addMoveActions = (actions, delta) => {
  if (delta === 0) return;
  const moveDirection = delta > 0 ? "MOVE_RIGHT" : "MOVE_LEFT";
  const moveCount = Math.abs(delta);
  for (let i = 0; i < moveCount; i++) {
    actions.push(moveDirection);
  }
};
var add_move_actions_default = addMoveActions;

// lib/ai/planner/build-action-sequence.js
var buildActionSequence = ({ rotationCount, targetX, originalX }) => {
  const actions = [];
  add_rotate_actions_default(actions, rotationCount);
  add_move_actions_default(actions, targetX - originalX);
  actions.push("DROP");
  return actions;
};
var build_action_sequence_default = buildActionSequence;

// lib/ai/planner/create-candidate.js
var createCandidate = ({
  board,
  currentShape,
  targetX,
  originalPiece,
  rotationCount
}) => {
  const { y, placeOn } = simulate_drop_default(board, currentShape, targetX);
  const actions = build_action_sequence_default({
    rotationCount,
    targetX,
    originalX: originalPiece.position.x
  });
  return {
    /** 硬降终点 X 坐标（用于 advanceSnapshot 正确模拟放置位置） */
    x: targetX,
    /** 硬降终点 Y 坐标 */
    y,
    /** 放置函数：在分支棋盘上写入方块 */
    placeOn,
    /** 动作序列 */
    actions
  };
};
var create_candidate_default = createCandidate;

// lib/ai/planner/generate-for-piece.js
var generateForPiece = (board, pieceData, isHold = false) => {
  const moves = [];
  let currentShape = pieceData.shape;
  const type = pieceData.type || "";
  let uniqueRotations = 4;
  if (type === "O") {
    uniqueRotations = 1;
  } else if (type === "I" || type === "I5") {
    uniqueRotations = 2;
  }
  for (let rotation = 0; rotation < uniqueRotations; rotation++) {
    const validXPositions = get_valid_x_positions_default(board, currentShape);
    for (const targetX of validXPositions) {
      const candidate = create_candidate_default({
        board,
        currentShape,
        targetX,
        originalPiece: pieceData,
        rotationCount: rotation
      });
      if (isHold) {
        candidate.actions = ["HOLD", ...candidate.actions];
      }
      moves.push(candidate);
    }
    currentShape = rotate_matrix_default(currentShape);
  }
  return moves;
};
var generate_for_piece_default = generateForPiece;

// lib/ai/planner/generate-moves.js
var generateMoves = (snapshot) => {
  const { board, piece, hold, next } = snapshot;
  const moves = generate_for_piece_default(board, piece, false);
  const holdPieceSource = hold || next;
  if (holdPieceSource) {
    const holdPiece = {
      shape: holdPieceSource.shape,
      position: {
        x: Math.floor(board[0].length / 2) - Math.floor(holdPieceSource.shape[0].length / 2),
        y: 0
      }
    };
    moves.push(...generate_for_piece_default(board, holdPiece, true));
  }
  return moves;
};
var generate_moves_default = generateMoves;

// lib/ai/simulator/utils/get-column-height.js
var getColumnHeight = (board, x) => {
  for (let y = 0; y < board.length; y++) {
    if (board[y][x]) {
      return board.length - y;
    }
  }
  return 0;
};
var get_column_height_default = getColumnHeight;

// lib/ai/simulator/utils/count-holes.js
var countHoles = (board) => {
  let holes = 0;
  for (let x = 0; x < board[0].length; x++) {
    let blockFound = false;
    for (const row of board) {
      if (row[x]) {
        blockFound = true;
      } else if (blockFound) {
        holes += 1;
      }
    }
  }
  return holes;
};
var count_holes_default = countHoles;

// lib/ai/simulator/evaluate-board.js
var evaluateBoard = (board, weights, clearResult, mode = "survival") => {
  const heights = [];
  const w = {
    height: -0.6,
    // 背景压力：适中恐高
    holes: -8,
    // 空洞惩罚：一个洞 ≈ 10 分
    bumpiness: -0.35,
    // 不平整度：引导平整表面
    completeLines: 20,
    // 消行奖励缩放因子
    ...weights
  };
  if (mode === "versus") {
    w.height = -0.7;
    w.holes = -9;
    w.bumpiness = -0.4;
    w.completeLines = 25;
  }
  for (let x = 0; x < board[0].length; x++) {
    heights.push(get_column_height_default(board, x));
  }
  const aggregateHeight = heights.reduce((a, b) => a + b, 0);
  const maxHeight = Math.max(...heights);
  let bumpiness = 0;
  for (let i = 0; i < heights.length - 1; i++) {
    bumpiness += Math.abs(heights[i] - heights[i + 1]);
  }
  const holes = count_holes_default(board);
  let maxHeightPenalty = 0;
  if (maxHeight > 12) {
    maxHeightPenalty = -Math.pow(maxHeight - 12, 2) * 0.5;
  }
  const lineRewards = [0, 2, 6, 12, 40, 80];
  const linesCleared = clearResult ? clearResult.cleared : 0;
  const lineReward = lineRewards[linesCleared] || 0;
  const staticScore = aggregateHeight * w.height + maxHeightPenalty + holes * w.holes + bumpiness * w.bumpiness + lineReward * (w.completeLines / 4);
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
  if (mode === "versus") {
    const garbageMap = [0, 0, 1, 2, 3, 4];
    const attackLines = garbageMap[linesCleared] || 0;
    const attackScores = [0, 0, 10, 25, 50, 80];
    const attackScore = attackScores[attackLines] || 0;
    scoreBonus += attackScore;
  }
  return staticScore + scoreBonus;
};
var evaluate_board_default = evaluateBoard;

// lib/ai/utils/clone-board.js
var cloneBoard = (board) => board.map((row) => [...row]);
var clone_board_default = cloneBoard;

// lib/ai/simulator/simulate-placement.js
var simulatePlacement = (board, shape, offsetX, offsetY) => {
  const next = clone_board_default(board);
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[0].length; x++) {
      if (!shape[y][x]) continue;
      const bx = x + offsetX;
      const by = y + offsetY;
      if (by >= 0 && by < next.length) {
        next[by][bx] = 1;
      }
    }
  }
  return next;
};
var simulate_placement_default = simulatePlacement;

// lib/game/constants/game.js
var AI_ALLOWED_ACTIONS = [
  "SWITCH_CONTROLLER",
  "TOGGLE_MUSIC",
  "TOGGLE_PAUSED",
  "RESTART",
  "QUIT"
];
var CLEAR_LINE_SCORES = [0, 100, 300, 500, 800, 1200];
var FONT_FAMILY = `"Press Start 2P", monospace, sans-serif`;
var MAX_LEVEL = 256;
var GAME = {
  CLEAR_LINE_SCORES,
  FONT_FAMILY,
  AI_ALLOWED_ACTIONS,
  MAX_LEVEL
};
var game_default = GAME;

// lib/game/utils/get-t-spin-score.js
var getTSpinScore = (cleared, isTSpin, isTSpinMini) => {
  if (isTSpin) {
    const scores = [400, 800, 1200, 1600];
    return scores[cleared] || 0;
  }
  if (isTSpinMini) {
    const scores = [100, 200, 400];
    return scores[cleared] || 0;
  }
  return 0;
};
var get_t_spin_score_default = getTSpinScore;

// lib/ai/simulator/simulate-clear-result.js
var simulateClearResult = (board, snapshot, actualCleared) => {
  const { CLEAR_LINE_SCORES: CLEAR_LINE_SCORES2 } = game_default;
  const cleared = actualCleared ?? board.filter((row) => row.every((cell) => cell !== 0)).length;
  const { isTSpin = false, isTSpinMini = false } = snapshot.tSpin || {};
  if (cleared === 0 && !isTSpin && !isTSpinMini) {
    return null;
  }
  const tSpinScore = get_t_spin_score_default(cleared, isTSpin, isTSpinMini);
  const baseScore = tSpinScore || CLEAR_LINE_SCORES2[cleared] || 0;
  const isBigMove = cleared >= 4 || isTSpin || isTSpinMini;
  const isBackToBack = isBigMove && snapshot.backToBack === true;
  const multiplier = isBackToBack ? 1.5 : 1;
  const combo = (snapshot.combo || 0) + 1;
  const comboScore = combo > 1 ? (combo - 1) * 50 : 0;
  const isAllClear = cleared > 0 && board.every((row) => row.every((c) => c === 0));
  const allClearScore = isAllClear ? 2e3 : 0;
  const clearScore = Math.floor(baseScore * multiplier) + comboScore + allClearScore;
  return {
    /** 消除行数 */
    cleared,
    /** 基础分（乘倍率前） */
    baseScore,
    /** 最终得分 */
    clearScore,
    /** 是否为 T-Spin */
    isTSpin,
    /** 是否为 T-Spin Mini */
    isTSpinMini,
    /** 是否为大招（用于更新 Back-to-Back 状态） */
    isBigMove,
    /** 是否触发了 Back-to-Back 奖励 */
    isBackToBack,
    /** 是否触发了 All Clear */
    isAllClear,
    /** 更新后的连击次数 */
    combo,
    /** 本次 Combo 额外加分 */
    comboScore,
    /** 本次 All Clear 加分 */
    allClearScore
  };
};
var simulate_clear_result_default = simulateClearResult;

// lib/ai/utils/clear-full-lines.js
var clearFullLines = (board) => {
  const result = board.filter((row) => !row.every((cell) => cell !== 0));
  while (result.length < board.length) {
    result.unshift(Array.from({ length: board[0].length }).fill(0));
  }
  return result;
};
var clear_full_lines_default = clearFullLines;

// lib/ai/simulator/advance-snapshot.js
var advanceSnapshot = (snapshot, move) => {
  const board = simulate_placement_default(
    snapshot.board,
    snapshot.piece.shape,
    move.x ?? snapshot.piece.position.x,
    move.y
  );
  const beforeCleared = snapshot.board.filter(
    (row) => row.every((c) => c !== 0)
  ).length;
  const afterTotal = board.filter((row) => row.every((c) => c !== 0)).length;
  const newCleared = afterTotal - beforeCleared;
  const clearedBoard = clear_full_lines_default(board);
  const clearResult = simulate_clear_result_default(clearedBoard, snapshot, newCleared);
  const bag = snapshot.bag ? [...snapshot.bag] : [];
  const nextPiece = bag.length > 0 ? bag.shift() : snapshot.next || {
    shape: [[1, 1, 1, 1]],
    type: "I",
    rotation: 0,
    colorIndex: 0
  };
  let nextNext = null;
  if (bag.length > 0) {
    nextNext = bag.shift();
  }
  const newPiece = {
    shape: nextPiece.shape,
    position: {
      x: Math.floor(10 / 2) - Math.floor(nextPiece.shape[0].length / 2),
      y: 0
    }
  };
  return {
    ...snapshot,
    board: clearedBoard,
    piece: newPiece,
    cur: nextPiece,
    next: nextNext,
    bag,
    // 更新计分状态：combo 递增（如果有消行），否则清零
    combo: clearResult ? clearResult.combo : 0,
    // 更新 Back-to-Back：本次是大招则保留标记，否则继承原值
    backToBack: clearResult ? clearResult.isBigMove : snapshot.backToBack,
    // 清空 T-Spin 标记（每次锁定时重新检测）
    tSpin: null,
    // 传递消行结果到下一层，确保深层搜索能看到消行价值
    clearResult: clearResult || null
  };
};
var advance_snapshot_default = advanceSnapshot;

// lib/ai/planner/self-play.js
var selfPlay = (snapshot, weights, depth = 1, beam = 5, mode = "survival") => {
  const moves = generate_moves_default(snapshot);
  if (moves.length === 0) {
    return null;
  }
  const baseCleared = snapshot.board.filter(
    (row) => row.every((c) => c !== 0)
  ).length;
  if (depth > 1 && moves.length > beam) {
    const scored = moves.map((move) => {
      const board = clone_board_default(snapshot.board);
      move.placeOn(board);
      const afterTotal = board.filter(
        (row) => row.every((c) => c !== 0)
      ).length;
      const newCleared = afterTotal - baseCleared;
      const afterBoard = clear_full_lines_default(board);
      const result = simulate_clear_result_default(afterBoard, snapshot, newCleared);
      let score = evaluate_board_default(afterBoard, weights, result, mode);
      if (move.actions.includes("HOLD")) {
        score += 2;
      }
      return { move, score };
    });
    scored.sort((a, b) => b.score - a.score);
    moves.length = 0;
    moves.push(...scored.slice(0, beam).map((s) => s.move));
  }
  let best = null;
  let bestScore = -Infinity;
  for (const move of moves) {
    const board = clone_board_default(snapshot.board);
    move.placeOn(board);
    const afterTotal = board.filter((row) => row.every((c) => c !== 0)).length;
    const newCleared = afterTotal - baseCleared;
    const afterBoard = clear_full_lines_default(board);
    const result = simulate_clear_result_default(afterBoard, snapshot, newCleared);
    let score;
    if (depth <= 1) {
      score = evaluate_board_default(afterBoard, weights, result, mode);
    } else {
      const nextSnapshot = advance_snapshot_default(snapshot, move);
      const nextBest = selfPlay(nextSnapshot, weights, depth - 1, beam, mode);
      if (nextBest) {
        const nextCleared = nextSnapshot.board.filter(
          (r) => r.every((c) => c !== 0)
        ).length;
        const nextResult = simulate_clear_result_default(
          nextSnapshot.board,
          nextSnapshot,
          nextCleared
        );
        score = evaluate_board_default(nextSnapshot.board, weights, nextResult, mode);
      } else {
        score = evaluate_board_default(afterBoard, weights, result, mode);
      }
    }
    if (move.actions.includes("HOLD")) {
      score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best;
};
var self_play_default = selfPlay;

// lib/ai/snapshot/create-snapshot.js
var createSnapshot = (state, bag) => structuredClone({
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
  piece: state.curr ? {
    shape: state.curr.shape,
    position: {
      x: state.cx,
      y: state.cy
    }
  } : null,
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
  hold: state.hold || null
});
var create_snapshot_default = createSnapshot;

// lib/worker/ai-worker.js
globalThis.addEventListener("message", (e) => {
  const { type, bag, state, weights, depth, beam } = e.data;
  if (type !== "think") {
    return;
  }
  try {
    const snapshot = create_snapshot_default(state, bag);
    const best = self_play_default(snapshot, weights, depth, beam);
    globalThis.postMessage({
      type: "result",
      best: best ? { actions: best.actions, y: best.y } : null
    });
  } catch (error) {
    globalThis.postMessage({ type: "error", error: error.message });
  }
});
