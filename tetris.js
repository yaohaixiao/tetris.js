var tetris = (() => {
  // lib/engine/state/engine-state.js
  var EngineState = {
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
    /*
     * main-menu：等级选择（主菜单）
     * playing：游戏中
     * paused：游戏暂停
     * game-over：游戏结束
     */
    mode: 'main-menu',
  };
  var engine_state_default = EngineState;

  // lib/engine/replay.js
  var Replay = {
    recording: false,
    playing: false,
    frame: 0,
    data: [],
    cursor: 0,
    startRecord() {
      this.recording = true;
      this.data = [];
      this.frame = 0;
    },
    stopRecord() {
      this.recording = false;
    },
    startPlay() {
      this.playing = true;
      this.frame = 0;
    },
    stopPlay() {
      this.playing = false;
    },
  };
  var replay_default = Replay;

  // lib/command/command-queue.js
  var CommandQueue = {
    queue: [],
    enqueue(command) {
      this.queue.push(command);
    },
    flush(engine) {
      const { queue } = this;
      while (queue.length > 0) {
        const cmd = queue.shift();
        cmd.execute(engine);
      }
    },
    clear() {
      this.queue.length = 0;
    },
  };
  var command_queue_default = CommandQueue;

  // lib/animations/system.js
  var system = [];
  var registerAnimation = (anim) => {
    system.push(anim);
  };
  var updateAnimations = (delta) => {
    for (let i = system.length - 1; i >= 0; i--) {
      const anim = system[i];
      const active = anim.update(delta);
      if (!active) {
        system.splice(i, 1);
      }
    }
  };
  var renderAnimations = () => {
    const sorted = system.slice().toSorted((a, b) => a.layer - b.layer);
    for (const anim of sorted) {
      anim.render();
    }
  };
  var hasBlockingAnimation = (names) =>
    system.some((a) => {
      const isBlocking = a.blocking;
      return names && names.length > 0
        ? isBlocking && names.includes(a.name)
        : a.blocking;
    });

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
  };
  var colors_default = COLORS;

  // lib/game/constants/game.js
  var CLEAR_SCORES = [0, 100, 300, 500, 800, 1200];
  var FONT_FAMILY = `"Press Start 2P", monospace, sans-serif`;
  var MAX_LEVEL = 99;
  var GAME = {
    CLEAR_SCORES,
    MAX_LEVEL,
    FONT_FAMILY,
  };
  var game_default = GAME;

  // lib/ui/core/canvas.js
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

  // lib/ui/board/clear-board.js
  function clearBoard() {
    const { gameBoard: gameBoard2, gameBoardContext: gameBoardContext2 } =
      canvas_default;
    const { width, height } = gameBoard2;
    gameBoardContext2.clearRect(0, 0, width, height);
  }
  var clear_board_default = clearBoard;

  // lib/ui/text/render-tetris-text.js
  var renderTetrisText = () => {
    const { GREEN: GREEN4 } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: ctx,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${fontSize2 * 1.1}px ${FONT_FAMILY2}`;
    ctx.fillStyle = GREEN4;
    ctx.fillText('TETRIS.JS', width / 2, height * 0.1);
    ctx.restore();
  };
  var render_tetris_text_default = renderTetrisText;

  // lib/ui/effects/render-countdown.js
  var renderCountdown = (state) => {
    const {
      YELLOW: YELLOW4,
      BLACK: BLACK2,
      RGBA_BLACK: RGBA_BLACK2,
      GREEN: GREEN4,
    } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: ctx,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    const { scale, number } = state;
    clear_board_default();
    ctx.save();
    ctx.fillStyle = RGBA_BLACK2;
    ctx.fillRect(0, 0, width, height);
    render_tetris_text_default();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(width / 2, height / 2);
    ctx.scale(scale, scale);
    ctx.font = `${fontSize2 * 3.25}px ${FONT_FAMILY2}`;
    ctx.fillStyle = YELLOW4;
    ctx.strokeStyle = BLACK2;
    ctx.lineWidth = 6;
    ctx.strokeText(number.toString(), 0, 0);
    ctx.fillText(number.toString(), 0, 0);
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `${fontSize2 * 1.1}px ${FONT_FAMILY2}`;
    ctx.fillStyle = GREEN4;
    ctx.strokeStyle = BLACK2;
    ctx.strokeText('GET READY!', width / 2, height / 1.46);
    ctx.fillText('GET READY!', width / 2, height / 1.46);
    ctx.restore();
    ctx.restore();
  };
  var render_countdown_default = renderCountdown;

  // lib/engine/state/set-mode.js
  var setMode = (mode) => {
    engine_state_default.mode = mode;
  };
  var set_mode_default = setMode;

  // lib/audio/state/audio-state.js
  var AudioState = {
    bgmEnabled: true,
    bgmTimer: null,
  };
  var audio_state_default = AudioState;

  // lib/audio/loop-play-bgm.js
  var loopPlayBGM = (i, m) => {
    if (i >= m.length) {
      i = 0;
    }
    play_tone_default(m[i], 110, 0.05);
    audio_state_default.bgmTimer = setTimeout(() => {
      loopPlayBGM(i + 1, m);
    }, 130);
  };
  var loop_play_bgm_default = loopPlayBGM;

  // lib/audio/stop-bgm.js
  var stopBGM = () => {
    if (audio_state_default.bgmTimer) {
      clearTimeout(audio_state_default.bgmTimer);
    }
    audio_state_default.bgmTimer = null;
  };
  var stop_bgm_default = stopBGM;

  // lib/audio/play-bgm.js
  var playBGM = () => {
    const m = [
      659, 659, 587, 659, 784, 880, 523, 523, 440, 523, 659, 784, 659, 659, 587,
      659, 784, 880, 988, 880, 784, 659, 880, 784, 659, 587, 523, 587, 659, 784,
      659, 587,
    ];
    if (!audio_state_default.bgmEnabled) {
      return false;
    }
    stop_bgm_default();
    loop_play_bgm_default(0, m);
  };
  var play_bgm_default = playBGM;

  // lib/ui/constants/board.js
  var COLS = 10;
  var ROWS = 20;
  var BOARD = {
    COLS,
    ROWS,
  };
  var board_default = BOARD;

  // lib/ui/constants/tetrominoes.js
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
    // I型方块（长条）：1行5列
    { shape: [[1, 1, 1, 1, 1]], color: TEAL2 },
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

  // lib/game/logic/random-tetromino.js
  function randomTetromino() {
    const randomIndex = Math.floor(Math.random() * tetrominoes_default.length);
    const piece = tetrominoes_default[randomIndex];
    return {
      ...piece,
      shape: piece.shape.map((row) => [...row]),
    };
  }
  var random_tetromino_default = randomTetromino;

  // lib/game/logic/collision.js
  var collision = (ox, oy, state) => {
    const { ROWS: ROWS2, COLS: COLS2 } = board_default;
    const { curr, cx, cy, board } = state;
    if (!curr) {
      return false;
    }
    const s = curr.shape;
    for (let y = 0; y < s.length; y++) {
      for (let x = 0; x < s[y].length; x++) {
        if (s[y][x]) {
          const nx = cx + x + ox;
          const ny = cy + y + oy;
          const outOfBounds = nx < 0 || nx >= COLS2 || ny >= ROWS2;
          const hitBlock = ny >= 0 && ny < ROWS2 && board[ny][nx];
          if (outOfBounds || hitBlock) {
            return true;
          }
        }
      }
    }
    return false;
  };
  var collision_default = collision;

  // lib/game/core/game-over.js
  var gameOver = () => {
    const mode = engine_default.getMode();
    if (mode === 'game-over' || mode === 'paused' || mode === 'main-menu') {
      return false;
    }
    engine_default.setMode('game-over');
    engine_default.saveHighScore();
    stop_bgm_default();
    sounds_default.gameOver();
  };
  var game_over_default = gameOver;

  // lib/ui/next/clear-next-piece.js
  var clearNextPiece = () => {
    const { nextPiece: nextPiece2, nextPieceContext: nextPieceContext2 } =
      canvas_default;
    const { width, height } = nextPiece2;
    nextPieceContext2.clearRect(0, 0, width, height);
  };
  var clear_next_piece_default = clearNextPiece;

  // lib/ui/next/render-next-piece.js
  var renderNextPiece = (next) => {
    const { BLACK: BLACK2 } = colors_default;
    const { nextPiece: nextPiece2, nextPieceContext: ctx } = canvas_default;
    const { width, height } = nextPiece2;
    const gridSize = 5;
    const blockSize2 = Math.floor(width / gridSize);
    if (!next) {
      return;
    }
    const { shape } = next;
    const ox = Math.floor((width - shape[0].length * blockSize2) / 2);
    const oy = Math.floor((height - shape.length * blockSize2) / 2);
    clear_next_piece_default();
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const px = ox + x * blockSize2;
          const py = oy + y * blockSize2;
          ctx.fillStyle = next.color;
          ctx.fillRect(px, py, blockSize2 - 2, blockSize2 - 2);
          ctx.strokeStyle = BLACK2;
          ctx.strokeRect(px, py, blockSize2 - 2, blockSize2 - 2);
        }
      }
    }
  };
  var render_next_piece_default = renderNextPiece;

  // lib/game/logic/spawn.js
  var spawn = (state) => {
    const { COLS: COLS2 } = board_default;
    state.curr = state.next
      ? {
          ...state.next,
          shape: state.next.shape.map((row) => [...row]),
        }
      : random_tetromino_default();
    state.next = random_tetromino_default();
    state.cx =
      Math.floor(COLS2 / 2) - Math.floor(state.curr.shape[0].length / 2);
    state.cy = 0;
    render_next_piece_default(state.next);
    if (collision_default(0, 0, state)) {
      game_over_default();
    }
  };
  var spawn_default = spawn;

  // lib/engine/restart-game-loop.js
  var restartGameLoop = () => {
    engine_default.stop();
    engine_default.rafId = requestAnimationFrame(start_game_loop_default);
  };
  var restart_game_loop_default = restartGameLoop;

  // lib/utils/pad-start.js
  var padStart = (n, len) => n.toString().padStart(len, '0');
  var pad_start_default = padStart;

  // lib/game/core/begin-playing.js
  var beginPlaying = (state) => {
    const $level = document.querySelector('#level');
    if ($level) {
      $level.textContent = pad_start_default(state.level, 2);
    }
    engine_default.setMode('playing');
    spawn_default(state);
    sounds_default.levelStart();
    setTimeout(() => {
      play_bgm_default();
    }, 250);
    engine_default.rafId = requestAnimationFrame(restart_game_loop_default);
  };
  var begin_playing_default = beginPlaying;

  // lib/animations/countdown-animation.js
  var CountdownAnimation = (gameState) => {
    const state = {
      show: true,
      number: 3,
      scale: 4,
      count: 0,
      acc: 0,
    };
    return {
      name: 'countdown',
      // 动画名称标识
      layer: 100,
      // 渲染层级（UI 层，显示在最前面）
      blocking: true,
      // 是否阻塞用户输入（倒计时期间禁止操作）
      /**
       * ## 更新倒计时动画状态
       *
       * @param {number} delta - 距离上一帧的时间差（秒）
       * @returns {boolean} - 动画是否仍在进行中（true=进行中，false=已完成）
       */
      update(delta) {
        state.acc += delta;
        if (state.acc < 0.01) {
          return true;
        }
        state.acc = 0;
        render_countdown_default(state);
        state.count++;
        state.scale = Math.max(1, state.scale - 0.4);
        if (state.count >= 50) {
          state.count = 0;
          state.number--;
          state.scale = 4;
          if (state.number >= 1) {
            sounds_default.countdown();
          }
        }
        if (state.number <= 0) {
          set_mode_default('playing');
          begin_playing_default(gameState);
          return false;
        }
        return true;
      },
      // 渲染倒计时动画：将当前状态传递给渲染函数
      render() {
        render_countdown_default(state);
      },
    };
  };
  var countdown_animation_default = CountdownAnimation;

  // lib/controllers/countdown-controller.js
  var startCountdown = () => {
    registerAnimation(countdown_animation_default(engine_default.state));
  };
  var countdown_controller_default = startCountdown;

  // lib/game/core/start-game.js
  var startGame = (state) => {
    state.baseLines = (state.level - 1) * 10;
    countdown_controller_default();
  };
  var start_game_default = startGame;

  // lib/game/actions/select-level.js
  var selectLevel = (level, state) => {
    state.level = level;
    sounds_default.levelSelect();
  };
  var select_level_default = selectLevel;

  // lib/command/actions/main-menu-actions.js
  var MAIN_MENU_ACTIONS = {
    LEVEL_ONE: (_, engine) => {
      select_level_default(1, engine.state);
    },
    LEVEL_TWO: (_, engine) => {
      select_level_default(2, engine.state);
    },
    LEVEL_THREE: (_, engine) => {
      select_level_default(3, engine.state);
    },
    LEVEL_FOUR: (_, engine) => {
      select_level_default(4, engine.state);
    },
    LEVEL_FIVE: (_, engine) => {
      select_level_default(5, engine.state);
    },
    LEVEL_SIX: (_, engine) => {
      select_level_default(6, engine.state);
    },
    LEVEL_SEVEN: (_, engine) => {
      select_level_default(7, engine.state);
    },
    LEVEL_EIGHT: (_, engine) => {
      select_level_default(8, engine.state);
    },
    LEVEL_NINE: (_, engine) => {
      select_level_default(9, engine.state);
    },
    LEVEL_TEN: (_, engine) => {
      select_level_default(10, engine.state);
    },
    CONFIRM: (_, engine) => {
      start_game_default(engine.state);
    },
  };
  var main_menu_actions_default = MAIN_MENU_ACTIONS;

  // lib/game/logic/move.js
  var move = (ox, oy, state) => {
    if (!collision_default(ox, oy, state)) {
      state.cx += ox;
      state.cy += oy;
      sounds_default.move();
      return true;
    }
    return false;
  };
  var move_default = move;

  // lib/game/logic/rotate.js
  var rotate = (state) => {
    const { curr } = state;
    if (!curr) {
      return;
    }
    const prev = curr.shape;
    curr.shape = prev[0].map((_, i) => prev.map((r) => r[i]).toReversed());
    if (collision_default(0, 0, state)) {
      curr.shape = prev;
    } else {
      sounds_default.rotate();
    }
  };
  var rotate_default = rotate;

  // lib/game/logic/lock.js
  var lock = (state) => {
    const { curr } = state;
    const s = curr.shape;
    for (let y = 0; y < s.length; y++) {
      for (let x = 0; x < s[y].length; x++) {
        if (s[y][x]) {
          state.board[state.cy + y][state.cx + x] = curr.color;
        }
      }
    }
  };
  var lock_default = lock;

  // lib/ui/core/render-block.js
  var renderBlock = (ctx, x, y, color) => {
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
  var render_block_default = renderBlock;

  // lib/ui/board/render-clear.js
  var renderClear = (state) => {
    const { COLS: COLS2 } = board_default;
    const { gameBoardContext: ctx } = canvas_default;
    for (const line of state.lines) {
      ctx.save();
      ctx.globalAlpha = line.alpha;
      for (let x = 0; x < COLS2; x++) {
        render_block_default(ctx, x, line.y, line.color);
      }
      ctx.restore();
    }
  };
  var render_clear_default = renderClear;

  // lib/ui/hud/hud-dom.js
  var HudDom = {
    /** @type {HTMLElement | null} 分数显示元素 */
    score: document.querySelector('#score'),
    /** @type {HTMLElement | null} 行数显示元素 */
    lines: document.querySelector('#lines'),
    /** @type {HTMLElement | null} 等级显示元素 */
    level: document.querySelector('#level'),
    /** @type {HTMLElement | null} 最高分显示元素 */
    highScore: document.querySelector('#highScore'),
  };
  var hud_dom_default = HudDom;

  // lib/ui/hud/animate-hud-number.js
  var animateHUDNumber = (from, to, duration, onUpdate, onComplete) => {
    let rafId = null;
    if (from === to) {
      return;
    }
    let elapsed = 0;
    let lastTimestamp = 0;
    const step = (timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      elapsed += delta;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(from + (to - from) * progress);
      onUpdate(value, rafId);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        onComplete?.();
      }
    };
    rafId = requestAnimationFrame(step);
    return {
      cancel: () => cancelAnimationFrame(rafId),
    };
  };
  var animate_hud_number_default = animateHUDNumber;

  // lib/ui/hud/create-hud.js
  var setText = (el, value, pad = 0) =>
    (el.textContent = pad ? pad_start_default(value, pad) : String(value));
  var createHud = () => {
    const prev = {
      score: 0,
      lines: 0,
      level: 1,
      highScore: 0,
    };
    const target = {
      score: 0,
    };
    const animating = {
      score: false,
    };
    const updateScore = (next) => {
      target.score = next;
      if (animating.score) return;
      animating.score = true;
      animate_hud_number_default(
        prev.score,
        target.score,
        300,
        // 每帧更新 UI
        (v) => {
          setText(hud_dom_default.score, v, 5);
        },
        // 动画结束回调
        () => {
          prev.score = target.score;
          animating.score = false;
          if (prev.score !== target.score) {
            updateScore(target.score);
          }
        },
      );
    };
    const updateLines = (next) => {
      if (next !== prev.lines) {
        setText(hud_dom_default.lines, next, 2);
        prev.lines = next;
      }
    };
    const updateLevel = (next) => {
      if (next === prev.level) {
        return;
      }
      setText(hud_dom_default.level, next, 2);
      prev.level = next;
    };
    const updateHighScore = (next) => {
      if (next !== prev.highScore) {
        setText(hud_dom_default.highScore, next, 5);
        prev.highScore = next;
      }
    };
    const update = (state) => {
      updateScore(state.score);
      updateLines(state.lines);
      updateLevel(state.level);
      updateHighScore(state.highScore);
    };
    const reset = () => {
      prev.score = prev.lines = prev.level = prev.highScore = 0;
      animating.score = false;
      setText(hud_dom_default.score, 0, 5);
      setText(hud_dom_default.lines, 0, 2);
      setText(hud_dom_default.level, 1, 2);
      setText(hud_dom_default.highScore, 0, 5);
    };
    return {
      update,
      reset,
    };
  };
  var create_hud_default = createHud;

  // lib/ui/hud/render-hud.js
  var renderHud = (score, lines, level, highScore, needReset = false) => {
    const hud = create_hud_default();
    const mode = engine_default.getMode();
    if (mode === 'main-menu' || needReset) {
      hud.reset();
    }
    hud.update({
      score,
      lines,
      level,
      highScore,
    });
  };
  var render_hud_default = renderHud;

  // lib/ui/constants/firework-colors.js
  var {
    TEAL: TEAL3,
    YELLOW: YELLOW3,
    PURPLE: PURPLE3,
    ORANGE: ORANGE3,
    GREEN: GREEN3,
    RED: RED3,
  } = colors_default;
  var FIREWORK_COLORS = [TEAL3, YELLOW3, PURPLE3, ORANGE3, GREEN3, RED3];
  var firework_colors_default = FIREWORK_COLORS;

  // lib/ui/effects/render-fireworks.js
  var renderFireworks = (state) => {
    const { gameBoardContext: ctx } = canvas_default;
    for (const fire of state.fireworks) {
      ctx.globalAlpha = fire.alpha;
      ctx.fillStyle = fire.color;
      ctx.beginPath();
      ctx.arc(fire.x, fire.y, fire.radius, 0, Math.PI * 2);
      ctx.fill();
      fire.x += fire.vx;
      fire.y += fire.vy;
      fire.alpha -= 0.024;
    }
  };
  var render_fireworks_default = renderFireworks;

  // lib/ui/effects/render-level-up.js
  function renderLevelUp(state, engineState) {
    const {
      RGBA_BLACK: RGBA_BLACK2,
      BLACK: BLACK2,
      GREEN: GREEN4,
      YELLOW: YELLOW4,
    } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: ctx,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    if (!state.show) {
      return false;
    }
    ctx.save();
    ctx.fillStyle = RGBA_BLACK2;
    ctx.fillRect(0, 0, width, height);
    render_tetris_text_default();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${fontSize2 * 1.2}px ${FONT_FAMILY2}`;
    ctx.fillStyle = GREEN4;
    ctx.fillText(`LEVEL UP`, width / 2, height / 2.5);
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${fontSize2 * 2.5}px ${FONT_FAMILY2}`;
    ctx.fillStyle = GREEN4;
    ctx.fillText(`${engineState.level}`, width / 2, height / 1.85);
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${fontSize2 * 1.3}px ${FONT_FAMILY2}`;
    ctx.fillStyle = YELLOW4;
    ctx.strokeStyle = BLACK2;
    ctx.lineWidth = 3;
    ctx.strokeText('CONGRATS!', width / 2, height / 1.6);
    ctx.fillText('CONGRATS!', width / 2, height / 1.6);
    ctx.restore();
    render_fireworks_default(state);
    ctx.restore();
    return true;
  }
  var render_level_up_default = renderLevelUp;

  // lib/animations/level-up-animation.js
  var LevelUpAnimation = class {
    /**
     * ## 创建升级动画实例
     *
     * @param {object} options - 配置选项
     * @param {Function} options.onComplete - 动画完成时的回调函数
     * @param {object} options.state - 动画完成时的回调函数
     */
    constructor({ onComplete, state }) {
      this.fireworks = this.createFireworks();
      this.onComplete = onComplete;
      this.name = 'level-up';
      this.timer = 0;
      this.duration = 3;
      this.spawnTimer = 0;
      this.layer = 100;
      this.blocking = true;
      this.state = state;
    }
    /**
     * ## 创建一组烟花粒子
     *
     * 在画布中心上方位置生成随机方向和速度的粒子
     *
     * @returns {object[]} 烟花粒子对象数组
     */
    createFireworks() {
      const { width, height } = canvas_default.gameBoard;
      const particles = [];
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 15;
        particles.push({
          x: width / 2,
          // 初始X坐标：画布中心
          y: height / 2 - 60,
          // 初始Y坐标：画布中心上方60像素
          vx: Math.cos(angle) * speed,
          // X轴速度分量
          vy: Math.sin(angle) * speed,
          // Y轴速度分量
          radius: 3 + Math.random() * 4,
          // 粒子半径（3-7像素）
          color:
            firework_colors_default[
              Math.floor(Math.random() * firework_colors_default.length)
            ],
          // 随机颜色
          alpha: 1,
          // 初始完全不透明
        });
      }
      return particles;
    }
    /**
     * ## 更新动画状态
     *
     * @param {number} delta - 距离上一帧的时间差（秒）
     * @returns {boolean} - 动画是否仍在进行中（true=进行中，false=已完成）
     */
    update(delta) {
      this.timer += delta;
      this.spawnTimer += delta;
      this.updateFireworks(delta);
      if (this.spawnTimer > 0.6) {
        this.fireworks.push(...this.createFireworks());
        this.spawnTimer = 0;
      }
      if (this.timer >= this.duration) {
        this.onComplete?.();
        return false;
      }
      return true;
    }
    /**
     * ## 更新所有烟花粒子的物理状态
     *
     * 包括：速度衰减、重力影响、位置更新、透明度衰减、半径增大
     *
     * @param {number} delta - 距离上一帧的时间差（秒）
     */
    updateFireworks(delta) {
      const gravity = 0.01;
      for (const p of this.fireworks) {
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy += gravity * delta;
        p.x += p.vx * delta * 8e-3;
        p.y += p.vy * delta * 8e-3;
        p.alpha -= delta * 0.024;
        p.radius += delta * 10;
      }
      this.fireworks = this.fireworks.filter((p) => p.alpha > 0);
    }
    /**
     * ## 渲染升级动画
     *
     * 调用专门渲染函数显示"LEVEL UP"文字和烟花效果
     */
    render() {
      render_level_up_default(
        {
          show: true,
          // 显示升级文字
          fireworks: this.fireworks,
          // 传递烟花粒子数据
        },
        this.state,
      );
    }
  };
  var level_up_animation_default = LevelUpAnimation;

  // lib/controllers/level-up-controller.js
  var startLevelUp = () => {
    const { state } = engine_default;
    stop_bgm_default();
    sounds_default.levelUp();
    registerAnimation(
      new level_up_animation_default({
        onComplete: () => {
          play_bgm_default();
        },
        state,
      }),
    );
  };
  var level_up_controller_default = startLevelUp;

  // lib/animations/clear-lines-animation.js
  var ClearLinesAnimation = class {
    /**
     * ## 创建消除行动画实例
     *
     * @param {number[]} lines - 需要消除的行索引数组
     * @param {object} state - 游戏状态. Default is `EngineState`
     */
    constructor(lines, state) {
      this.lines = lines.map((y) => ({
        y,
        // 行的Y坐标（行号）
        alpha: 1,
        // 当前透明度（1=完全不透明，0=完全透明）
        timer: 0,
        // 动画计时器（秒）
      }));
      this.name = 'clear-lines';
      this.layer = 200;
      this.blocking = true;
      this.state = state;
    }
    /**
     * ## 更新动画状态
     *
     * @param {number} delta - 距离上一帧的时间差（秒）
     * @returns {boolean} - 动画是否仍在进行中（true=进行中，false=已完成）
     */
    update(delta) {
      let done = true;
      for (const line of this.lines) {
        const phase = Math.floor(line.timer / 0.12);
        line.alpha = phase % 2 === 0 ? 1 : 0;
        line.timer += delta;
        if (line.timer < 0.72) {
          done = false;
        }
      }
      if (done) {
        this.finish();
        return false;
      }
      return true;
    }
    /**
     * ## 渲染动画效果
     *
     * 先渲染活动区块，再渲染消除行的闪烁效果
     */
    render() {
      render_clear_default({ lines: this.lines });
    }
    /**
     * ## 动画完成后的清理工作
     *
     * 执行实际的行的消除、分数更新、等级提升等逻辑
     */
    finish() {
      const { ROWS: ROWS2, COLS: COLS2 } = board_default;
      const { CLEAR_SCORES: CLEAR_SCORES2, MAX_LEVEL: MAX_LEVEL2 } =
        game_default;
      const { state } = this;
      let cleared = 0;
      for (let y = ROWS2 - 1; y >= 0; y--) {
        const isFullLine = state.board[y].every(Boolean);
        if (isFullLine) {
          state.board.splice(y, 1);
          state.board.unshift(Array.from({ length: COLS2 }).fill(0));
          cleared++;
          y++;
        }
      }
      state.lines += cleared;
      state.score += CLEAR_SCORES2[cleared] * state.level;
      const totalLines = state.baseLines + state.lines;
      const newLevel = Math.floor(totalLines / 10) + 1;
      if (newLevel > state.level) {
        level_up_controller_default();
      }
      state.level = Math.min(Math.max(state.level, newLevel), MAX_LEVEL2);
      render_hud_default(
        state.score,
        state.lines,
        state.level,
        state.highScore,
      );
    }
  };
  var clear_lines_animation_default = ClearLinesAnimation;

  // lib/controllers/clear-lines-controller.js
  var startClearLines = (lines) => {
    registerAnimation(
      new clear_lines_animation_default(lines, engine_default.state),
    );
  };
  var clear_lines_controller_default = startClearLines;

  // lib/game/logic/clear-lines.js
  var clearLines = (state) => {
    const { ROWS: ROWS2 } = board_default;
    let clear = 0;
    const linesToClear = [];
    for (let y = ROWS2 - 1; y >= 0; y--) {
      const isLineFull = state.board[y].every((cell) => !!cell);
      if (isLineFull) {
        linesToClear.push(y);
        clear++;
      }
    }
    if (clear === 0) {
      engine_default.saveHighScore();
      return false;
    }
    sounds_default.clear();
    clear_lines_controller_default(linesToClear);
    return true;
  };
  var clear_lines_default = clearLines;

  // lib/game/logic/drop.js
  var drop = (state) => {
    while (true) {
      if (!move_default(0, 1, state)) {
        break;
      }
    }
    lock_default(state);
    sounds_default.fall();
    clear_lines_default(state);
    spawn_default(state);
    sounds_default.drop();
  };
  var drop_default = drop;

  // lib/game/core/restart-game.js
  var restartGame = (state) => {
    const mode = engine_default.getMode();
    if (mode === 'paused' || mode === 'game-over' || mode === 'main-menu') {
      return;
    }
    stop_bgm_default();
    engine_default.setMode('playing');
    state.score = 0;
    state.lines = 0;
    state.level = 1;
    engine_default.resetBoard();
    render_hud_default(
      state.score,
      state.lines,
      state.level,
      state.highScore,
      true,
    );
    spawn_default(state);
    play_bgm_default();
    engine_default.restart();
  };
  var restart_game_default = restartGame;

  // lib/animations/paused-animation.js
  var PausedAnimation = class {
    /**
     * ## 创建暂停动画实例
     *
     * @param {number} [layer=500] - 渲染层级，默认 500（显示在游戏界面上层）
     *   使用较高的默认值确保暂停界面覆盖游戏内容. Default is `500`
     */
    constructor(layer = 500) {
      this.layer = layer;
      this.name = 'paused';
      this.timer = 0;
      this.blocking = true;
    }
    /**
     * ## 更新暂停动画状态
     *
     * @param {number} delta - 距离上一帧的时间差（秒）
     * @returns {boolean} - 始终返回 true，表示动画永远不会自动结束
     */
    update(delta) {
      this.timer += delta;
      if (this.timer >= 1) {
        sounds_default.secondTick();
        this.timer = 0;
      }
      return true;
    }
    /**
     * ## 渲染暂停动画
     *
     * 将暂停界面绘制到屏幕上
     */
    render() {}
  };
  var paused_animation_default = PausedAnimation;

  // lib/controllers/paused-controller.js
  var animation = null;
  var startPaused = () => {
    if (animation) {
      return;
    }
    animation = new paused_animation_default();
    registerAnimation(animation);
  };
  var stopPaused = () => {
    if (!animation) {
      return;
    }
    animation.update = () => false;
    animation = null;
  };

  // lib/game/core/toggle-pause.js
  var togglePause = () => {
    const mode = engine_default.getMode();
    if (mode === 'game-over' || mode === 'main-menu') {
      return false;
    }
    if (mode === 'playing') {
      engine_default.setMode('paused');
      stop_bgm_default();
      sounds_default.pause();
      startPaused();
    } else {
      stopPaused();
      engine_default.setMode('playing');
      sounds_default.resume();
      play_bgm_default();
      engine_default.restart();
    }
  };
  var toggle_pause_default = togglePause;

  // lib/audio/toggle-bgm.js
  var toggleBGM = () => {
    const mode = engine_default.getMode();
    if (mode === 'main-menu' || mode === 'paused' || mode === 'game-over') {
      return;
    }
    audio_state_default.bgmEnabled = !audio_state_default.bgmEnabled;
    sounds_default.bgmToggle();
    if (audio_state_default.bgmEnabled) {
      play_bgm_default();
    } else {
      stop_bgm_default();
    }
  };
  var toggle_bgm_default = toggleBGM;

  // lib/command/actions/game-playing-actions.js
  var GAME_PLAYING_ACTIONS = {
    MOVE_LEFT: (_, engine) => {
      move_default(-1, 0, engine.state);
    },
    MOVE_RIGHT: (_, engine) => {
      move_default(1, 0, engine.state);
    },
    MOVE_DOWN: (_, engine) => {
      move_default(0, 1, engine.state);
    },
    DROP: (_, engine) => {
      drop_default(engine.state);
    },
    ROTATE: (_, engine) => {
      rotate_default(engine.state);
    },
    // R: 重新开始游戏
    RESTART: (_, engine) => {
      restart_game_default(engine.state);
    },
    // Q: 强制结束游戏
    QUIT: () => {
      game_over_default();
    },
    // P: 暂停/继续游戏
    TOGGLE_PAUSE: () => {
      toggle_pause_default();
    },
    // M: 切换背景音乐
    TOGGLE_MUSIC: () => {
      toggle_bgm_default();
    },
  };
  var game_playing_actions_default = GAME_PLAYING_ACTIONS;

  // lib/command/actions/paused-actions.js
  var PAUSED_ACTIONS = {
    TOGGLE_PAUSE: () => {
      toggle_pause_default();
    },
  };
  var paused_actions_default = PAUSED_ACTIONS;

  // lib/engine/state/reset-board.js
  var resetBoard = () => {
    const { COLS: COLS2, ROWS: ROWS2 } = board_default;
    engine_state_default.board = Array.from({ length: ROWS2 }, () =>
      Array.from({ length: COLS2 }).fill(0),
    );
  };
  var reset_board_default = resetBoard;

  // lib/game/core/reset-to-main-menu.js
  var resetToMainMenu = (state) => {
    stop_bgm_default();
    engine_default.start();
    reset_board_default();
    engine_default.setMode('main-menu');
    state.score = 0;
    state.lines = 0;
    state.level = 1;
    state.next = null;
    render_hud_default(state.score, state.lines, state.level, state.highScore);
  };
  var reset_to_main_menu_default = resetToMainMenu;

  // lib/command/actions/game-over-actions.js
  var GAME_OVER_ACTIONS = {
    CONFIRM: (_, engine) => {
      reset_to_main_menu_default(engine.state);
    },
  };
  var game_over_actions_default = GAME_OVER_ACTIONS;

  // lib/command/dispatch-command.js
  var ACTIONS_MAP = {
    'main-menu': main_menu_actions_default,
    playing: game_playing_actions_default,
    paused: paused_actions_default,
    'game-over': game_over_actions_default,
  };
  var dispatchCommand = (cmd, engine) => {
    const { type, payload } = cmd;
    const mode = engine.getMode();
    const actions = ACTIONS_MAP[mode];
    if (!actions) {
      return;
    }
    const handler = actions[type];
    handler?.(payload, engine);
  };
  var dispatch_command_default = dispatchCommand;

  // lib/command/command.js
  var Command = class {
    constructor(type, payload = {}) {
      this.type = type;
      this.payload = payload;
    }
    execute(engine) {
      dispatch_command_default(this, engine);
    }
  };
  var command_default = Command;

  // lib/game/logic/get-speed.js
  var getSpeed = (state) =>
    // 计算速度：基础值1000ms，每升一级减少80ms，最低不低于100ms
    Math.max(100, 1e3 - (state.level - 1) * 80);
  var get_speed_default = getSpeed;

  // lib/game/core/step-game.js
  var stepGame = (state) => {
    const mode = engine_default.getMode();
    if (
      mode === 'game-over' ||
      mode === 'main-menu' ||
      hasBlockingAnimation()
    ) {
      return false;
    }
    if (!move_default(0, 1, state)) {
      lock_default(state);
      sounds_default.fall();
      clear_lines_default(state);
      spawn_default(state);
      if (mode === 'game-over') {
        return false;
      }
    }
    return true;
  };
  var step_game_default = stepGame;

  // lib/engine/start-game-loop.js
  var startGameLoop = (timestamp) => {
    if (!engine_default.timestamp) {
      engine_default.timestamp = timestamp;
    }
    const delta = (timestamp - engine_default.timestamp) / 1e3;
    const dropInterval = get_speed_default(engine_default.state);
    engine_default.timestamp = timestamp;
    if (replay_default.playing) {
      const data = replay_default.data;
      while (
        replay_default.cursor < data.length &&
        data[replay_default.cursor].frame === replay_default.frame
      ) {
        const item = data[replay_default.cursor];
        command_queue_default.enqueue(
          new command_default(item.cmd.type, item.cmd.payload),
        );
        replay_default.cursor++;
      }
    }
    command_queue_default.flush(engine_default);
    engine_default.update(delta);
    replay_default.frame++;
    if (
      !engine_default.accumulator ||
      timestamp - engine_default.accumulator > dropInterval
    ) {
      step_game_default(engine_default.state);
      engine_default.accumulator = timestamp;
    }
    engine_default.render();
    engine_default.animate();
    engine_default.rafId = requestAnimationFrame(startGameLoop);
  };
  var start_game_loop_default = startGameLoop;

  // lib/engine/stop-game-loop.js
  var stopGameLoop = () => {
    if (!engine_default.rafId) {
      return;
    }
    cancelAnimationFrame(engine_default.rafId);
    engine_default.rafId = null;
    engine_default.timestamp = 0;
    engine_default.accumulator = 0;
  };
  var stop_game_loop_default = stopGameLoop;

  // lib/input/on-resize.js
  var onResize = () => {
    engine_default.resize();
  };
  var on_resize_default = onResize;

  // lib/input/dispatch-input.js
  var dispatchInput = (event) => {
    const { action } = event;
    if (hasBlockingAnimation(['countdown', 'level-up']) || !action) {
      return;
    }
    const cmd = new command_default(action);
    const { type, payload } = cmd;
    command_queue_default.enqueue(cmd);
    if (replay_default.recording) {
      replay_default.data.push({
        frame: replay_default.frame,
        cmd: { type, payload },
      });
    }
  };
  var dispatch_input_default = dispatchInput;

  // lib/input/resolve-input-action.js
  var ACTION_MAP = {
    arrowleft: 'MOVE_LEFT',
    arrowright: 'MOVE_RIGHT',
    arrowdown: 'MOVE_DOWN',
    arrowup: 'ROTATE',
    ' ': 'DROP',
    m: 'TOGGLE_MUSIC',
    p: 'TOGGLE_PAUSE',
    r: 'RESTART',
    q: 'QUIT',
    1: 'LEVEL_ONE',
    2: 'LEVEL_TWO',
    3: 'LEVEL_THREE',
    4: 'LEVEL_FOUR',
    5: 'LEVEL_FIVE',
    6: 'LEVEL_SIX',
    7: 'LEVEL_SEVEN',
    8: 'LEVEL_EIGHT',
    9: 'LEVEL_NINE',
    t: 'LEVEL_TEN',
    enter: 'CONFIRM',
  };
  var resolveInputAction = (key) => {
    const action = ACTION_MAP[key];
    if (!action) {
      return null;
    }
    return action || null;
  };
  var resolve_input_action_default = resolveInputAction;

  // lib/input/on-keydown.js
  var onKeydown = (e) => {
    const key = e.key.toLowerCase();
    const action = resolve_input_action_default(key);
    if (!action) {
      return;
    }
    dispatch_input_default({
      type: 'keydown',
      key,
      action,
    });
  };
  var on_keydown_default = onKeydown;

  // lib/input/bind-events.js
  var bindEvents = () => {
    globalThis.addEventListener('resize', on_resize_default);
    document.addEventListener('keydown', on_keydown_default);
  };
  var bind_events_default = bindEvents;

  // lib/utils/get-storage.js
  var getStorage = (key) => localStorage.getItem(key);
  var get_storage_default = getStorage;

  // lib/engine/state/load-high-score.js
  var loadHighScore = () => {
    engine_state_default.highScore =
      Number.parseInt(get_storage_default('tetris-high-score'), 10) || 0;
  };
  var load_high_score_default = loadHighScore;

  // lib/utils/set-storage.js
  var setStorage = (key, value) => {
    localStorage.setItem(key, value);
  };
  var set_storage_default = setStorage;

  // lib/engine/state/save-high-score.js
  var saveHighScore = () => {
    const { score } = engine_state_default;
    if (score > engine_state_default.highScore) {
      engine_state_default.highScore = score;
      set_storage_default(
        'tetris-high-score',
        engine_state_default.highScore.toString(),
      );
    }
  };
  var save_high_score_default = saveHighScore;

  // lib/engine/state/get-mode.js
  var getMode = () => engine_state_default.mode;
  var get_mode_default = getMode;

  // lib/ui/text/render-enter-start-text.js
  var renderEnterStartText = () => {
    const { TEAL: TEAL4 } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: ctx,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${fontSize2 * 1.15}px ${FONT_FAMILY2}`;
    ctx.fillStyle = TEAL4;
    ctx.fillText('ENTER START', width / 2, height * 0.7);
    ctx.restore();
  };
  var render_enter_start_text_default = renderEnterStartText;

  // lib/ui/scenes/main-menu-scene/render-main-menu.js
  var renderMainMenu = (level) => {
    const {
      RGBA_BLACK: RGBA_BLACK2,
      GREEN: GREEN4,
      WHITE: WHITE2,
    } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: ctx,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    clear_board_default();
    ctx.save();
    ctx.fillStyle = RGBA_BLACK2;
    ctx.fillRect(0, 0, width, height);
    render_tetris_text_default();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${fontSize2}px ${FONT_FAMILY2}`;
    ctx.fillStyle = GREEN4;
    ctx.fillText('LEVEL', width / 2, height * 0.35);
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${fontSize2 * 3}px ${FONT_FAMILY2}`;
    ctx.fillStyle = GREEN4;
    ctx.fillText(level.toString(), width / 2, height * 0.5);
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${fontSize2}px ${FONT_FAMILY2}`;
    ctx.fillStyle = WHITE2;
    ctx.fillText('1-9 or T KEY', width / 2, height * 0.58);
    ctx.restore();
    render_enter_start_text_default();
    ctx.restore();
  };
  var render_main_menu_default = renderMainMenu;

  // lib/ui/scenes/main-menu-scene/lazy-render-main-menu.js
  var lazyRenderMainMenu = (state) => {
    if (document?.fonts?.load) {
      document.fonts.load('40px "Press Start 2P"').then(() => {
        render_main_menu_default(state.level);
      });
    } else {
      setTimeout(() => {
        render_main_menu_default(state.level);
      }, 150);
    }
  };
  var lazy_render_main_menu_default = lazyRenderMainMenu;

  // lib/ui/scenes/main-menu-scene/index.js
  var mainMenuScene = (state) => {
    render_main_menu_default(state.level);
  };
  var main_menu_scene_default = mainMenuScene;

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
      MM: pad_start_default(month, 2),
      dd: pad_start_default(day, 2),
      HH: pad_start_default(hours, 2),
      hh: hasSymbol && hours > 12 ? hours - 12 : hours,
      mm: pad_start_default(minutes, 2),
      ss: pad_start_default(seconds, 2),
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

  // lib/ui/effects/render-digital-time.js
  var renderDigitalTime = () => {
    const { GREEN: GREEN4, WHITE: WHITE2 } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: ctx,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    const time = format_time_default(/* @__PURE__ */ new Date(), 'HH:mm:ss');
    ctx.save();
    ctx.fillStyle = GREEN4;
    ctx.textAlign = 'center';
    ctx.font = `${fontSize2 * 0.86}px ${FONT_FAMILY2}`;
    ctx.fillText(`${time}`, width / 2, height / 3.65);
    ctx.shadowColor = WHITE2;
    ctx.shadowBlur = 13;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.restore();
  };
  var render_digital_time_default = renderDigitalTime;

  // lib/ui/effects/render-clock.js
  var renderClock = () => {
    const time = /* @__PURE__ */ new Date();
    const h = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();
    const {
      TEAL: TEAL4,
      RGBA_TEAL: RGBA_TEAL2,
      ORANGE: ORANGE4,
    } = colors_default;
    const { gameBoard: gameBoard2, gameBoardContext: ctx } = canvas_default;
    const { width, height } = gameBoard2;
    const centerX = width / 2;
    const centerY = height / 2.2;
    const radius = Math.floor(width * 0.25);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.lineCap = 'round';
    ctx.strokeStyle = TEAL4;
    ctx.fillStyle = TEAL4;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.lineWidth = Math.floor(width * 0.064);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = RGBA_TEAL2;
    ctx.fill();
    ctx.restore();
    const dotRadius = Math.floor(width * 0.016);
    const dotMargin = Math.floor(width * 0.08);
    const dotDistance = radius - dotMargin;
    for (let i = 0; i < 12; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 6);
      ctx.beginPath();
      ctx.arc(0, -dotDistance, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    const hAng = ((h % 12) + m / 60 + s / 3600) * ((2 * Math.PI) / 12);
    ctx.save();
    ctx.rotate(hAng);
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.4);
    ctx.stroke();
    ctx.restore();
    const mAng = (m + s / 60) * ((2 * Math.PI) / 60);
    ctx.save();
    ctx.rotate(mAng);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.65);
    ctx.stroke();
    ctx.restore();
    const sAng = s * ((2 * Math.PI) / 60);
    ctx.save();
    ctx.rotate(sAng);
    ctx.strokeStyle = ORANGE4;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.75);
    ctx.stroke();
    ctx.restore();
    const pointRadius = Math.floor(width * 0.014);
    ctx.save();
    ctx.fillStyle = ORANGE4;
    ctx.beginPath();
    ctx.arc(0, 0, pointRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.restore();
  };
  var render_clock_default = renderClock;

  // lib/ui/board/render-board.js
  function renderBoard(board) {
    const { ROWS: ROWS2, COLS: COLS2 } = board_default;
    const { gameBoardContext: gameBoardContext2 } = canvas_default;
    clear_board_default();
    for (let y = 0; y < ROWS2; y++) {
      for (let x = 0; x < COLS2; x++) {
        if (board[y][x]) {
          render_block_default(gameBoardContext2, x, y, board[y][x]);
        }
      }
    }
  }
  var render_board_default = renderBoard;

  // lib/ui/board/render-active-pieces.js
  var renderActivePieces = (curr, cx, cy) => {
    const { gameBoardContext: ctx } = canvas_default;
    const { shape, color } = curr;
    const { length } = shape;
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          render_block_default(ctx, cx + x, cy + y, color);
        }
      }
    }
    return true;
  };
  var render_active_pieces_default = renderActivePieces;

  // lib/ui/board/render-active-only.js
  var renderActiveOnly = (state) => {
    const { board, curr, cx, cy } = state;
    if (board) {
      render_board_default(board);
    }
    if (curr) {
      render_active_pieces_default(curr, cx, cy);
    }
  };
  var render_active_only_default = renderActiveOnly;

  // lib/ui/scenes/paused-scene/render-paused.js
  var renderPaused = (state) => {
    const {
      RGBA_BLACK: RGBA_BLACK2,
      YELLOW: YELLOW4,
      WHITE: WHITE2,
    } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: ctx,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    clear_board_default();
    render_active_only_default(state);
    ctx.fillStyle = RGBA_BLACK2;
    ctx.fillRect(0, 0, width, height);
    render_tetris_text_default();
    render_digital_time_default();
    render_clock_default();
    ctx.save();
    ctx.fillStyle = YELLOW4;
    ctx.textAlign = 'center';
    ctx.font = `${fontSize2 * 1.6}px ${FONT_FAMILY2}`;
    ctx.fillText('PAUSED', width / 2, height / 1.45);
    ctx.shadowColor = WHITE2;
    ctx.shadowBlur = 13;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.restore();
  };
  var render_paused_default = renderPaused;

  // lib/ui/scenes/paused-scene/index.js
  var pausedScene = (state) => {
    render_paused_default(state);
  };
  var paused_scene_default = pausedScene;

  // lib/ui/scenes/game-over-scene/render-game-over.js
  var renderGameOver = (state) => {
    const {
      RGBA_BLACK: RGBA_BLACK2,
      RED: RED4,
      YELLOW: YELLOW4,
    } = colors_default;
    const { FONT_FAMILY: FONT_FAMILY2 } = game_default;
    const {
      gameBoard: gameBoard2,
      gameBoardContext: ctx,
      fontSize: fontSize2,
    } = canvas_default;
    const { width, height } = gameBoard2;
    clear_board_default();
    render_active_only_default(state);
    ctx.fillStyle = RGBA_BLACK2;
    ctx.fillRect(0, 0, width, height);
    render_tetris_text_default();
    ctx.save();
    ctx.fillStyle = RED4;
    ctx.strokeStyle = YELLOW4;
    ctx.textAlign = 'center';
    ctx.font = `${fontSize2 * 2.3}px ${FONT_FAMILY2}`;
    ctx.strokeText('GAME', width / 2, height / 2.2);
    ctx.fillText('GAME', width / 2, height / 2.2);
    ctx.restore();
    ctx.save();
    ctx.fillStyle = RED4;
    ctx.strokeStyle = YELLOW4;
    ctx.textAlign = 'center';
    ctx.font = `${fontSize2 * 2.3}px ${FONT_FAMILY2}`;
    ctx.strokeText('OVER', width / 2, height / 1.8);
    ctx.fillText('OVER', width / 2, height / 1.8);
    ctx.restore();
    render_enter_start_text_default();
  };
  var render_game_over_default = renderGameOver;

  // lib/ui/scenes/game-over-scene/index.js
  var gameOverScene = (state) => {
    render_game_over_default(state);
  };
  var game_over_scene_default = gameOverScene;

  // lib/ui/scenes/playing-scene/render-playing.js
  var renderPlaying = (state) => {
    render_active_only_default(state);
    render_next_piece_default(state.next);
  };
  var render_playing_default = renderPlaying;

  // lib/ui/scenes/playing-scene/index.js
  var playingScene = (state) => {
    render_playing_default(state);
  };
  var playing_scene_default = playingScene;

  // lib/ui/scenes/index.js
  var scenes = {
    'main-menu': (state) => {
      main_menu_scene_default(state);
    },
    paused: (state) => {
      paused_scene_default(state);
    },
    'game-over': (state) => {
      game_over_scene_default(state);
    },
    playing: (state) => {
      playing_scene_default(state);
    },
  };
  var scenes_default = scenes;

  // lib/ui/scene-manager/render-scene.js
  var renderScene = (state) => {
    const mode = engine_default.getMode();
    const scene = scenes_default[mode];
    if (!scene) {
      return;
    }
    scene(state);
  };
  var render_scene_default = renderScene;

  // lib/ui/core/resize.js
  var resize = () => {
    const { ROWS: ROWS2, COLS: COLS2 } = board_default;
    const { gameBoard: gameBoard2, nextPiece: nextPiece2 } = canvas_default;
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
  };
  var resize_default = resize;

  // lib/engine/engine.js
  var Engine = {
    rafId: null,
    accumulator: 0,
    lastTimestamp: 0,
    state: engine_state_default,
    resetBoard: reset_board_default,
    loadHighScore: load_high_score_default,
    saveHighScore: save_high_score_default,
    getMode: get_mode_default,
    setMode: set_mode_default,
    launch: () => {
      const { state } = Engine;
      reset_board_default();
      load_high_score_default();
      set_mode_default('main-menu');
      state.score = 0;
      state.lines = 0;
      state.level = 1;
      Engine.resize();
      render_hud_default(
        state.score,
        state.lines,
        state.level,
        state.highScore,
      );
      lazy_render_main_menu_default(state);
      bind_events_default();
      Engine.start();
    },
    start: () => {
      Engine.rafId = requestAnimationFrame(start_game_loop_default);
    },
    stop: () => {
      stop_game_loop_default();
    },
    restart: () => {
      restart_game_loop_default();
    },
    render: () => {
      render_scene_default(Engine.state);
    },
    update: (delta) => {
      updateAnimations(delta);
    },
    animate: () => {
      renderAnimations();
    },
    resize: () => {
      resize_default();
      Engine.render();
    },
  };
  var engine_default = Engine;

  // lib/main.js
  var main = () => {
    engine_default.launch();
  };
  var main_default = main;

  // lib/tetris.js
  main_default();
})();
