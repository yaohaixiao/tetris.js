var tetris = (() => {
  // lib/state/game-state.js
  var GameState = {
    rafId: null,
    timestamp: null,
    board: [],
    curr: null,
    cx: 0,
    cy: 0,
    next: null,
    score: 0,
    baseLines: 0,
    lines: 0,
    level: 1,
    highScore: 0,
    isSelectLevel: true,
    isHiddenMode: false,
    isPaused: false,
    isGameOver: false,
    holdTimer: null,
    bgmEnabled: true,
    bgmTimer: null,
  };
  var game_state_default = GameState;

  // lib/constants/board.js
  var COLS = 10;
  var ROWS = 20;
  var BOARD = {
    COLS,
    ROWS,
  };
  var board_default = BOARD;

  // lib/state/reset-board.js
  var resetBoard = () => {
    const { COLS: COLS2, ROWS: ROWS2 } = board_default;
    game_state_default.board = Array.from({ length: ROWS2 }, () =>
      Array.from({ length: COLS2 }).fill(0),
    );
  };
  var reset_board_default = resetBoard;

  // lib/utils/get-storage.js
  var getStorage = (key) => localStorage.getItem(key);
  var get_storage_default = getStorage;

  // lib/state/load-high-score.js
  var loadHighScore = () => {
    game_state_default.highScore =
      Number.parseInt(get_storage_default('tetris-high-score'), 10) || 0;
  };
  var load_high_score_default = loadHighScore;

  // lib/ui/canvas.js
  var gameBoard = document.querySelector('#game-board');
  var gameBoardContext = gameBoard.getContext('2d');
  var nextPiece = document.querySelector('#next-piece');
  var nextPieceContext = nextPiece.getContext('2d');
  var fontSize = 0;
  var blockSize = 0;
  var Canvas = {
    gameBoard,
    gameBoardContext,
    nextPiece,
    nextPieceContext,
    fontSize,
    blockSize,
  };
  var canvas_default = Canvas;

  // lib/constants/colors.js
  var TEAL = '#18c8fa';
  var RGBA_TEAL = 'rgba(50, 190, 239, 0.3)';
  var YELLOW = '#ff0';
  var PURPLE = '#a0a';
  var BLUE = '#00f';
  var ORANGE = '#ff7f00';
  var GREEN = '#0f0';
  var RED = '#f00';
  var BLACK = '#444';
  var RGBA_BLACK = 'rgba(0,0,0,.5)';
  var WHITE = '#fff';
  var FIREWORKS = [TEAL, YELLOW, PURPLE, ORANGE, GREEN, RED];
  var COLORS = {
    TEAL,
    RGBA_TEAL,
    YELLOW,
    PURPLE,
    BLUE,
    ORANGE,
    GREEN,
    RED,
    BLACK,
    RGBA_BLACK,
    WHITE,
    FIREWORKS,
  };
  var colors_default = COLORS;

  // lib/constants/game.js
  var CLEAR_SCORES = [0, 100, 300, 500, 800];
  var FONT_FAMILY = `"Press Start 2P", monospace, sans-serif`;
  var MAX_LEVEL = 99;
  var GAME = {
    CLEAR_SCORES,
    MAX_LEVEL,
    FONT_FAMILY,
  };
  var game_default = GAME;

  // lib/ui/clear-board.js
  function clearBoard() {
    const { gameBoard: gameBoard2, gameBoardContext: gameBoardContext2 } =
      canvas_default;
    const { width, height } = gameBoard2;
    gameBoardContext2.clearRect(0, 0, width, height);
  }
  var clear_board_default = clearBoard;

  // lib/ui/draw-tetris-text.js
  var drawTetrisText = () => {
    const { GREEN: GREEN3 } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: gameBoardContext2,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    gameBoardContext2.save();
    gameBoardContext2.textAlign = 'center';
    gameBoardContext2.font = `${fontSize2 * 1.1}px ${FONT_FAMILY2}`;
    gameBoardContext2.fillStyle = GREEN3;
    gameBoardContext2.fillText('TETRIS.JS', width / 2, height * 0.1);
    gameBoardContext2.restore();
  };
  var draw_tetris_text_default = drawTetrisText;

  // lib/ui/draw-enter-start-text.js
  var drawEnterStartText = () => {
    const { TEAL: TEAL3 } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: gameBoardContext2,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    gameBoardContext2.save();
    gameBoardContext2.textAlign = 'center';
    gameBoardContext2.font = `${fontSize2 * 1.15}px ${FONT_FAMILY2}`;
    gameBoardContext2.fillStyle = TEAL3;
    gameBoardContext2.fillText('ENTER START', width / 2, height * 0.7);
    gameBoardContext2.restore();
  };
  var draw_enter_start_text_default = drawEnterStartText;

  // lib/ui/draw-level-select.js
  var drawLevelSelect = (level) => {
    const {
      RGBA_BLACK: RGBA_BLACK2,
      GREEN: GREEN3,
      WHITE: WHITE2,
    } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: gameBoardContext2,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    clear_board_default();
    gameBoardContext2.save();
    gameBoardContext2.fillStyle = RGBA_BLACK2;
    gameBoardContext2.fillRect(0, 0, width, height);
    draw_tetris_text_default();
    gameBoardContext2.save();
    gameBoardContext2.textAlign = 'center';
    gameBoardContext2.font = `${fontSize2}px ${FONT_FAMILY2}`;
    gameBoardContext2.fillStyle = GREEN3;
    gameBoardContext2.fillText('LEVEL', width / 2, height * 0.35);
    gameBoardContext2.restore();
    gameBoardContext2.save();
    gameBoardContext2.textAlign = 'center';
    gameBoardContext2.font = `${fontSize2 * 3}px ${FONT_FAMILY2}`;
    gameBoardContext2.fillStyle = GREEN3;
    gameBoardContext2.fillText(level.toString(), width / 2, height * 0.5);
    gameBoardContext2.restore();
    gameBoardContext2.save();
    gameBoardContext2.textAlign = 'center';
    gameBoardContext2.font = `${fontSize2}px ${FONT_FAMILY2}`;
    gameBoardContext2.fillStyle = WHITE2;
    gameBoardContext2.fillText('1-9 KEY', width / 2, height * 0.58);
    gameBoardContext2.restore();
    draw_enter_start_text_default();
    gameBoardContext2.save();
    gameBoardContext2.textAlign = 'center';
    gameBoardContext2.font = `${fontSize2 * 0.9}px ${FONT_FAMILY2}`;
    gameBoardContext2.fillStyle = WHITE2;
    gameBoardContext2.fillText('P 3SEC: HIDDEN', width / 2, height * 0.8);
    gameBoardContext2.restore();
    gameBoardContext2.restore();
  };
  var draw_level_select_default = drawLevelSelect;

  // lib/ui/draw-block.js
  var drawBlock = (ctx, x, y, color) => {
    const { BLACK: BLACK2 } = colors_default;
    const { blockSize: blockSize2 } = canvas_default;
    const bs = blockSize2;
    const gap = 1;
    const size = bs - gap * 2;
    const px = x * bs + gap;
    const py = y * bs + gap;
    ctx.fillStyle = color;
    ctx.fillRect(px, py, size, size);
    ctx.strokeStyle = BLACK2;
    ctx.strokeRect(px, py, size, size);
  };
  var draw_block_default = drawBlock;

  // lib/ui/draw-board.js
  function drawBoard(board) {
    const { ROWS: ROWS2, COLS: COLS2 } = board_default;
    const { gameBoardContext: gameBoardContext2 } = canvas_default;
    clear_board_default();
    for (let y = 0; y < ROWS2; y++) {
      for (let x = 0; x < COLS2; x++) {
        if (board[y][x]) {
          draw_block_default(gameBoardContext2, x, y, board[y][x]);
        }
      }
    }
  }
  var draw_board_default = drawBoard;

  // lib/ui/draw-curr.js
  var drawCurr = (curr, cx, cy) => {
    const { gameBoardContext: gameBoardContext2 } = canvas_default;
    const { shape, color } = curr;
    const { length } = shape;
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          draw_block_default(gameBoardContext2, cx + x, cy + y, color);
        }
      }
    }
    return true;
  };
  var draw_curr_default = drawCurr;

  // lib/ui/clear-next.js
  var clearNext = () => {
    const { nextPiece: nextPiece2, nextPieceContext: nextPieceContext2 } =
      canvas_default;
    const { width, height } = nextPiece2;
    nextPieceContext2.clearRect(0, 0, width, height);
  };
  var clear_next_default = clearNext;

  // lib/ui/draw-next.js
  var drawNext = (next) => {
    const { BLACK: BLACK2 } = colors_default;
    const { nextPiece: nextPiece2, nextPieceContext: nextPieceContext2 } =
      canvas_default;
    const { shape } = next;
    const { width, height } = nextPiece2;
    const gridSize = 5;
    const blockSize2 = Math.floor(width / gridSize);
    const ox = Math.floor((width - shape[0].length * blockSize2) / 2);
    const oy = Math.floor((height - shape.length * blockSize2) / 2);
    clear_next_default();
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const px = ox + x * blockSize2;
          const py = oy + y * blockSize2;
          nextPieceContext2.fillStyle = next.color;
          nextPieceContext2.fillRect(px, py, blockSize2 - 2, blockSize2 - 2);
          nextPieceContext2.strokeStyle = BLACK2;
          nextPieceContext2.strokeRect(px, py, blockSize2 - 2, blockSize2 - 2);
        }
      }
    }
  };
  var draw_next_default = drawNext;

  // lib/ui/resize.js
  var resize = () => {
    const { ROWS: ROWS2, COLS: COLS2 } = board_default;
    const { gameBoard: gameBoard2, nextPiece: nextPiece2 } = canvas_default;
    const { isSelectLevel, isGameOver, board, curr, cx, cy, level, next } =
      game_state_default;
    const h = globalThis.innerHeight * 0.9;
    canvas_default.blockSize = Math.floor(h / ROWS2);
    gameBoard2.width = canvas_default.blockSize * COLS2;
    gameBoard2.height = canvas_default.blockSize * ROWS2;
    canvas_default.fontSize = Math.floor(gameBoard2.height * 0.032);
    const nextSize = Math.min(
      globalThis.innerWidth * 0.1,
      globalThis.innerHeight * 0.18,
    );
    nextPiece2.width = nextSize;
    nextPiece2.height = nextSize;
    if (isSelectLevel || isGameOver) {
      draw_level_select_default(level);
    } else {
      draw_board_default(board);
      draw_next_default(next);
      if (curr) {
        draw_curr_default(curr, cx, cy);
      }
    }
  };
  var resize_default = resize;

  // lib/utils/pad.js
  var pad = (n, len) => n.toString().padStart(len, '0');
  var pad_default = pad;

  // lib/ui/update-ui.js
  var updateUI = (score, lines, level, highScore) => {
    document.querySelector('#score').textContent = pad_default(score, 5);
    document.querySelector('#lines').textContent = pad_default(lines, 2);
    document.querySelector('#level').textContent = pad_default(level, 2);
    document.querySelector('#highScore').textContent = pad_default(
      highScore,
      5,
    );
  };
  var update_ui_default = updateUI;

  // lib/ui/lazy-draw-level-select.js
  var lazyDrawLevelSelect = () => {
    if (document?.fonts?.load) {
      document.fonts.load('40px "Press Start 2P"').then(() => {
        draw_level_select_default(game_state_default.level);
      });
    } else {
      setTimeout(() => {
        draw_level_select_default(game_state_default.level);
      }, 150);
    }
  };
  var lazy_draw_level_select_default = lazyDrawLevelSelect;

  // lib/events/on-resize.js
  var onResize = () => {
    resize_default();
  };
  var on_resize_default = onResize;

  // lib/ui/effects.js
  var countdown = {
    show: false,
    number: 3,
    scale: 4,
    count: 0,
    rafId: null,
    timestamp: 0,
  };
  var clock = {
    rafId: null,
    count: 0,
    timestamp: 0,
  };
  var clear = {
    rafId: null,
    lines: [],
  };
  var levelUp = {
    show: false,
    timer: 0,
    fireworks: [],
  };
  var Effects = {
    countdown,
    clock,
    clear,
    levelUp,
  };
  var effects_default = Effects;

  // lib/audio/play-tone.js
  var audioCtx = new AudioContext();
  var playTone = (freq, dur, vol = 0.1, wave = 'square') => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
    }, dur);
  };
  var play_tone_default = playTone;

  // lib/audio/sounds.js
  var Sounds = {
    // 等级选择音效（正弦波柔和音效）
    levelSelect: () => play_tone_default(523, 80, 0.1, 'sine'),
    // 等级开始音效
    levelStart: () => play_tone_default(1319, 160, 0.22, 'sine'),
    // 开始倒计时音效
    countdown: () => play_tone_default(784, 180, 0.3, 'sine'),
    // 方块移动音效
    move: () => play_tone_default(330, 60),
    // 方块旋转音效
    rotate: () => play_tone_default(440, 60),
    // 方块快速下落音效
    drop: () => play_tone_default(220, 100),
    // 方块落地音效
    fall: () => play_tone_default(180, 200),
    // 方块消除音效（三连音旋律）
    clear: () => {
      play_tone_default(587, 220, 0.35, 'square');
      setTimeout(() => play_tone_default(698, 260, 0.32, 'square'), 160);
      setTimeout(() => play_tone_default(880, 300, 0.3, 'square'), 320);
      setTimeout(() => play_tone_default(1174, 380, 0.25, 'square'), 480);
    },
    // 升级庆祝音效
    levelUp: () => {
      play_tone_default(523, 220);
      setTimeout(() => play_tone_default(587, 220), 260);
      setTimeout(() => play_tone_default(659, 240), 520);
      setTimeout(() => play_tone_default(784, 260), 780);
      setTimeout(() => play_tone_default(880, 280), 1060);
      setTimeout(() => play_tone_default(1047, 320), 1360);
      setTimeout(() => play_tone_default(1175, 360), 1700);
      setTimeout(() => play_tone_default(1319, 480), 2080);
    },
    // 暂停游戏音效
    pause: () => play_tone_default(300, 150),
    // 秒针走动音效
    secondTick: () => play_tone_default(880, 50, 0.085, 'sine'),
    // 恢复游戏音效
    resume: () => play_tone_default(400, 150),
    // 游戏结束音效（悲伤旋律）
    gameOver: () => {
      play_tone_default(330, 200);
      setTimeout(() => play_tone_default(294, 300), 210);
      setTimeout(() => play_tone_default(262, 500), 520);
    },
    // 背景音乐开关音效
    bgmToggle: () => play_tone_default(440, 100),
  };
  var sounds_default = Sounds;

  // lib/ui/draw-countdown-effect.js
  var drawCountdownEffect = () => {
    const {
      YELLOW: YELLOW3,
      BLACK: BLACK2,
      RGBA_BLACK: RGBA_BLACK2,
      GREEN: GREEN3,
    } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: gameBoardContext2,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    const effect = effects_default.countdown;
    clear_board_default();
    gameBoardContext2.save();
    gameBoardContext2.fillStyle = RGBA_BLACK2;
    gameBoardContext2.fillRect(0, 0, width, height);
    draw_tetris_text_default();
    gameBoardContext2.save();
    gameBoardContext2.textAlign = 'center';
    gameBoardContext2.textBaseline = 'middle';
    gameBoardContext2.translate(width / 2, height / 2);
    gameBoardContext2.scale(effect.scale, effect.scale);
    gameBoardContext2.font = `${fontSize2 * 3.25}px ${FONT_FAMILY2}`;
    gameBoardContext2.fillStyle = YELLOW3;
    gameBoardContext2.strokeStyle = BLACK2;
    gameBoardContext2.lineWidth = 6;
    gameBoardContext2.strokeText(effect.number.toString(), 0, 0);
    gameBoardContext2.fillText(effect.number.toString(), 0, 0);
    gameBoardContext2.restore();
    gameBoardContext2.save();
    gameBoardContext2.textAlign = 'center';
    gameBoardContext2.textBaseline = 'top';
    gameBoardContext2.font = `${fontSize2 * 1.1}px ${FONT_FAMILY2}`;
    gameBoardContext2.fillStyle = GREEN3;
    gameBoardContext2.strokeStyle = BLACK2;
    gameBoardContext2.strokeText('GET READY!', width / 2, height / 1.46);
    gameBoardContext2.fillText('GET READY!', width / 2, height / 1.46);
    gameBoardContext2.restore();
    gameBoardContext2.restore();
  };
  var draw_countdown_effect_default = drawCountdownEffect;

  // lib/audio/loop-play-bgm.js
  var loopPlayBGM = (i, m) => {
    if (i >= m.length) {
      i = 0;
    }
    play_tone_default(m[i], 110, 0.05);
    game_state_default.bgmTimer = setTimeout(() => {
      loopPlayBGM(i + 1, m);
    }, 130);
  };
  var loop_play_bgm_default = loopPlayBGM;

  // lib/audio/stop-bgm.js
  var stopBGM = () => {
    if (game_state_default.bgmTimer) {
      clearTimeout(game_state_default.bgmTimer);
    }
    game_state_default.bgmTimer = null;
  };
  var stop_bgm_default = stopBGM;

  // lib/audio/play-bgm.js
  var playBGM = () => {
    const { bgmEnabled } = game_state_default;
    const m = [
      659, 659, 587, 659, 784, 880, 523, 523, 440, 523, 659, 784, 659, 659, 587,
      659, 784, 880, 988, 880, 784, 659, 880, 784, 659, 587, 523, 587, 659, 784,
      659, 587,
    ];
    if (!bgmEnabled) {
      return false;
    }
    stop_bgm_default();
    loop_play_bgm_default(0, m);
  };
  var play_bgm_default = playBGM;

  // lib/constants/tetrominoes.js
  var {
    BLUE: BLUE2,
    TEAL: TEAL2,
    YELLOW: YELLOW2,
    PURPLE: PURPLE2,
    ORANGE: ORANGE2,
    GREEN: GREEN2,
    RED: RED2,
  } = colors_default;
  var TETROMINOES = [
    // I型方块（长条）：1行4列
    { shape: [[1, 1, 1, 1]], color: TEAL2 },
    // O型方块（正方形）：2x2
    {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: YELLOW2,
    },
    // T型方块
    {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      color: PURPLE2,
    },
    // L型方块
    {
      shape: [
        [1, 0, 0],
        [1, 1, 1],
      ],
      color: BLUE2,
    },
    // J型方块
    {
      shape: [
        [0, 0, 1],
        [1, 1, 1],
      ],
      color: ORANGE2,
    },
    // S型方块（右斜）
    {
      shape: [
        [0, 1, 1],
        [1, 1, 0],
      ],
      color: GREEN2,
    },
    // Z型方块（左斜）
    {
      shape: [
        [1, 1, 0],
        [0, 1, 1],
      ],
      color: RED2,
    },
  ];
  var tetrominoes_default = TETROMINOES;

  // lib/game/random-tetromino.js
  function randomTetromino() {
    const randomIndex = Math.floor(Math.random() * tetrominoes_default.length);
    return tetrominoes_default[randomIndex];
  }
  var random_tetromino_default = randomTetromino;

  // lib/game/collision.js
  var collision = (ox, oy) => {
    const { ROWS: ROWS2, COLS: COLS2 } = board_default;
    const s = game_state_default.curr.shape;
    for (let y = 0; y < s.length; y++) {
      for (let x = 0; x < s[y].length; x++) {
        if (s[y][x]) {
          const nx = game_state_default.cx + x + ox;
          const ny = game_state_default.cy + y + oy;
          if (
            nx < 0 ||
            nx >= COLS2 ||
            ny >= ROWS2 ||
            (ny >= 0 && game_state_default.board[ny][nx])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };
  var collision_default = collision;

  // lib/utils/set-storage.js
  var setStorage = (key, value) => {
    localStorage.setItem(key, value);
  };
  var set_storage_default = setStorage;

  // lib/state/save-high-score.js
  var saveHighScore = () => {
    const { score } = game_state_default;
    if (score > game_state_default.highScore) {
      game_state_default.highScore = score;
      set_storage_default(
        'tetris-high-score',
        game_state_default.highScore.toString(),
      );
    }
  };
  var save_high_score_default = saveHighScore;

  // lib/ui/draw-over.js
  var drawOver = () => {
    const {
      RGBA_BLACK: RGBA_BLACK2,
      RED: RED3,
      YELLOW: YELLOW3,
    } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: gameBoardContext2,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    gameBoardContext2.fillStyle = RGBA_BLACK2;
    gameBoardContext2.fillRect(0, 0, width, height);
    draw_tetris_text_default();
    gameBoardContext2.save();
    gameBoardContext2.fillStyle = RED3;
    gameBoardContext2.strokeStyle = YELLOW3;
    gameBoardContext2.textAlign = 'center';
    gameBoardContext2.font = `${fontSize2 * 2.3}px ${FONT_FAMILY2}`;
    gameBoardContext2.strokeText('GAME', width / 2, height / 2.2);
    gameBoardContext2.fillText('GAME', width / 2, height / 2.2);
    gameBoardContext2.restore();
    gameBoardContext2.save();
    gameBoardContext2.fillStyle = RED3;
    gameBoardContext2.strokeStyle = YELLOW3;
    gameBoardContext2.textAlign = 'center';
    gameBoardContext2.font = `${fontSize2 * 2.3}px ${FONT_FAMILY2}`;
    gameBoardContext2.strokeText('OVER', width / 2, height / 1.8);
    gameBoardContext2.fillText('OVER', width / 2, height / 1.8);
    gameBoardContext2.restore();
    draw_enter_start_text_default();
  };
  var draw_over_default = drawOver;

  // lib/game/game-over.js
  var gameOver = () => {
    if (game_state_default.isGameOver) {
      return false;
    }
    game_state_default.isGameOver = true;
    stop_bgm_default();
    cancelAnimationFrame(game_state_default.rafId);
    sounds_default.gameOver();
    save_high_score_default();
    setTimeout(draw_over_default, 20);
  };
  var game_over_default = gameOver;

  // lib/game/spawn.js
  var spawn = () => {
    const { COLS: COLS2 } = board_default;
    game_state_default.curr =
      game_state_default.next || random_tetromino_default();
    game_state_default.next = random_tetromino_default();
    game_state_default.cx =
      Math.floor(COLS2 / 2) -
      Math.floor(game_state_default.curr.shape[0].length / 2);
    game_state_default.cy = 0;
    draw_next_default(game_state_default.next);
    if (collision_default(0, 0)) {
      game_over_default();
    }
  };
  var spawn_default = spawn;

  // lib/game/get-speed.js
  var getSpeed = () =>
    // 计算速度：基础值1000ms，每升一级减少80ms，最低不低于100ms
    Math.max(100, 1e3 - (game_state_default.level - 1) * 80);
  var get_speed_default = getSpeed;

  // lib/ui/update-level-up-effect.js
  var updateLevelUpEffect = () => {
    const effect = effects_default.levelUp;
    effect.timer += 1;
    if (effect.timer > 3) {
      effect.show = false;
      effect.fireworks = [];
      play_bgm_default();
      return true;
    }
    return false;
  };
  var update_level_up_effect_default = updateLevelUpEffect;

  // lib/ui/draw-fireworks-effect.js
  var drawFireworksEffect = () => {
    const effect = effects_default.levelUp;
    const { gameBoardContext: gameBoardContext2 } = canvas_default;
    for (const fire of effect.fireworks) {
      gameBoardContext2.globalAlpha = fire.alpha;
      gameBoardContext2.fillStyle = fire.color;
      gameBoardContext2.beginPath();
      gameBoardContext2.arc(fire.x, fire.y, fire.radius, 0, Math.PI * 2);
      gameBoardContext2.fill();
      fire.x += fire.vx;
      fire.y += fire.vy;
      fire.alpha -= 0.024;
    }
  };
  var draw_fireworks_effect_default = drawFireworksEffect;

  // lib/ui/draw-level-up-effect.js
  function drawLevelUpEffect() {
    const {
      RGBA_BLACK: RGBA_BLACK2,
      BLACK: BLACK2,
      GREEN: GREEN3,
      YELLOW: YELLOW3,
    } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: gameBoardContext2,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    const effect = effects_default.levelUp;
    if (!effect.show) {
      return false;
    }
    gameBoardContext2.save();
    gameBoardContext2.fillStyle = RGBA_BLACK2;
    gameBoardContext2.fillRect(0, 0, width, height);
    draw_tetris_text_default();
    gameBoardContext2.save();
    gameBoardContext2.textAlign = 'center';
    gameBoardContext2.font = `${fontSize2 * 1.2}px ${FONT_FAMILY2}`;
    gameBoardContext2.fillStyle = GREEN3;
    gameBoardContext2.fillText(`LEVEL UP`, width / 2, height / 2.5);
    gameBoardContext2.restore();
    gameBoardContext2.save();
    gameBoardContext2.textAlign = 'center';
    gameBoardContext2.font = `${fontSize2 * 2.5}px ${FONT_FAMILY2}`;
    gameBoardContext2.fillStyle = GREEN3;
    gameBoardContext2.fillText(
      `${game_state_default.level}`,
      width / 2,
      height / 1.85,
    );
    gameBoardContext2.restore();
    gameBoardContext2.save();
    gameBoardContext2.textAlign = 'center';
    gameBoardContext2.font = `${fontSize2 * 1.3}px ${FONT_FAMILY2}`;
    gameBoardContext2.fillStyle = YELLOW3;
    gameBoardContext2.strokeStyle = BLACK2;
    gameBoardContext2.lineWidth = 3;
    gameBoardContext2.strokeText('CONGRATS!', width / 2, height / 1.6);
    gameBoardContext2.fillText('CONGRATS!', width / 2, height / 1.6);
    gameBoardContext2.restore();
    draw_fireworks_effect_default();
    gameBoardContext2.restore();
    return true;
  }
  var draw_level_up_effect_default = drawLevelUpEffect;

  // lib/game/move.js
  var move = (ox, oy) => {
    if (!collision_default(ox, oy)) {
      game_state_default.cx += ox;
      game_state_default.cy += oy;
      sounds_default.move();
      return true;
    }
    return false;
  };
  var move_default = move;

  // lib/game/lock.js
  var lock = () => {
    const { curr } = game_state_default;
    const s = curr.shape;
    for (let y = 0; y < s.length; y++) {
      for (let x = 0; x < s[y].length; x++) {
        if (s[y][x]) {
          game_state_default.board[game_state_default.cy + y][
            game_state_default.cx + x
          ] = curr.color;
        }
      }
    }
  };
  var lock_default = lock;

  // lib/ui/add-clear-effect.js
  var addClearEffect = (y) => {
    const effect = effects_default.clear;
    const isLineContains = effect.lines.some((line) => line.y === y);
    if (!isLineContains) {
      effect.lines.push({ y, alpha: 1, timer: 0 });
    }
  };
  var add_clear_effect_default = addClearEffect;

  // lib/ui/draw-clear-effect.js
  var drawClearEffect = () => {
    const { COLS: COLS2 } = board_default;
    const { gameBoardContext: gameBoardContext2 } = canvas_default;
    const effect = effects_default.clear;
    for (const line of effect.lines) {
      gameBoardContext2.save();
      gameBoardContext2.globalAlpha = line.alpha;
      for (let x = 0; x < COLS2; x++) {
        draw_block_default(gameBoardContext2, x, line.y, line.color);
      }
      gameBoardContext2.restore();
    }
  };
  var draw_clear_effect_default = drawClearEffect;

  // lib/ui/update-clear-effect.js
  var updateClearEffect = () => {
    const effect = effects_default.clear;
    let allDone = true;
    for (const line of effect.lines) {
      const phase = Math.floor(line.timer / 0.12);
      line.alpha = phase % 2 === 0 ? 1 : 0;
      line.timer += 0.016;
      if (line.timer < 0.72) {
        allDone = false;
      }
    }
    return allDone;
  };
  var update_clear_effect_default = updateClearEffect;

  // lib/ui/trigger-level-up-effect.js
  function triggerLevelUpEffect() {
    const { FIREWORKS: FIREWORKS2 } = colors_default;
    const { gameBoard: gameBoard2 } = canvas_default;
    const { width, height } = gameBoard2;
    const effect = effects_default.levelUp;
    const fireworks = [];
    effect.show = true;
    effect.timer = 0;
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 240;
      fireworks.push({
        // 全部从中心点出发
        x: width / 2,
        y: height / 2 - 60,
        radius: 2 + Math.random() * 4,
        color: FIREWORKS2[Math.floor(Math.random() * 6)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
      });
    }
    effect.fireworks = fireworks;
    stop_bgm_default();
    sounds_default.levelUp();
  }
  var trigger_level_up_effect_default = triggerLevelUpEffect;

  // lib/ui/trigger-clear-effect.js
  var triggerClearEffect = () => {
    const { ROWS: ROWS2, COLS: COLS2 } = board_default;
    const { CLEAR_SCORES: CLEAR_SCORES2, MAX_LEVEL: MAX_LEVEL2 } = game_default;
    const effect = effects_default.clear;
    draw_board_default(game_state_default.board);
    draw_curr_default(
      game_state_default.curr,
      game_state_default.cx,
      game_state_default.cy,
    );
    draw_clear_effect_default();
    if (update_clear_effect_default()) {
      let clear2 = 0;
      for (let y = ROWS2 - 1; y >= 0; y--) {
        const isFullLine = game_state_default.board[y].every((cell) => !!cell);
        if (isFullLine) {
          game_state_default.board.splice(y, 1);
          game_state_default.board.unshift(
            Array.from({ length: COLS2 }).fill(0),
          );
          clear2++;
          y++;
        }
      }
      game_state_default.lines += clear2;
      game_state_default.score +=
        CLEAR_SCORES2[clear2] * game_state_default.level;
      const totalLines =
        game_state_default.baseLines + game_state_default.lines;
      const newLevel = Math.floor(totalLines / 10) + 1;
      const oldLevel = game_state_default.level;
      if (newLevel > oldLevel) {
        trigger_level_up_effect_default();
      }
      game_state_default.level = Math.min(
        Math.max(game_state_default.level, newLevel),
        MAX_LEVEL2,
      );
      update_speed_default();
      update_ui_default(
        game_state_default.score,
        game_state_default.lines,
        game_state_default.level,
        game_state_default.highScore,
      );
      save_high_score_default();
      effect.lines = [];
      cancelAnimationFrame(effect.rafId);
    } else {
      effect.rafId = requestAnimationFrame(triggerClearEffect);
    }
  };
  var trigger_clear_effect_default = triggerClearEffect;

  // lib/game/clear-lines.js
  var clearLines = () => {
    const { ROWS: ROWS2 } = board_default;
    let clear2 = 0;
    const linesToClear = [];
    for (let y = ROWS2 - 1; y >= 0; y--) {
      const isLineFull = game_state_default.board[y].every((cell) => !!cell);
      if (isLineFull) {
        linesToClear.push(y);
        clear2++;
      }
    }
    if (clear2 === 0) {
      update_ui_default(
        game_state_default.score,
        game_state_default.lines,
        game_state_default.level,
        game_state_default.highScore,
      );
      save_high_score_default();
      return false;
    }
    for (const y of linesToClear) {
      add_clear_effect_default(y);
    }
    sounds_default.clear();
    trigger_clear_effect_default();
    return true;
  };
  var clear_lines_default = clearLines;

  // lib/game/loop.js
  var loop = () => {
    if (effects_default.levelUp.show) {
      update_level_up_effect_default();
      draw_board_default(game_state_default.board);
      draw_curr_default(
        game_state_default.curr,
        game_state_default.cx,
        game_state_default.cy,
      );
      draw_level_up_effect_default();
      return true;
    }
    if (game_state_default.isGameOver || game_state_default.isPaused) {
      return false;
    }
    if (!move_default(0, 1)) {
      lock_default();
      sounds_default.fall();
      clear_lines_default();
      spawn_default();
      if (game_state_default.isGameOver) {
        return false;
      }
    }
    draw_board_default(game_state_default.board);
    draw_curr_default(
      game_state_default.curr,
      game_state_default.cx,
      game_state_default.cy,
    );
    return true;
  };
  var loop_default = loop;

  // lib/game/update-main-loop.js
  var updateMainLoop = (timestamp) => {
    const dropInterval = get_speed_default();
    if (
      !game_state_default.timestamp ||
      timestamp - game_state_default.timestamp > dropInterval
    ) {
      loop_default();
      game_state_default.timestamp = timestamp;
    }
    game_state_default.rafId = requestAnimationFrame(updateMainLoop);
  };
  var update_main_loop_default = updateMainLoop;

  // lib/game/update-speed.js
  var updateSpeed = () => {
    cancelAnimationFrame(game_state_default.rafId);
    game_state_default.rafId = requestAnimationFrame(update_main_loop_default);
  };
  var update_speed_default = updateSpeed;

  // lib/game/start-game.js
  var startGame = () => {
    const $level = document.querySelector('#level');
    if ($level) {
      $level.textContent = pad_default(game_state_default.level, 2);
    }
    spawn_default();
    sounds_default.levelStart();
    setTimeout(() => {
      play_bgm_default();
    }, 250);
    update_speed_default();
  };
  var start_game_default = startGame;

  // lib/ui/update-countdown-effect.js
  function updateCountdownEffect(timestamp) {
    const effect = effects_default.countdown;
    if (!effect.timestamp || timestamp - effect.timestamp > 100) {
      draw_countdown_effect_default();
      effect.count += 1;
      effect.scale = Math.max(1, effect.scale - 0.4);
      if (effect.count >= 50) {
        effect.count = 0;
        effect.number--;
        effect.scale = 4;
        if (effect.number >= 1) {
          sounds_default.countdown();
        }
      }
      if (effect.number <= 0) {
        cancelAnimationFrame(effect.rafId);
        effect.show = false;
        effect.number = 3;
        effect.scale = 4;
        effect.count = 0;
        effect.rafId = null;
        effect.timestamp = 0;
        start_game_default();
        return true;
      }
    }
    effect.rafId = requestAnimationFrame(updateCountdownEffect);
  }
  var update_countdown_effect_default = updateCountdownEffect;

  // lib/ui/trigger-countdown-effect.js
  function triggerCountdownEffect() {
    const effect = effects_default.countdown;
    effect.show = true;
    effect.number = 3;
    effect.scale = 4;
    effect.count = 0;
    effect.rafId = requestAnimationFrame(update_countdown_effect_default);
    effect.timestamp = 0;
    sounds_default.countdown();
  }
  var trigger_countdown_effect_default = triggerCountdownEffect;

  // lib/core/start.js
  var start = () => {
    game_state_default.isSelectLevel = false;
    game_state_default.baseLines = (game_state_default.level - 1) * 10;
    trigger_countdown_effect_default();
  };
  var start_default = start;

  // lib/core/start-hidden-mode.js
  var startHiddenMode = () => {
    game_state_default.holdTimer = setTimeout(() => {
      game_state_default.isHiddenMode = true;
      game_state_default.level = 5;
      draw_level_select_default(game_state_default.level);
    }, 3e3);
  };
  var start_hidden_mode_default = startHiddenMode;

  // lib/commands/execute-level-selection-command.js
  var executeLevelSelectionCommand = (key) => {
    const lowerKey = key.toLowerCase();
    if (key >= '1' && key <= '9') {
      game_state_default.level = Number.parseInt(key, 10);
      sounds_default.levelSelect();
      draw_level_select_default(game_state_default.level);
    }
    if (lowerKey === 'p') {
      start_hidden_mode_default();
    }
    if (key === 'Enter') {
      start_default();
    }
  };
  var execute_level_selection_command_default = executeLevelSelectionCommand;

  // lib/commands/execute-return-to-level-selection-command.js
  var executeReturnToLevelSelectionCommand = (key) => {
    if (key === 'Enter') {
      stop_bgm_default();
      cancelAnimationFrame(game_state_default.rafId);
      reset_board_default();
      game_state_default.isGameOver = false;
      game_state_default.isHiddenMode = false;
      game_state_default.isSelectLevel = true;
      game_state_default.score = 0;
      game_state_default.lines = 0;
      game_state_default.level = 1;
      game_state_default.next = null;
      update_ui_default(
        game_state_default.score,
        game_state_default.lines,
        game_state_default.level,
        game_state_default.highScore,
      );
      draw_level_select_default(game_state_default.level);
    }
  };
  var execute_return_to_level_selection_command_default =
    executeReturnToLevelSelectionCommand;

  // lib/core/restart-game.js
  var restartGame = () => {
    stop_bgm_default();
    game_state_default.isGameOver = false;
    game_state_default.isPaused = false;
    game_state_default.score = 0;
    game_state_default.lines = 0;
    game_state_default.level = 1;
    reset_board_default();
    update_ui_default(
      game_state_default.score,
      game_state_default.lines,
      game_state_default.level,
      game_state_default.highScore,
    );
    spawn_default();
    play_bgm_default();
    update_speed_default();
  };
  var restart_game_default = restartGame;

  // lib/utils/format-time.js
  var formatTime = (date, format = 'yyyy-MM-dd HH:mm:ss') => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const toSymbol = () => (hours > 12 ? 'PM' : 'AM');
    const hasSymbol = format.includes('a');
    const symbols = {
      yyyy: year,
      MM: pad_default(month, 2),
      dd: pad_default(day, 2),
      HH: pad_default(hours, 2),
      hh: hasSymbol && hours > 12 ? hours - 12 : hours,
      mm: pad_default(minutes, 2),
      ss: pad_default(seconds, 2),
      // a 表示12小时制
      a: toSymbol(),
    };
    let time = format;
    for (const key of Object.keys(symbols)) {
      time = time.replace(key, symbols[key]);
    }
    return time;
  };
  var format_time_default = formatTime;

  // lib/ui/draw-digital-time.js
  var drawDigitalTime = () => {
    const { GREEN: GREEN3, WHITE: WHITE2 } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: gameBoardContext2,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    const time = format_time_default(/* @__PURE__ */ new Date(), 'HH:mm:ss');
    gameBoardContext2.save();
    gameBoardContext2.fillStyle = GREEN3;
    gameBoardContext2.textAlign = 'center';
    gameBoardContext2.font = `${fontSize2 * 0.86}px ${FONT_FAMILY2}`;
    gameBoardContext2.fillText(`${time}`, width / 2, height / 3.65);
    gameBoardContext2.shadowColor = WHITE2;
    gameBoardContext2.shadowBlur = 13;
    gameBoardContext2.shadowOffsetX = 2;
    gameBoardContext2.shadowOffsetY = 2;
    gameBoardContext2.restore();
  };
  var draw_digital_time_default = drawDigitalTime;

  // lib/ui/draw-clock.js
  var drawClock = () => {
    const time = /* @__PURE__ */ new Date();
    const h = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();
    const {
      TEAL: TEAL3,
      RGBA_TEAL: RGBA_TEAL2,
      ORANGE: ORANGE3,
    } = colors_default;
    const { gameBoard: gameBoard2, gameBoardContext: gameBoardContext2 } =
      canvas_default;
    const { width, height } = gameBoard2;
    const centerX = width / 2;
    const centerY = height / 2.2;
    const radius = Math.floor(width * 0.25);
    gameBoardContext2.save();
    gameBoardContext2.translate(centerX, centerY);
    gameBoardContext2.lineCap = 'round';
    gameBoardContext2.strokeStyle = TEAL3;
    gameBoardContext2.fillStyle = TEAL3;
    gameBoardContext2.save();
    gameBoardContext2.beginPath();
    gameBoardContext2.arc(0, 0, radius, 0, Math.PI * 2);
    gameBoardContext2.lineWidth = Math.floor(width * 0.064);
    gameBoardContext2.stroke();
    gameBoardContext2.restore();
    gameBoardContext2.save();
    gameBoardContext2.beginPath();
    gameBoardContext2.arc(0, 0, radius, 0, Math.PI * 2);
    gameBoardContext2.fillStyle = RGBA_TEAL2;
    gameBoardContext2.fill();
    gameBoardContext2.restore();
    const dotRadius = Math.floor(width * 0.016);
    const dotMargin = Math.floor(width * 0.08);
    const dotDistance = radius - dotMargin;
    for (let i = 0; i < 12; i++) {
      gameBoardContext2.save();
      gameBoardContext2.rotate((i * Math.PI) / 6);
      gameBoardContext2.beginPath();
      gameBoardContext2.arc(0, -dotDistance, dotRadius, 0, Math.PI * 2);
      gameBoardContext2.fill();
      gameBoardContext2.restore();
    }
    const hAng = ((h % 12) + m / 60 + s / 3600) * ((2 * Math.PI) / 12);
    gameBoardContext2.save();
    gameBoardContext2.rotate(hAng);
    gameBoardContext2.lineWidth = 5;
    gameBoardContext2.beginPath();
    gameBoardContext2.moveTo(0, 0);
    gameBoardContext2.lineTo(0, -radius * 0.4);
    gameBoardContext2.stroke();
    gameBoardContext2.restore();
    const mAng = (m + s / 60) * ((2 * Math.PI) / 60);
    gameBoardContext2.save();
    gameBoardContext2.rotate(mAng);
    gameBoardContext2.lineWidth = 4;
    gameBoardContext2.beginPath();
    gameBoardContext2.moveTo(0, 0);
    gameBoardContext2.lineTo(0, -radius * 0.65);
    gameBoardContext2.stroke();
    gameBoardContext2.restore();
    const sAng = s * ((2 * Math.PI) / 60);
    gameBoardContext2.save();
    gameBoardContext2.rotate(sAng);
    gameBoardContext2.strokeStyle = ORANGE3;
    gameBoardContext2.lineWidth = 2;
    gameBoardContext2.beginPath();
    gameBoardContext2.moveTo(0, 0);
    gameBoardContext2.lineTo(0, -radius * 0.75);
    gameBoardContext2.stroke();
    gameBoardContext2.restore();
    const pointRadius = Math.floor(width * 0.014);
    gameBoardContext2.save();
    gameBoardContext2.fillStyle = ORANGE3;
    gameBoardContext2.beginPath();
    gameBoardContext2.arc(0, 0, pointRadius, 0, Math.PI * 2);
    gameBoardContext2.fill();
    gameBoardContext2.restore();
    gameBoardContext2.restore();
  };
  var draw_clock_default = drawClock;

  // lib/ui/draw-pause.js
  var drawPause = () => {
    const {
      RGBA_BLACK: RGBA_BLACK2,
      YELLOW: YELLOW3,
      WHITE: WHITE2,
    } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: gameBoardContext2,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    clear_board_default();
    draw_board_default(game_state_default.board);
    draw_curr_default(
      game_state_default.curr,
      game_state_default.cx,
      game_state_default.cy,
    );
    gameBoardContext2.fillStyle = RGBA_BLACK2;
    gameBoardContext2.fillRect(0, 0, width, height);
    draw_tetris_text_default();
    draw_digital_time_default();
    draw_clock_default();
    gameBoardContext2.save();
    gameBoardContext2.fillStyle = YELLOW3;
    gameBoardContext2.textAlign = 'center';
    gameBoardContext2.font = `${fontSize2 * 1.6}px ${FONT_FAMILY2}`;
    gameBoardContext2.fillText('PAUSED', width / 2, height / 1.45);
    gameBoardContext2.shadowColor = WHITE2;
    gameBoardContext2.shadowBlur = 13;
    gameBoardContext2.shadowOffsetX = 2;
    gameBoardContext2.shadowOffsetY = 2;
    gameBoardContext2.restore();
  };
  var draw_pause_default = drawPause;

  // lib/ui/update-draw-pause.js
  var updateDrawPause = (timestamp) => {
    const { isPaused } = game_state_default;
    const effect = effects_default.clock;
    if (!isPaused) {
      return false;
    }
    if (!effect.timestamp || timestamp - effect.timestamp > 100) {
      draw_pause_default();
      effect.count += 1;
      if (effect.count >= 50) {
        effect.count = 0;
        sounds_default.secondTick();
      }
    }
    effect.rafId = requestAnimationFrame(updateDrawPause);
  };
  var update_draw_pause_default = updateDrawPause;

  // lib/core/toggle-pause.js
  var togglePause = () => {
    if (game_state_default.isGameOver || game_state_default.isSelectLevel) {
      return false;
    }
    const effect = effects_default.clock;
    game_state_default.isPaused = !game_state_default.isPaused;
    if (game_state_default.isPaused) {
      cancelAnimationFrame(game_state_default.rafId);
      stop_bgm_default();
      sounds_default.pause();
      effect.rafId = requestAnimationFrame(update_draw_pause_default);
    } else {
      cancelAnimationFrame(effect.rafId);
      effect.rafId = null;
      effect.timestamp = 0;
      effect.count = 0;
      sounds_default.resume();
      play_bgm_default();
      update_speed_default();
    }
  };
  var toggle_pause_default = togglePause;

  // lib/ui/force-over.js
  var forceOver = () => {
    const effect = effects_default.countdown;
    if (game_state_default.isPaused) {
      return false;
    }
    stop_bgm_default();
    game_state_default.isGameOver = true;
    game_state_default.isPaused = false;
    game_state_default.isHiddenMode = false;
    effect.show = false;
    cancelAnimationFrame(game_state_default.rafId);
    sounds_default.gameOver();
    save_high_score_default();
    setTimeout(() => {
      draw_over_default();
    }, 10);
    return true;
  };
  var force_over_default = forceOver;

  // lib/audio/toggle-bgm.js
  var toggleBGM = () => {
    let { bgmEnabled } = game_state_default;
    bgmEnabled = !bgmEnabled;
    sounds_default.bgmToggle();
    if (bgmEnabled) {
      play_bgm_default();
    } else {
      stop_bgm_default();
    }
  };
  var toggle_bgm_default = toggleBGM;

  // lib/commands/execute-shortcuts-commands.js
  var executeShortcutsCommands = (key) => {
    const commands = {
      m: toggle_bgm_default,
      // M: 切换背景音乐
      r: restart_game_default,
      // R: 重新开始游戏
      q: force_over_default,
      // Q: 强制结束游戏
      p: toggle_pause_default,
      // P: 暂停/继续游戏
    };
    const command = commands[key];
    if (command) {
      command();
      return true;
    }
    return false;
  };
  var execute_shortcuts_commands_default = executeShortcutsCommands;

  // lib/game/rotate.js
  var rotate = () => {
    const { curr } = game_state_default;
    const prev = curr.shape;
    curr.shape = prev[0].map((_, i) => prev.map((r) => r[i]).toReversed());
    if (collision_default(0, 0)) {
      curr.shape = prev;
    } else {
      sounds_default.rotate();
    }
  };
  var rotate_default = rotate;

  // lib/game/drop.js
  var drop = () => {
    while (true) {
      if (!move_default(0, 1)) {
        break;
      }
    }
    lock_default();
    sounds_default.fall();
    clear_lines_default();
    spawn_default();
    sounds_default.drop();
  };
  var drop_default = drop;

  // lib/commands/execute-direction-control-commands.js
  var executeDirectionControlCommands = (key) => {
    const controls = {
      ArrowLeft: () => move_default(-1, 0),
      // 左移
      ArrowRight: () => move_default(1, 0),
      // 右移
      ArrowDown: () => move_default(0, 1),
      // 下移
      ArrowUp: rotate_default,
      // 旋转方块
      ' ': drop_default,
      // 空格：直接落地
    };
    const action = controls[key];
    if (action) {
      action();
    }
  };
  var execute_direction_control_commands_default =
    executeDirectionControlCommands;

  // lib/events/on-keydown.js
  var onKeydown = (e) => {
    const { key } = e;
    const lowerKey = key.toLowerCase();
    if (effects_default.countdown.show || effects_default.levelUp.show) {
      return false;
    }
    if (game_state_default.isSelectLevel) {
      execute_level_selection_command_default(key);
      return false;
    }
    if (game_state_default.isGameOver) {
      execute_return_to_level_selection_command_default(key);
      return false;
    }
    if (execute_shortcuts_commands_default(lowerKey)) {
      return false;
    }
    if (game_state_default.isPaused) {
      return false;
    }
    execute_direction_control_commands_default(key);
    draw_board_default(game_state_default.board);
    draw_curr_default(
      game_state_default.curr,
      game_state_default.cx,
      game_state_default.cy,
    );
  };
  var on_keydown_default = onKeydown;

  // lib/core/stop-hidden-mode.js
  var stopHiddenMode = () => {
    clearTimeout(game_state_default.holdTimer);
    game_state_default.holdTimer = null;
  };
  var stop_hidden_mode_default = stopHiddenMode;

  // lib/commands/execute-stop-hidden-mode-command.js
  var executeStopHiddenModeCommand = () => {
    stop_hidden_mode_default();
  };
  var execute_stop_hidden_mode_command_default = executeStopHiddenModeCommand;

  // lib/events/on-keyup.js
  var onKeyup = (e) => {
    const key = e.key.toLowerCase();
    if (key === 'p') {
      execute_stop_hidden_mode_command_default();
    }
  };
  var on_keyup_default = onKeyup;

  // lib/core/bind-events.js
  var bindEvents = () => {
    globalThis.addEventListener('resize', on_resize_default);
    document.addEventListener('keydown', on_keydown_default);
    document.addEventListener('keyup', on_keyup_default);
  };
  var bind_events_default = bindEvents;

  // lib/core/main.js
  var main = () => {
    reset_board_default();
    load_high_score_default();
    game_state_default.score = 0;
    game_state_default.lines = 0;
    game_state_default.level = 1;
    game_state_default.isGameOver = false;
    game_state_default.isPaused = false;
    game_state_default.isHiddenMode = false;
    game_state_default.isSelectLevel = true;
    resize_default();
    update_ui_default(
      game_state_default.score,
      game_state_default.lines,
      game_state_default.level,
      game_state_default.highScore,
    );
    lazy_draw_level_select_default();
    bind_events_default();
  };
  var main_default = main;

  // lib/tetris.js
  main_default();
})();
