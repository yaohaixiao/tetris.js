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

// lib/ai/utils/get-valid-x-positions.js
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

// lib/ai/utils/add-rotate-actions.js
var addRotateActions = (actions, count) => {
  for (let i = 0; i < count; i++) {
    actions.push("ROTATE");
  }
};
var add_rotate_actions_default = addRotateActions;

// lib/ai/utils/add-move-actions.js
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

// lib/ai/utils/get-column-height.js
var getColumnHeight = (board, x) => {
  for (let y = 0; y < board.length; y++) {
    if (board[y][x]) {
      return board.length - y;
    }
  }
  return 0;
};
var get_column_height_default = getColumnHeight;

// lib/ai/utils/count-holes.js
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
var evaluateBoard = (board, weights, clearResult) => {
  const heights = [];
  const w = {
    height: -0.3,
    holes: -5,
    bumpiness: -0.2,
    completeLines: 20,
    ...weights
  };
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
  if (maxHeight > 10) {
    maxHeightPenalty = -Math.pow(maxHeight - 10, 2) * 1;
  }
  const lineRewards = [0, 1, 4, 8, 20, 30];
  const linesCleared = clearResult ? clearResult.cleared : 0;
  const lineReward = lineRewards[linesCleared] || 0;
  const staticScore = aggregateHeight * w.height + maxHeightPenalty + holes * w.holes + bumpiness * w.bumpiness + lineReward * (w.completeLines / 5);
  let scoreBonus = 0;
  if (clearResult) {
    scoreBonus += clearResult.clearScore * 0.01;
    if (clearResult.isTSpin) {
      scoreBonus += 5;
    } else if (clearResult.isTSpinMini) {
      scoreBonus += 2;
    }
    if (clearResult.isBackToBack) {
      scoreBonus += 3;
    }
    if (clearResult.isAllClear) {
      scoreBonus += 10;
    }
    scoreBonus += clearResult.combo * 0.5;
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

// lib/ai/utils/clear-full-lines.js
var clearFullLines = (board) => {
  const result = board.filter((row) => !row.every((cell) => cell !== 0));
  while (result.length < board.length) {
    result.unshift(Array.from({ length: board[0].length }).fill(0));
  }
  return result;
};
var clear_full_lines_default = clearFullLines;

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
var simulateClearResult = (board, snapshot) => {
  const { CLEAR_LINE_SCORES: CLEAR_LINE_SCORES2 } = game_default;
  const cleared = board.filter((row) => row.every((cell) => cell !== 0)).length;
  const { isTSpin = false, isTSpinMini = false } = snapshot.tSpin || {};
  if (cleared === 0 && !isTSpin && !isTSpinMini) return null;
  const tSpinScore = get_t_spin_score_default(cleared, isTSpin, isTSpinMini);
  const baseScore = tSpinScore || CLEAR_LINE_SCORES2[cleared] || 0;
  const isBigMove = cleared >= 4 || isTSpin || isTSpinMini;
  const isBackToBack = isBigMove && snapshot.backToBack === true;
  const multiplier = isBackToBack ? 1.5 : 1;
  const combo = (snapshot.combo || 0) + 1;
  const comboScore = combo > 1 ? (combo - 1) * 50 : 0;
  const isAllClear = cleared > 0 && board.every((row) => row.every((cell) => cell === 0));
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

// lib/ai/simulator/advance-snapshot.js
var advanceSnapshot = (snapshot, move) => {
  const board = simulate_placement_default(
    snapshot.board,
    snapshot.piece.shape,
    snapshot.piece.position.x,
    move.y
  );
  const clearedBoard = clear_full_lines_default(board);
  const clearResult = simulate_clear_result_default(clearedBoard, snapshot);
  const bag2 = snapshot.bag ? [...snapshot.bag] : [];
  const nextPiece = bag2.length > 0 ? bag2.shift() : snapshot.next || {
    shape: [[1, 1, 1, 1]],
    type: "I",
    rotation: 0,
    colorIndex: 0
  };
  let nextNext = null;
  if (bag2.length > 0) {
    nextNext = bag2.shift();
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
    bag: bag2,
    // 更新计分状态
    combo: clearResult ? clearResult.combo : 0,
    backToBack: clearResult ? clearResult.isBigMove : snapshot.backToBack,
    tSpin: null,
    // 传递消行结果到下一层，确保深层搜索能看到消行价值
    clearResult: clearResult || null
  };
};
var advance_snapshot_default = advanceSnapshot;

// lib/ai/planner/self-play.js
var selfPlay = (snapshot, weights, depth = 1, beam = 5) => {
  const moves = generate_moves_default(snapshot);
  if (moves.length === 0) {
    return null;
  }
  if (depth > 1 && moves.length > beam) {
    const scored = moves.map((move) => {
      const branchBoard = clone_board_default(snapshot.board);
      move.placeOn(branchBoard);
      const clearedBoard = clear_full_lines_default(branchBoard);
      const afterClearResult = simulate_clear_result_default(clearedBoard, snapshot);
      let score = evaluate_board_default(clearedBoard, weights, afterClearResult);
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
    const branchBoard = clone_board_default(snapshot.board);
    move.placeOn(branchBoard);
    const clearedBoard = clear_full_lines_default(branchBoard);
    const afterClearResult = simulate_clear_result_default(clearedBoard, snapshot);
    let score;
    if (depth <= 1) {
      score = evaluate_board_default(clearedBoard, weights, afterClearResult);
    } else {
      const nextSnapshot = advance_snapshot_default(snapshot, move);
      const nextBest = selfPlay(nextSnapshot, weights, depth - 1, beam);
      if (nextBest) {
        const nextClearResult = simulate_clear_result_default(
          nextSnapshot.board,
          nextSnapshot
        );
        score = evaluate_board_default(nextSnapshot.board, weights, nextClearResult);
      } else {
        score = evaluate_board_default(clearedBoard, weights, afterClearResult);
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

// lib/constants/colors.js
var TEAL = "#00c8ff";
var RGBA_TEAL = "rgba(0, 200, 255, 0.3)";
var YELLOW = "#f1fa04";
var RGBA_YELLOW = "rgba(255, 255, 0, 0.3)";
var PURPLE = "#d31ac1";
var RGBA_PURPLE = "rgba(211, 26, 193, 0.3)";
var BLUE = "#5050ff";
var RGBA_BLUE = "rgba(80, 80, 255, 0.3)";
var ORANGE = "#ffa500";
var RGBA_ORANGE = "rgba(255, 127, 0, 0.3)";
var GREEN = "#0afa04";
var DARK_GREEN = "#5c9d31";
var RGBA_GREEN = "rgba(0, 255, 0, 0.3)";
var RED = "#ff3b30";
var RGBA_RED = "rgba(255, 59, 48, 0.3)";
var CORAL = "#e64a19";
var RGBA_CORAL = "rgba(230, 74, 25, 0.3)";
var BLACK = "#444";
var RGBA_BLACK = "rgba(0, 0, 0, 0.3)";
var WHITE = "#fff";
var RGBA_WHITE = "rgba(255, 255, 255, 0.3)";
var PINK = "#ff4fa3";
var RGBA_PINK = "rgba(255, 79, 163, 0.3)";
var VIOLET = "#7b34eb";
var RGBA_VIOLET = "rgba(123, 52, 235, 0.3)";
var CYAN = "#0cc0df";
var RGBA_CYAN = "rgba(12, 192, 223, 0.3)";
var WARM_TEAL = "#ff6b6b";
var WARM_GREEN = "#ffa502";
var WARM_ORANGE = "#ffd700";
var WARM_YELLOW = "#ff7f50";
var WARM_BLUE = "#ff4757";
var WARM_PINK = "#ff6348";
var WARM_RED = "#e74c3c";
var WARM_VIOLET = "#f39c12";
var COOL_TEAL = "#00d2d3";
var COOL_GREEN = "#1dd1a1";
var COOL_ORANGE = "#54a0ff";
var COOL_YELLOW = "#5f27cd";
var COOL_BLUE = "#01a3a4";
var COOL_PINK = "#0abde3";
var COOL_RED = "#48dbfb";
var COOL_VIOLET = "#2e86de";
var CANDY_TEAL = "#f368e0";
var CANDY_GREEN = "#ff9ff3";
var CANDY_ORANGE = "#feca57";
var CANDY_YELLOW = "#ff9f43";
var CANDY_BLUE = "#ee5a24";
var CANDY_PINK = "#f78fb3";
var CANDY_RED = "#cf6a87";
var CANDY_VIOLET = "#e056a0";
var FOREST_TEAL = "#26de81";
var FOREST_GREEN = "#20bf6b";
var FOREST_ORANGE = "#2bcbba";
var FOREST_YELLOW = "#0fb9b1";
var FOREST_BLUE = "#45aaf2";
var FOREST_PINK = "#4b7bec";
var FOREST_RED = "#a55eea";
var FOREST_VIOLET = "#8854d0";
var SUNSET_TEAL = "#ff6b35";
var SUNSET_GREEN = "#f7c59f";
var SUNSET_ORANGE = "#e08e45";
var SUNSET_YELLOW = "#d4a373";
var SUNSET_BLUE = "#cc8b5c";
var SUNSET_PINK = "#b56576";
var SUNSET_RED = "#a45c5c";
var SUNSET_VIOLET = "#8b5e3c";
var NEON_TEAL = "#ff00ff";
var NEON_GREEN = "#00ffff";
var NEON_ORANGE = "#ffff00";
var NEON_YELLOW = "#ff0080";
var NEON_BLUE = "#00ff80";
var NEON_PINK = "#8000ff";
var NEON_RED = "#ff8000";
var NEON_VIOLET = "#0080ff";
var JEWEL_TEAL = "#00d2d3";
var JEWEL_GREEN = "#2ed573";
var JEWEL_ORANGE = "#ffa502";
var JEWEL_YELLOW = "#ff6348";
var JEWEL_BLUE = "#1e90ff";
var JEWEL_PINK = "#ff6b81";
var JEWEL_RED = "#ff4757";
var JEWEL_VIOLET = "#7b68ee";
var COLORS = {
  // 基础
  TEAL,
  RGBA_TEAL,
  YELLOW,
  RGBA_YELLOW,
  PURPLE,
  RGBA_PURPLE,
  BLUE,
  RGBA_BLUE,
  ORANGE,
  RGBA_ORANGE,
  GREEN,
  DARK_GREEN,
  RGBA_GREEN,
  RED,
  RGBA_RED,
  CORAL,
  RGBA_CORAL,
  BLACK,
  RGBA_BLACK,
  WHITE,
  RGBA_WHITE,
  PINK,
  RGBA_PINK,
  VIOLET,
  RGBA_VIOLET,
  CYAN,
  RGBA_CYAN,
  // WARM
  WARM_TEAL,
  WARM_GREEN,
  WARM_ORANGE,
  WARM_YELLOW,
  WARM_BLUE,
  WARM_PINK,
  WARM_RED,
  WARM_VIOLET,
  // COOL
  COOL_TEAL,
  COOL_GREEN,
  COOL_ORANGE,
  COOL_YELLOW,
  COOL_BLUE,
  COOL_PINK,
  COOL_RED,
  COOL_VIOLET,
  // CANDY
  CANDY_TEAL,
  CANDY_GREEN,
  CANDY_ORANGE,
  CANDY_YELLOW,
  CANDY_BLUE,
  CANDY_PINK,
  CANDY_RED,
  CANDY_VIOLET,
  // FOREST
  FOREST_TEAL,
  FOREST_GREEN,
  FOREST_ORANGE,
  FOREST_YELLOW,
  FOREST_BLUE,
  FOREST_PINK,
  FOREST_RED,
  FOREST_VIOLET,
  // SUNSET
  SUNSET_TEAL,
  SUNSET_GREEN,
  SUNSET_ORANGE,
  SUNSET_YELLOW,
  SUNSET_BLUE,
  SUNSET_PINK,
  SUNSET_RED,
  SUNSET_VIOLET,
  // NEON
  NEON_TEAL,
  NEON_GREEN,
  NEON_ORANGE,
  NEON_YELLOW,
  NEON_BLUE,
  NEON_PINK,
  NEON_RED,
  NEON_VIOLET,
  // JEWEL
  JEWEL_TEAL,
  JEWEL_GREEN,
  JEWEL_ORANGE,
  JEWEL_YELLOW,
  JEWEL_BLUE,
  JEWEL_PINK,
  JEWEL_RED,
  JEWEL_VIOLET
};
var colors_default = COLORS;

// lib/game/constants/color-palettes.js
var PALETTES = [
  /*
   * ==================== 方案 0：基础经典（关卡 0-31） ====================
   */
  [
    colors_default.TEAL,
    colors_default.GREEN,
    colors_default.ORANGE,
    colors_default.YELLOW,
    colors_default.BLUE,
    colors_default.PINK,
    colors_default.RED,
    colors_default.VIOLET
  ],
  /*
   * ==================== 方案 1：暖色系（关卡 32-63） ====================
   */
  [
    colors_default.WARM_TEAL,
    colors_default.WARM_GREEN,
    colors_default.WARM_ORANGE,
    colors_default.WARM_YELLOW,
    colors_default.WARM_BLUE,
    colors_default.WARM_PINK,
    colors_default.WARM_RED,
    colors_default.WARM_VIOLET
  ],
  /*
   * ==================== 方案 2：冷色系（关卡 64-95） ====================
   */
  [
    colors_default.COOL_TEAL,
    colors_default.COOL_GREEN,
    colors_default.COOL_ORANGE,
    colors_default.COOL_YELLOW,
    colors_default.COOL_BLUE,
    colors_default.COOL_PINK,
    colors_default.COOL_RED,
    colors_default.COOL_VIOLET
  ],
  /*
   * ==================== 方案 3：糖果色（关卡 96-127） ====================
   */
  [
    colors_default.CANDY_TEAL,
    colors_default.CANDY_GREEN,
    colors_default.CANDY_ORANGE,
    colors_default.CANDY_YELLOW,
    colors_default.CANDY_BLUE,
    colors_default.CANDY_PINK,
    colors_default.CANDY_RED,
    colors_default.CANDY_VIOLET
  ],
  /*
   * ==================== 方案 4：森林色（关卡 128-159） ====================
   */
  [
    colors_default.FOREST_TEAL,
    colors_default.FOREST_GREEN,
    colors_default.FOREST_ORANGE,
    colors_default.FOREST_YELLOW,
    colors_default.FOREST_BLUE,
    colors_default.FOREST_PINK,
    colors_default.FOREST_RED,
    colors_default.FOREST_VIOLET
  ],
  /*
   * ==================== 方案 5：日落色（关卡 160-191） ====================
   */
  [
    colors_default.SUNSET_TEAL,
    colors_default.SUNSET_GREEN,
    colors_default.SUNSET_ORANGE,
    colors_default.SUNSET_YELLOW,
    colors_default.SUNSET_BLUE,
    colors_default.SUNSET_PINK,
    colors_default.SUNSET_RED,
    colors_default.SUNSET_VIOLET
  ],
  /*
   * ==================== 方案 6：霓虹色（关卡 192-223） ====================
   */
  [
    colors_default.NEON_TEAL,
    colors_default.NEON_GREEN,
    colors_default.NEON_ORANGE,
    colors_default.NEON_YELLOW,
    colors_default.NEON_BLUE,
    colors_default.NEON_PINK,
    colors_default.NEON_RED,
    colors_default.NEON_VIOLET
  ],
  /*
   * ==================== 方案 7：宝石色（关卡 224-255） ====================
   */
  [
    colors_default.JEWEL_TEAL,
    colors_default.JEWEL_GREEN,
    colors_default.JEWEL_ORANGE,
    colors_default.JEWEL_YELLOW,
    colors_default.JEWEL_BLUE,
    colors_default.JEWEL_PINK,
    colors_default.JEWEL_RED,
    colors_default.JEWEL_VIOLET
  ]
];

// lib/game/constants/shapes.js
var SHAPES = [
  /**
   * ## I 型方块（标准长条）
   *
   * 形状：1 行 4 列 colorIndex: 0（TEAL 系）
   */
  { shape: [[1, 1, 1, 1]], colorIndex: 0, type: "I", rotation: 0 },
  /**
   * ## I 型方块（加长版）
   *
   * 形状：1 行 5 列 colorIndex: 1（GREEN 系）
   */
  { shape: [[1, 1, 1, 1, 1]], colorIndex: 1, type: "I5", rotation: 0 },
  /**
   * ## O 型方块（正方形）
   *
   * 形状：2×2 实心方块，旋转后形状不变 colorIndex: 2（ORANGE 系）
   */
  {
    shape: [
      [1, 1],
      [1, 1]
    ],
    colorIndex: 2,
    type: "O",
    rotation: 0
  },
  /**
   * ## T 型方块
   *
   * 形状：第一行中间一个，第二行三个 colorIndex: 3（YELLOW 系）
   */
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    colorIndex: 3,
    type: "T",
    rotation: 0
  },
  /**
   * ## L 型方块
   *
   * 形状：第一行左侧一个，第二行三个 colorIndex: 4（BLUE 系）
   */
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    colorIndex: 4,
    type: "L",
    rotation: 0
  },
  /**
   * ## J 型方块（反 L 型）
   *
   * 形状：第一行右侧一个，第二行三个 colorIndex: 5（PINK 系）
   */
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    colorIndex: 5,
    type: "J",
    rotation: 0
  },
  /**
   * ## S 型方块（右斜）
   *
   * 形状：第一行右侧两个，第二行左侧两个 colorIndex: 6（RED 系）
   */
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    colorIndex: 6,
    type: "S",
    rotation: 0
  },
  /**
   * ## Z 型方块（左斜）
   *
   * 形状：第一行左侧两个，第二行右侧两个 colorIndex: 7（VIOLET 系）
   */
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    colorIndex: 7,
    type: "Z",
    rotation: 0
  }
];
var shapes_default = SHAPES;

// lib/game/utils/refill-bag.js
var isFirstBag = true;
var refillBag = () => {
  let bag2 = [...shapes_default].toSorted(() => Math.random() - 0.5);
  if (isFirstBag) {
    while ([3, 6, 7].includes(bag2[0].colorIndex)) {
      bag2 = [...shapes_default].toSorted(() => Math.random() - 0.5);
    }
  }
  isFirstBag = false;
  return bag2;
};
refillBag._reset = () => {
  isFirstBag = true;
};

// lib/game/utils/random-shape.js
var bag = [];
var getBagSnapshot = () => [...bag];

// lib/ai/snapshot/create-snapshot.js
var createSnapshot = (state) => structuredClone({
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
  piece: state.curr ? {
    shape: state.curr.shape,
    position: {
      x: state.cx,
      y: state.cy
    }
  } : null,
  // 游戏模式
  mode: state.mode,
  // 7-bag 状态（供 AI 确定性前瞻）
  bag: getBagSnapshot(),
  hold: state.hold || null
});
var create_snapshot_default = createSnapshot;

// lib/worker/ai-worker.js
globalThis.addEventListener("message", (e) => {
  const { type, state, weights, depth, beam } = e.data;
  if (type !== "think") return;
  try {
    const snapshot = create_snapshot_default(state);
    const best = self_play_default(snapshot, weights, depth, beam);
    globalThis.postMessage({
      type: "result",
      best: best ? { actions: best.actions, y: best.y } : null
    });
  } catch (error) {
    globalThis.postMessage({ type: "error", error: error.message });
  }
});
