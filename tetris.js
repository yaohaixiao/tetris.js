var tetris = (() => {
  // lib/constants.js
  var BOARD_COLS = 10;
  var BOARD_ROWS = 20;
  var CLEAR_SCORES = [0, 100, 300, 500, 800];
  var MAX_LEVEL = 10;
  var COLOR_TEAL = "#0ff";
  var COLOR_YELLOW = "#ff0";
  var COLOR_PURPLE = "#a0a";
  var COLOR_BLUE = "#00f";
  var COLOR_ORANGE = "#f80";
  var COLOR_GREEN = "#0f0";
  var COLOR_RED = "#f00";
  var COLOR_BLACK = "#444";
  var COLOR_RGBA_BLACK = "rgba(0,0,0,.8)";
  var COLOR_WHITE = "#fff";
  var TETROMINOES = [
    // I型方块（长条）：1行4列
    { shape: [[1, 1, 1, 1]], color: COLOR_TEAL },
    // O型方块（正方形）：2x2
    {
      shape: [
        [1, 1],
        [1, 1]
      ],
      color: COLOR_YELLOW
    },
    // T型方块
    {
      shape: [
        [0, 1, 0],
        [1, 1, 1]
      ],
      color: COLOR_PURPLE
    },
    // L型方块
    {
      shape: [
        [1, 0, 0],
        [1, 1, 1]
      ],
      color: COLOR_BLUE
    },
    // J型方块
    {
      shape: [
        [0, 0, 1],
        [1, 1, 1]
      ],
      color: COLOR_ORANGE
    },
    // S型方块（右斜）
    {
      shape: [
        [0, 1, 1],
        [1, 1, 0]
      ],
      color: COLOR_GREEN
    },
    // Z型方块（左斜）
    {
      shape: [
        [1, 1, 0],
        [0, 1, 1]
      ],
      color: COLOR_RED
    }
  ];
  var FIREWORKS_COLORS = [
    COLOR_TEAL,
    COLOR_YELLOW,
    COLOR_PURPLE,
    COLOR_ORANGE,
    COLOR_GREEN,
    COLOR_RED
  ];

  // lib/state.js
  var gameState = {
    board: [],
    curr: null,
    cx: 0,
    cy: 0,
    next: null,
    baseLines: 0,
    clearEffects: [],
    levelUpEffect: {
      show: false,
      timer: 0,
      fireworks: []
    },
    score: 0,
    lines: 0,
    level: 1,
    highScore: 0,
    isGameOver: false,
    isPaused: false,
    isSelectLevel: true,
    isHiddenMode: false,
    gameInterval: null,
    holdP: null
  };
  var resetBoard = () => {
    gameState.board = Array.from(
      { length: BOARD_ROWS },
      () => Array.from({ length: BOARD_COLS }).fill(0)
    );
  };
  var loadHighScore = () => {
    gameState.highScore = Number.parseInt(localStorage.getItem("tetris-high-score"), 10) || 0;
  };
  var saveHighScore = () => {
    const { score } = gameState;
    if (score > gameState.highScore) {
      gameState.highScore = score;
      localStorage.setItem("tetris-high-score", gameState.highScore.toString());
    }
  };

  // lib/audio.js
  var AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
  var audioCtx = new AudioContext();
  var bgmTimer = null;
  var bgmEnabled = true;
  var playTone = (freq, dur, vol = 0.1, wave = "square") => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    setTimeout(() => osc.stop(), dur);
  };
  var sounds = {
    // 左右移动
    move: () => playTone(330, 60),
    // 旋转方块
    rotate: () => playTone(440, 60),
    // 快速下落
    drop: () => playTone(220, 100),
    // 方块落地
    fall: () => playTone(180, 200),
    // 消除行（三连音旋律）
    clear: () => {
      playTone(587, 220, 0.35, "square");
      setTimeout(() => playTone(698, 260, 0.32, "square"), 160);
      setTimeout(() => playTone(880, 300, 0.3, "square"), 320);
      setTimeout(() => playTone(1174, 380, 0.25, "square"), 480);
    },
    // 游戏结束（悲伤旋律）
    gameOver: () => {
      playTone(330, 200);
      setTimeout(() => playTone(294, 300), 210);
      setTimeout(() => playTone(262, 500), 520);
    },
    // 暂停
    pause: () => playTone(300, 150),
    // 恢复游戏
    resume: () => playTone(400, 150),
    // 等级开始 / 升级
    levelStart: () => playTone(523, 200),
    // 等级选择界面（正弦波柔和音效）
    levelSelect: () => playTone(523, 80, 0.1, "sine"),
    // 升级清除界面音效
    levelUp: () => {
      playTone(523, 220);
      setTimeout(() => playTone(587, 220), 260);
      setTimeout(() => playTone(659, 240), 520);
      setTimeout(() => playTone(784, 260), 780);
      setTimeout(() => playTone(880, 280), 1060);
      setTimeout(() => playTone(1047, 320), 1360);
      setTimeout(() => playTone(1175, 360), 1700);
      setTimeout(() => playTone(1319, 480), 2080);
    },
    // 背景音乐开关
    bgmToggle: () => playTone(440, 100)
  };
  var loopPlayBGM = (i, m) => {
    if (i >= m.length) {
      i = 0;
    }
    playTone(m[i], 110, 0.05);
    bgmTimer = setTimeout(() => loopPlayBGM(i + 1, m), 130);
  };
  var stopBGM = () => {
    if (bgmTimer) {
      clearTimeout(bgmTimer);
    }
    bgmTimer = null;
  };
  var playBGM = () => {
    if (!bgmEnabled) {
      return false;
    }
    stopBGM();
    const m = [
      659,
      659,
      587,
      659,
      784,
      880,
      523,
      523,
      440,
      523,
      659,
      784,
      659,
      659,
      587,
      659,
      784,
      880,
      988,
      880,
      784,
      659,
      880,
      784,
      659,
      587,
      523,
      587,
      659,
      784,
      659,
      587
    ];
    loopPlayBGM(0, m);
  };
  var toggleBGM = () => {
    bgmEnabled = !bgmEnabled;
    sounds.bgmToggle();
    if (bgmEnabled) {
      playBGM();
    } else {
      stopBGM();
    }
  };

  // lib/utils.js
  var pad = (n, len) => n.toString().padStart(len, "0");

  // lib/ui.js
  var canvas = document.querySelector("#game-board");
  var ctx = canvas.getContext("2d");
  var nextCanvas = document.querySelector("#next-piece");
  var nextCtx = nextCanvas.getContext("2d");
  var BLOCK_SIZE;
  var baseFontSize;
  function drawLevelUpEffect() {
    const effect = gameState.levelUpEffect;
    const { width, height } = canvas;
    if (!effect.show) {
      return false;
    }
    ctx.save();
    ctx.fillStyle = COLOR_RGBA_BLACK;
    ctx.fillRect(0, 0, width, height);
    ctx.font = `${baseFontSize}px "Press Start 2P", monospace, sans-serif`;
    ctx.fillStyle = COLOR_YELLOW;
    ctx.strokeStyle = COLOR_BLACK;
    ctx.lineWidth = 3;
    ctx.textAlign = "center";
    ctx.strokeText("Congrats!", width / 2, height / 2);
    ctx.fillText("Congrats!", width / 2, height / 2);
    ctx.font = `${baseFontSize / 2}px "Press Start 2P", monospace, sans-serif`;
    ctx.fillStyle = COLOR_WHITE;
    ctx.fillText(`Level ${gameState.level}!`, width / 2, height / 2 + 40);
    for (const fire of effect.fireworks) {
      ctx.globalAlpha = fire.alpha;
      ctx.fillStyle = fire.color;
      ctx.beginPath();
      ctx.arc(fire.x, fire.y, fire.radius, 0, Math.PI * 2);
      ctx.fill();
      fire.x += fire.vx;
      fire.y += fire.vy;
      fire.alpha -= 0.024;
    }
    ctx.restore();
    return true;
  }
  function triggerLevelUp() {
    const { width, height } = canvas;
    const fireworks = [];
    gameState.levelUpEffect.show = true;
    gameState.levelUpEffect.timer = 0;
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 240;
      fireworks.push({
        // 全部从中心点出发
        x: width / 2,
        y: height / 2 - 60,
        radius: 2 + Math.random() * 4,
        color: FIREWORKS_COLORS[Math.floor(Math.random() * 6)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1
      });
    }
    gameState.levelUpEffect.fireworks = fireworks;
    stopBGM();
    sounds.levelUp();
  }
  function updateLevelUpAnim() {
    gameState.levelUpEffect.timer++;
    if (gameState.levelUpEffect.timer > 3) {
      gameState.levelUpEffect.show = false;
      gameState.levelUpEffect.fireworks = [];
      playBGM();
      return true;
    }
    return false;
  }
  var drawBlock = (ctx2, x, y, color) => {
    const bs = BLOCK_SIZE;
    const gap = 1;
    const size = bs - gap * 2;
    const px = x * bs + gap;
    const py = y * bs + gap;
    ctx2.fillStyle = color;
    ctx2.fillRect(px, py, size, size);
    ctx2.strokeStyle = COLOR_BLACK;
    ctx2.strokeRect(px, py, size, size);
  };
  var drawClearEffects = () => {
    for (const line of gameState.clearEffects) {
      ctx.save();
      ctx.globalAlpha = line.alpha;
      for (let x = 0; x < BOARD_COLS; x++) {
        drawBlock(ctx, x, line.y, line.color);
      }
      ctx.restore();
    }
  };
  var drawBoard = (board) => {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    for (let y = 0; y < BOARD_ROWS; y++) {
      for (let x = 0; x < BOARD_COLS; x++) {
        if (board[y][x]) {
          drawBlock(ctx, x, y, board[y][x]);
        }
      }
    }
  };
  var drawCurr = (curr, cx, cy) => {
    const { shape, color } = curr;
    const { length } = shape;
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          drawBlock(ctx, cx + x, cy + y, color);
        }
      }
    }
  };
  var drawNext = (next) => {
    const { shape } = next;
    const { width, height } = nextCanvas;
    const gridSize = 5;
    const blockSize = Math.floor(width / gridSize);
    const ox = Math.floor((width - shape[0].length * blockSize) / 2);
    const oy = Math.floor((height - shape.length * blockSize) / 2);
    nextCtx.clearRect(0, 0, width, height);
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const px = ox + x * blockSize;
          const py = oy + y * blockSize;
          nextCtx.fillStyle = next.color;
          nextCtx.fillRect(px, py, blockSize - 2, blockSize - 2);
          nextCtx.strokeStyle = COLOR_BLACK;
          nextCtx.strokeRect(px, py, blockSize - 2, blockSize - 2);
        }
      }
    }
  };
  var drawLevelSelect = (level) => {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.textAlign = "center";
    ctx.font = `${baseFontSize}px "Press Start 2P"`;
    ctx.fillStyle = COLOR_GREEN;
    ctx.fillText("LEVEL", width / 2, height * 0.25);
    ctx.fillText(level.toString(), width / 2, height * 0.4);
    ctx.fillStyle = COLOR_WHITE;
    ctx.fillText("1-9 KEY", width / 2, height * 0.55);
    ctx.fillText("P 3SEC: HIDDEN", width / 2, height * 0.68);
    ctx.fillText("ENTER START", width / 2, height * 0.81);
  };
  var drawPause = () => {
    const { width, height } = canvas;
    ctx.fillStyle = COLOR_RGBA_BLACK;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = COLOR_YELLOW;
    ctx.textAlign = "center";
    ctx.font = `${baseFontSize}px "Press Start 2P"`;
    ctx.fillText("PAUSED", width / 2, height / 2);
  };
  var drawOver = () => {
    const { width, height } = canvas;
    const { board } = gameState;
    drawBoard(board);
    ctx.fillStyle = COLOR_RGBA_BLACK;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = COLOR_RED;
    ctx.textAlign = "center";
    ctx.font = `${baseFontSize}px "Press Start 2P"`;
    ctx.fillText("GAME OVER", width / 2, height / 2);
  };
  var forceOver = () => {
    stopBGM();
    gameState.isGameOver = true;
    clearInterval(gameState.gameInterval);
    sounds.gameOver();
    saveHighScore();
    setTimeout(() => {
      drawOver();
    }, 10);
  };
  var resize = () => {
    const { isSelectLevel, isGameOver, board, curr, cx, cy, level, next } = gameState;
    const h = globalThis.innerHeight * 0.9;
    BLOCK_SIZE = Math.floor(h / BOARD_ROWS);
    canvas.width = BLOCK_SIZE * BOARD_COLS;
    canvas.height = BLOCK_SIZE * BOARD_ROWS;
    baseFontSize = Math.floor(canvas.height * 0.035);
    const nextSize = Math.min(
      globalThis.innerWidth * 0.1,
      globalThis.innerHeight * 0.18
    );
    nextCanvas.width = nextSize;
    nextCanvas.height = nextSize;
    if (isSelectLevel || isGameOver) {
      drawLevelSelect(level);
    } else {
      drawBoard(board);
      drawNext(next);
      if (curr) {
        drawCurr(curr, cx, cy);
      }
    }
  };
  var updateUI = (score, lines, level, highScore) => {
    document.querySelector("#score").textContent = pad(score, 5);
    document.querySelector("#lines").textContent = pad(lines, 2);
    document.querySelector("#level").textContent = pad(level, 2);
    document.querySelector("#highScore").textContent = pad(highScore, 5);
  };
  var updateClearEffects = () => {
    let allDone = true;
    for (const line of gameState.clearEffects) {
      const phase = Math.floor(line.timer / 0.12);
      line.alpha = phase % 2 === 0 ? 1 : 0;
      line.timer += 0.016;
      if (line.timer < 0.72) {
        allDone = false;
      }
    }
    return allDone;
  };
  var addClearEffect = (y) => {
    const isLineContains = gameState.clearEffects.some((line) => line.y === y);
    if (!isLineContains) {
      gameState.clearEffects.push({ y, alpha: 1, timer: 0 });
    }
  };

  // lib/game.js
  var getSpeed = () => (
    // 计算速度：基础值1000ms，每升一级减少80ms，最低不低于100ms
    Math.max(100, 1e3 - (gameState.level - 1) * 80)
  );
  var randomTetromino = () => {
    const randomIndex = Math.floor(Math.random() * TETROMINOES.length);
    return TETROMINOES[randomIndex];
  };
  var collision = (ox, oy) => {
    const s = gameState.curr.shape;
    for (let y = 0; y < s.length; y++) {
      for (let x = 0; x < s[y].length; x++) {
        if (s[y][x]) {
          const nx = gameState.cx + x + ox;
          const ny = gameState.cy + y + oy;
          if (nx < 0 || nx >= BOARD_COLS || ny >= BOARD_ROWS || ny >= 0 && gameState.board[ny][nx]) {
            return true;
          }
        }
      }
    }
    return false;
  };
  var rotate = () => {
    const prev = gameState.curr.shape;
    gameState.curr.shape = prev[0].map(
      (_, i) => prev.map((r) => r[i]).toReversed()
    );
    if (collision(0, 0)) {
      gameState.curr.shape = prev;
    } else {
      sounds.rotate();
    }
  };
  function updateSpeed() {
    clearInterval(gameState.gameInterval);
    gameState.gameInterval = setInterval(loop, getSpeed());
  }
  var drawClearFlash = () => {
    drawBoard(gameState.board);
    drawCurr(gameState.curr, gameState.cx, gameState.cy);
    drawClearEffects();
    if (updateClearEffects()) {
      let clear = 0;
      for (let y = BOARD_ROWS - 1; y >= 0; y--) {
        const isFullLine = gameState.board[y].every((cell) => !!cell);
        if (isFullLine) {
          gameState.board.splice(y, 1);
          gameState.board.unshift(Array.from({ length: BOARD_COLS }).fill(0));
          clear++;
          y++;
        }
      }
      gameState.lines += clear;
      gameState.score += CLEAR_SCORES[clear] * gameState.level;
      const totalLines = gameState.baseLines + gameState.lines;
      const newLevel = Math.floor(totalLines / 10) + 1;
      const oldLevel = gameState.level;
      if (newLevel > oldLevel) {
        triggerLevelUp();
      }
      gameState.level = Math.min(Math.max(gameState.level, newLevel), MAX_LEVEL);
      updateSpeed();
      updateUI(
        gameState.score,
        gameState.lines,
        gameState.level,
        gameState.highScore
      );
      saveHighScore();
      gameState.clearEffects = [];
      updateSpeed();
    } else {
      requestAnimationFrame(drawClearFlash);
    }
  };
  function gameOver() {
    if (gameState.isGameOver) {
      return false;
    }
    gameState.isGameOver = true;
    stopBGM();
    clearInterval(gameState.gameInterval);
    sounds.gameOver();
    saveHighScore();
    setTimeout(drawOver, 20);
  }
  function spawn() {
    gameState.curr = gameState.next || randomTetromino();
    gameState.next = randomTetromino();
    gameState.cx = Math.floor(BOARD_COLS / 2) - Math.floor(gameState.curr.shape[0].length / 2);
    gameState.cy = 0;
    drawNext(gameState.next);
    if (collision(0, 0)) {
      gameOver();
    }
  }
  function move(ox, oy) {
    if (!collision(ox, oy)) {
      gameState.cx += ox;
      gameState.cy += oy;
      sounds.move();
      return true;
    }
    return false;
  }
  function lock() {
    const s = gameState.curr.shape;
    for (let y = 0; y < s.length; y++) {
      for (let x = 0; x < s[y].length; x++) {
        if (s[y][x]) {
          gameState.board[gameState.cy + y][gameState.cx + x] = gameState.curr.color;
        }
      }
    }
  }
  function clearLines() {
    let clear = 0;
    const linesToClear = [];
    for (let y = BOARD_ROWS - 1; y >= 0; y--) {
      const isLineFull = gameState.board[y].every((cell) => !!cell);
      if (isLineFull) {
        linesToClear.push(y);
        clear++;
      }
    }
    if (clear === 0) {
      updateUI(
        gameState.score,
        gameState.lines,
        gameState.level,
        gameState.highScore
      );
      saveHighScore();
      return false;
    }
    for (const y of linesToClear) {
      addClearEffect(y);
    }
    sounds.clear();
    gameState.lines += clear;
    gameState.score += CLEAR_SCORES[clear] * gameState.level;
    drawClearFlash();
    return true;
  }
  function loop() {
    if (gameState.levelUpEffect.show) {
      updateLevelUpAnim();
      drawBoard(gameState.board);
      drawCurr(gameState.curr, gameState.cx, gameState.cy);
      drawLevelUpEffect();
      return true;
    }
    if (gameState.isGameOver || gameState.isPaused) {
      return false;
    }
    if (!move(0, 1)) {
      lock();
      sounds.fall();
      clearLines();
      spawn();
      if (gameState.isGameOver) {
        return false;
      }
    }
    drawBoard(gameState.board);
    drawCurr(gameState.curr, gameState.cx, gameState.cy);
    return true;
  }
  function drop() {
    while (true) {
      if (!move(0, 1)) {
        break;
      }
    }
    lock();
    sounds.fall();
    clearLines();
    spawn();
    sounds.drop();
  }

  // lib/tetris.js
  var start = () => {
    gameState.isSelectLevel = false;
    gameState.baseLines = (gameState.level - 1) * 10;
    spawn();
    playBGM();
    sounds.levelStart();
    updateSpeed();
  };
  var togglePause = () => {
    if (gameState.isGameOver || gameState.isSelectLevel) {
      return false;
    }
    gameState.isPaused = !gameState.isPaused;
    if (gameState.isPaused) {
      clearInterval(gameState.gameInterval);
      stopBGM();
      sounds.pause();
      drawPause();
    } else {
      sounds.resume();
      playBGM();
      updateSpeed();
    }
  };
  var restartGame = () => {
    stopBGM();
    gameState.isGameOver = false;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lines = 0;
    gameState.level = 1;
    resetBoard();
    updateUI(
      gameState.score,
      gameState.lines,
      gameState.level,
      gameState.highScore
    );
    spawn();
    playBGM();
    updateSpeed();
  };
  var backToMenu = () => {
    stopBGM();
    clearInterval(gameState.gameInterval);
    resetBoard();
    gameState.isGameOver = false;
    gameState.isHiddenMode = false;
    gameState.isSelectLevel = true;
    gameState.score = 0;
    gameState.lines = 0;
    gameState.level = 1;
    gameState.curr = null;
    gameState.next = null;
    updateUI(
      gameState.score,
      gameState.lines,
      gameState.level,
      gameState.highScore
    );
    drawLevelSelect(gameState.level);
  };
  var startHold = () => {
    gameState.holdP = setTimeout(() => {
      gameState.isHiddenMode = true;
      gameState.level = 5;
      drawLevelSelect(gameState.level);
    }, 3e3);
  };
  var stopHold = () => {
    clearTimeout(gameState.holdP);
    gameState.holdP = null;
  };
  var handleLevelSelect = (key, lowerKey) => {
    if (key >= "1" && key <= "9") {
      gameState.level = Number.parseInt(key, 10);
      sounds.levelSelect();
      drawLevelSelect(gameState.level);
    }
    if (lowerKey === "p") {
      startHold();
    }
    if (key === "Enter") {
      start();
    }
  };
  var handleGlobalShortcuts = (lowerKey) => {
    const actions = {
      m: toggleBGM,
      // M: 切换背景音乐
      r: restartGame,
      // R: 重新开始游戏
      q: forceOver,
      // Q: 强制结束游戏
      p: togglePause
      // P: 暂停/继续游戏
    };
    const action = actions[lowerKey];
    if (action) {
      action();
      return true;
    }
    return false;
  };
  function handleDirectionalControls(key) {
    const controls = {
      ArrowLeft: () => move(-1, 0),
      // 左移
      ArrowRight: () => move(1, 0),
      // 右移
      ArrowDown: () => move(0, 1),
      // 下移
      ArrowUp: rotate,
      // 旋转方块
      " ": drop
      // 空格：直接落地
    };
    const action = controls[key];
    if (action) {
      action();
    }
  }
  var handleStopHold = (e) => {
    if (e.key.toLowerCase() === "p") {
      stopHold();
    }
  };
  var handleGameControls = (e) => {
    const { key } = e;
    const lowerKey = key.toLowerCase();
    if (gameState.isSelectLevel) {
      handleLevelSelect(key, lowerKey);
      return false;
    }
    if (gameState.isGameOver) {
      if (key === "Enter") {
        backToMenu();
      }
      return false;
    }
    if (handleGlobalShortcuts(lowerKey)) {
      return false;
    }
    if (gameState.isPaused || gameState.levelUpEffect.show) {
      return false;
    }
    handleDirectionalControls(key);
    drawBoard(gameState.board);
    drawCurr(gameState.curr, gameState.cx, gameState.cy);
  };
  var bindEvents = () => {
    globalThis.addEventListener("resize", resize);
    document.addEventListener("keydown", handleGameControls);
    document.addEventListener("keyup", handleStopHold);
  };
  var init = () => {
    resetBoard();
    loadHighScore();
    gameState.score = 0;
    gameState.lines = 0;
    gameState.level = 1;
    gameState.isGameOver = false;
    gameState.isPaused = false;
    gameState.isHiddenMode = false;
    gameState.isSelectLevel = true;
    resize();
    updateUI(
      gameState.score,
      gameState.lines,
      gameState.level,
      gameState.highScore
    );
    drawLevelSelect(gameState.level);
    bindEvents();
  };
  init();
})();
