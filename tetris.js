var tetris = (() => {
  // lib/constants.js
  var BOARD_COLS = 10;
  var BOARD_ROWS = 20;
  var CLEAR_SCORES = [0, 100, 300, 500, 800];
  var MAX_LEVEL = 99;
  var COLOR_TEAL = '#18c8fa';
  var COLOR_RGBA_TEAL = 'rgba(50, 190, 239, 0.3)';
  var COLOR_YELLOW = '#ff0';
  var COLOR_PURPLE = '#a0a';
  var COLOR_BLUE = '#00f';
  var COLOR_ORANGE = '#ff7f00';
  var COLOR_GREEN = '#0f0';
  var COLOR_RED = '#f00';
  var COLOR_BLACK = '#444';
  var COLOR_RGBA_BLACK = 'rgba(0,0,0,.5)';
  var COLOR_WHITE = '#fff';
  var FIREWORKS_COLORS = [
    COLOR_TEAL,
    COLOR_YELLOW,
    COLOR_PURPLE,
    COLOR_ORANGE,
    COLOR_GREEN,
    COLOR_RED,
  ];
  var TETROMINOES = [
    // I型方块（长条）：1行4列
    { shape: [[1, 1, 1, 1]], color: COLOR_TEAL },
    // O型方块（正方形）：2x2
    {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: COLOR_YELLOW,
    },
    // T型方块
    {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      color: COLOR_PURPLE,
    },
    // L型方块
    {
      shape: [
        [1, 0, 0],
        [1, 1, 1],
      ],
      color: COLOR_BLUE,
    },
    // J型方块
    {
      shape: [
        [0, 0, 1],
        [1, 1, 1],
      ],
      color: COLOR_ORANGE,
    },
    // S型方块（右斜）
    {
      shape: [
        [0, 1, 1],
        [1, 1, 0],
      ],
      color: COLOR_GREEN,
    },
    // Z型方块（左斜）
    {
      shape: [
        [1, 1, 0],
        [0, 1, 1],
      ],
      color: COLOR_RED,
    },
  ];
  var GAME_FONT_FAMILY = `"Press Start 2P", monospace, sans-serif`;

  // lib/utils.js
  var pad = (n, len) => n.toString().padStart(len, '0');
  var formatTime = (date, format = 'yyyy-MM-dd HH:mm:ss') => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const toSymbol = () => {
      return hours > 12 ? 'PM' : 'AM';
    };
    const hasSymbol = format.indexOf('a') > -1;
    const symbols = {
      yyyy: year,
      MM: pad(month, 2),
      dd: pad(day, 2),
      HH: pad(hours, 2),
      hh: hasSymbol && hours > 12 ? hours - 12 : hours,
      mm: pad(minutes, 2),
      ss: pad(seconds, 2),
      // a 表示12小时制
      a: toSymbol(),
    };
    let time = format;
    Object.keys(symbols).forEach((key) => {
      time = time.replace(key, symbols[key]);
    });
    return time;
  };
  var setStorage = (key, value) => {
    localStorage.setItem(key, value);
  };
  var getStorage = (key) => {
    return localStorage.getItem(key);
  };

  // lib/state.js
  var gameState = {
    gameRafId: null,
    gameTimestamp: null,
    // 倒计时状态
    countdown: {
      show: false,
      number: 3,
      scale: 4,
      count: 0,
      rafId: null,
      timestamp: 0,
    },
    clock: {
      rafId: null,
      count: 0,
      timestamp: 0,
    },
    board: [],
    curr: null,
    cx: 0,
    cy: 0,
    next: null,
    baseLines: 0,
    clearEffectsRafId: null,
    clearEffects: [],
    levelUpEffect: {
      show: false,
      timer: 0,
      fireworks: [],
    },
    score: 0,
    lines: 0,
    level: 1,
    highScore: 0,
    isSelectLevel: true,
    isHiddenMode: false,
    isPaused: false,
    isGameOver: false,
    holdP: null,
  };
  function resetBoard() {
    gameState.board = Array.from({ length: BOARD_ROWS }, () =>
      Array.from({ length: BOARD_COLS }).fill(0),
    );
  }
  function loadHighScore() {
    gameState.highScore =
      Number.parseInt(getStorage('tetris-high-score'), 10) || 0;
  }
  function saveHighScore() {
    const { score } = gameState;
    if (score > gameState.highScore) {
      gameState.highScore = score;
      setStorage('tetris-high-score', gameState.highScore.toString());
    }
  }

  // lib/audio.js
  var AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
  var audioCtx = new AudioContext();
  var bgmTimer = null;
  var bgmEnabled = true;
  var sounds = {
    // 等级选择界面（正弦波柔和音效）
    levelSelect: () => playTone(523, 80, 0.1, 'sine'),
    // 倒计时音效
    countdown: () => playTone(784, 180, 0.3, 'sine'),
    // 等级开始 / 升级
    levelStart: () => playTone(1319, 160, 0.22, 'sine'),
    // 背景音乐开关
    bgmToggle: () => playTone(440, 100),
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
      playTone(587, 220, 0.35, 'square');
      setTimeout(() => playTone(698, 260, 0.32, 'square'), 160);
      setTimeout(() => playTone(880, 300, 0.3, 'square'), 320);
      setTimeout(() => playTone(1174, 380, 0.25, 'square'), 480);
    },
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
    // 暂停
    pause: () => playTone(300, 150),
    // 秒针走动音效
    secondTick: () => playTone(880, 50, 0.085, 'sine'),
    // 恢复游戏
    resume: () => playTone(400, 150),
    // 游戏结束（悲伤旋律）
    gameOver: () => {
      playTone(330, 200);
      setTimeout(() => playTone(294, 300), 210);
      setTimeout(() => playTone(262, 500), 520);
    },
  };
  function playTone(freq, dur, vol = 0.1, wave = 'square') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    setTimeout(() => osc.stop(), dur);
  }
  var loopPlayBGM = (i, m) => {
    if (i >= m.length) {
      i = 0;
    }
    playTone(m[i], 110, 0.05);
    bgmTimer = setTimeout(() => loopPlayBGM(i + 1, m), 130);
  };
  function stopBGM() {
    if (bgmTimer) {
      clearTimeout(bgmTimer);
    }
    bgmTimer = null;
  }
  function playBGM() {
    if (!bgmEnabled) {
      return false;
    }
    stopBGM();
    const m = [
      659, 659, 587, 659, 784, 880, 523, 523, 440, 523, 659, 784, 659, 659, 587,
      659, 784, 880, 988, 880, 784, 659, 880, 784, 659, 587, 523, 587, 659, 784,
      659, 587,
    ];
    loopPlayBGM(0, m);
  }
  function toggleBGM() {
    bgmEnabled = !bgmEnabled;
    sounds.bgmToggle();
    if (bgmEnabled) {
      playBGM();
    } else {
      stopBGM();
    }
  }

  // lib/game.js
  function randomTetromino() {
    const randomIndex = Math.floor(Math.random() * TETROMINOES.length);
    return TETROMINOES[randomIndex];
  }
  var startGame = () => {
    const $level = document.querySelector('#level');
    if ($level) {
      $level.textContent = pad(gameState.level, 2);
    }
    spawn();
    sounds.levelStart();
    setTimeout(() => {
      playBGM();
    }, 250);
    updateSpeed();
  };
  var getSpeed = () =>
    // 计算速度：基础值1000ms，每升一级减少80ms，最低不低于100ms
    Math.max(100, 1e3 - (gameState.level - 1) * 80);
  var gameSpeedLoop = (timestamp) => {
    const dropInterval = getSpeed();
    if (
      !gameState.gameTimestamp ||
      timestamp - gameState.gameTimestamp > dropInterval
    ) {
      loop();
      gameState.gameTimestamp = timestamp;
    }
    gameState.gameRafId = requestAnimationFrame(gameSpeedLoop);
  };
  function updateSpeed() {
    cancelAnimationFrame(gameState.gameRafId);
    gameState.gameRafId = requestAnimationFrame(gameSpeedLoop);
  }
  function gameOver() {
    if (gameState.isGameOver) {
      return false;
    }
    gameState.isGameOver = true;
    stopBGM();
    cancelAnimationFrame(gameState.gameRafId);
    sounds.gameOver();
    saveHighScore();
    setTimeout(drawOver, 20);
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
        gameState.highScore,
      );
      saveHighScore();
      return false;
    }
    for (const y of linesToClear) {
      addClearEffect(y);
    }
    sounds.clear();
    triggerClearEffect();
    return true;
  }
  function spawn() {
    gameState.curr = gameState.next || randomTetromino();
    gameState.next = randomTetromino();
    gameState.cx =
      Math.floor(BOARD_COLS / 2) -
      Math.floor(gameState.curr.shape[0].length / 2);
    gameState.cy = 0;
    drawNext(gameState.next);
    if (collision(0, 0)) {
      gameOver();
    }
  }
  function lock() {
    const s = gameState.curr.shape;
    for (let y = 0; y < s.length; y++) {
      for (let x = 0; x < s[y].length; x++) {
        if (s[y][x]) {
          gameState.board[gameState.cy + y][gameState.cx + x] =
            gameState.curr.color;
        }
      }
    }
  }
  function loop() {
    if (gameState.levelUpEffect.show) {
      updateLevelUpEffect();
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
  function collision(ox, oy) {
    const s = gameState.curr.shape;
    for (let y = 0; y < s.length; y++) {
      for (let x = 0; x < s[y].length; x++) {
        if (s[y][x]) {
          const nx = gameState.cx + x + ox;
          const ny = gameState.cy + y + oy;
          if (
            nx < 0 ||
            nx >= BOARD_COLS ||
            ny >= BOARD_ROWS ||
            (ny >= 0 && gameState.board[ny][nx])
          ) {
            return true;
          }
        }
      }
    }
    return false;
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
  var rotate = () => {
    const prev = gameState.curr.shape;
    gameState.curr.shape = prev[0].map((_, i) =>
      prev.map((r) => r[i]).toReversed(),
    );
    if (collision(0, 0)) {
      gameState.curr.shape = prev;
    } else {
      sounds.rotate();
    }
  };
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

  // lib/ui.js
  var canvas = document.querySelector('#game-board');
  var ctx = canvas.getContext('2d');
  var nextCanvas = document.querySelector('#next-piece');
  var nextCtx = nextCanvas.getContext('2d');
  var BLOCK_SIZE;
  var baseFontSize;
  var drawTetrisText = () => {
    const { width, height } = canvas;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${baseFontSize * 1.1}px ${GAME_FONT_FAMILY}`;
    ctx.fillStyle = COLOR_GREEN;
    ctx.fillText('TETRIS.JS', width / 2, height * 0.1);
    ctx.restore();
  };
  var drawTextEnterStart = () => {
    const { width, height } = canvas;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${baseFontSize * 1.15}px ${GAME_FONT_FAMILY}`;
    ctx.fillStyle = COLOR_TEAL;
    ctx.fillText('ENTER START', width / 2, height * 0.7);
    ctx.restore();
  };
  function drawClock() {
    const time = /* @__PURE__ */ new Date();
    const h = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2.2;
    const radius = Math.floor(width * 0.25);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.lineCap = 'round';
    ctx.strokeStyle = COLOR_TEAL;
    ctx.fillStyle = COLOR_TEAL;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.lineWidth = Math.floor(width * 0.064);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_RGBA_TEAL;
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
    ctx.strokeStyle = COLOR_ORANGE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.75);
    ctx.stroke();
    ctx.restore();
    const pointRadius = Math.floor(width * 0.014);
    ctx.save();
    ctx.fillStyle = COLOR_ORANGE;
    ctx.beginPath();
    ctx.arc(0, 0, pointRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.restore();
  }
  var drawDigitalTime = () => {
    const { width, height } = canvas;
    const time = /* @__PURE__ */ new Date();
    ctx.save();
    ctx.fillStyle = COLOR_GREEN;
    ctx.textAlign = 'center';
    ctx.font = `${baseFontSize * 0.86}px ${GAME_FONT_FAMILY}`;
    ctx.fillText(`${formatTime(time, 'HH:mm:ss')}`, width / 2, height / 3.65);
    ctx.shadowColor = COLOR_WHITE;
    ctx.shadowBlur = 13;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.restore();
  };
  var drawFireworksEffect = () => {
    const { fireworks } = gameState.levelUpEffect;
    for (const fire of fireworks) {
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
  function drawCountdownEffect() {
    const { width, height } = canvas;
    const cd = gameState.countdown;
    clearBoard();
    ctx.save();
    ctx.fillStyle = COLOR_RGBA_BLACK;
    ctx.fillRect(0, 0, width, height);
    drawTetrisText();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(width / 2, height / 2);
    ctx.scale(cd.scale, cd.scale);
    ctx.font = `${baseFontSize * 3.25}px ${GAME_FONT_FAMILY}`;
    ctx.fillStyle = COLOR_YELLOW;
    ctx.strokeStyle = COLOR_BLACK;
    ctx.lineWidth = 6;
    ctx.strokeText(cd.number.toString(), 0, 0);
    ctx.fillText(cd.number.toString(), 0, 0);
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `${baseFontSize * 1.1}px ${GAME_FONT_FAMILY}`;
    ctx.fillStyle = COLOR_GREEN;
    ctx.strokeStyle = COLOR_BLACK;
    ctx.strokeText('GET READY!', width / 2, height / 1.46);
    ctx.fillText('GET READY!', width / 2, height / 1.46);
    ctx.restore();
    ctx.restore();
  }
  function triggerCountdownEffect() {
    gameState.countdown = {
      show: true,
      number: 3,
      scale: 4,
      count: 0,
      rafId: null,
      timestamp: null,
    };
    gameState.countdown.rafId = requestAnimationFrame(updateCountdownEffect);
    sounds.countdown();
  }
  function updateCountdownEffect(timestamp) {
    const cd = gameState.countdown;
    if (!cd.timestamp || timestamp - cd.timestamp > 100) {
      drawCountdownEffect();
      cd.count += 1;
      cd.scale = Math.max(1, cd.scale - 0.4);
      if (cd.count >= 50) {
        cd.count = 0;
        cd.number--;
        cd.scale = 4;
        if (cd.number >= 1) {
          sounds.countdown();
        }
      }
      if (cd.number <= 0) {
        cancelAnimationFrame(cd.rafId);
        cd.show = false;
        cd.number = 3;
        cd.scale = 4;
        cd.count = 0;
        cd.rafId = null;
        cd.timestamp = 0;
        startGame();
        return true;
      }
    }
    cd.rafId = requestAnimationFrame(updateCountdownEffect);
  }
  function drawLevelUpEffect() {
    const effect = gameState.levelUpEffect;
    const { width, height } = canvas;
    if (!effect.show) {
      return false;
    }
    ctx.save();
    ctx.fillStyle = COLOR_RGBA_BLACK;
    ctx.fillRect(0, 0, width, height);
    drawTetrisText();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${baseFontSize * 1.2}px ${GAME_FONT_FAMILY}`;
    ctx.fillStyle = COLOR_GREEN;
    ctx.fillText(`LEVEL UP`, width / 2, height / 2.5);
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${baseFontSize * 2.5}px ${GAME_FONT_FAMILY}`;
    ctx.fillStyle = COLOR_GREEN;
    ctx.fillText(`${gameState.level}`, width / 2, height / 1.85);
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${baseFontSize * 1.3}px ${GAME_FONT_FAMILY}`;
    ctx.fillStyle = COLOR_YELLOW;
    ctx.strokeStyle = COLOR_BLACK;
    ctx.lineWidth = 3;
    ctx.strokeText('CONGRATS!', width / 2, height / 1.6);
    ctx.fillText('CONGRATS!', width / 2, height / 1.6);
    ctx.restore();
    drawFireworksEffect();
    ctx.restore();
    return true;
  }
  function triggerLevelUpEffect() {
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
        alpha: 1,
      });
    }
    gameState.levelUpEffect.fireworks = fireworks;
    stopBGM();
    sounds.levelUp();
  }
  function updateLevelUpEffect() {
    gameState.levelUpEffect.timer++;
    if (gameState.levelUpEffect.timer > 3) {
      gameState.levelUpEffect.show = false;
      gameState.levelUpEffect.fireworks = [];
      playBGM();
      return true;
    }
    return false;
  }
  function drawClearEffect() {
    for (const line of gameState.clearEffects) {
      ctx.save();
      ctx.globalAlpha = line.alpha;
      for (let x = 0; x < BOARD_COLS; x++) {
        drawBlock(ctx, x, line.y, line.color);
      }
      ctx.restore();
    }
  }
  function triggerClearEffect() {
    drawBoard(gameState.board);
    drawCurr(gameState.curr, gameState.cx, gameState.cy);
    drawClearEffect();
    if (updateClearEffect()) {
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
        triggerLevelUpEffect();
      }
      gameState.level = Math.min(
        Math.max(gameState.level, newLevel),
        MAX_LEVEL,
      );
      updateSpeed();
      updateUI(
        gameState.score,
        gameState.lines,
        gameState.level,
        gameState.highScore,
      );
      saveHighScore();
      gameState.clearEffects = [];
      cancelAnimationFrame(gameState.clearEffectsRafId);
    } else {
      gameState.clearEffectsRafId = requestAnimationFrame(triggerClearEffect);
    }
  }
  function updateClearEffect() {
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
  }
  function addClearEffect(y) {
    const isLineContains = gameState.clearEffects.some((line) => line.y === y);
    if (!isLineContains) {
      gameState.clearEffects.push({ y, alpha: 1, timer: 0 });
    }
  }
  function drawBlock(ctx2, x, y, color) {
    const bs = BLOCK_SIZE;
    const gap = 1;
    const size = bs - gap * 2;
    const px = x * bs + gap;
    const py = y * bs + gap;
    ctx2.fillStyle = color;
    ctx2.fillRect(px, py, size, size);
    ctx2.strokeStyle = COLOR_BLACK;
    ctx2.strokeRect(px, py, size, size);
  }
  function clearBoard() {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
  }
  function clearNext() {
    const { width, height } = canvas;
    nextCtx.clearRect(0, 0, width, height);
  }
  function drawBoard(board) {
    clearBoard();
    for (let y = 0; y < BOARD_ROWS; y++) {
      for (let x = 0; x < BOARD_COLS; x++) {
        if (board[y][x]) {
          drawBlock(ctx, x, y, board[y][x]);
        }
      }
    }
  }
  function drawCurr(curr, cx, cy) {
    const { shape, color } = curr;
    const { length } = shape;
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          drawBlock(ctx, cx + x, cy + y, color);
        }
      }
    }
    return true;
  }
  function drawNext(next) {
    const { shape } = next;
    const { width, height } = nextCanvas;
    const gridSize = 5;
    const blockSize = Math.floor(width / gridSize);
    const ox = Math.floor((width - shape[0].length * blockSize) / 2);
    const oy = Math.floor((height - shape.length * blockSize) / 2);
    clearNext();
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
  }
  function drawLevelSelect(level) {
    const { width, height } = canvas;
    clearBoard();
    ctx.save();
    ctx.fillStyle = COLOR_RGBA_BLACK;
    ctx.fillRect(0, 0, width, height);
    drawTetrisText();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${baseFontSize}px ${GAME_FONT_FAMILY}`;
    ctx.fillStyle = COLOR_GREEN;
    ctx.fillText('LEVEL', width / 2, height * 0.35);
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${baseFontSize * 3}px ${GAME_FONT_FAMILY}`;
    ctx.fillStyle = COLOR_GREEN;
    ctx.fillText(level.toString(), width / 2, height * 0.5);
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${baseFontSize}px ${GAME_FONT_FAMILY}`;
    ctx.fillStyle = COLOR_WHITE;
    ctx.fillText('1-9 KEY', width / 2, height * 0.58);
    ctx.restore();
    drawTextEnterStart();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `${baseFontSize * 0.9}px ${GAME_FONT_FAMILY}`;
    ctx.fillStyle = COLOR_WHITE;
    ctx.fillText('P 3SEC: HIDDEN', width / 2, height * 0.8);
    ctx.restore();
    ctx.restore();
  }
  function drawPause() {
    const { width, height } = canvas;
    clearBoard();
    drawBoard(gameState.board);
    drawCurr(gameState.curr, gameState.cx, gameState.cy);
    ctx.fillStyle = COLOR_RGBA_BLACK;
    ctx.fillRect(0, 0, width, height);
    drawTetrisText();
    drawDigitalTime();
    drawClock();
    ctx.save();
    ctx.fillStyle = COLOR_YELLOW;
    ctx.textAlign = 'center';
    ctx.font = `${baseFontSize * 1.6}px ${GAME_FONT_FAMILY}`;
    ctx.fillText('PAUSED', width / 2, height / 1.45);
    ctx.shadowColor = COLOR_WHITE;
    ctx.shadowBlur = 13;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.restore();
  }
  var updateDrawClock = (timestamp) => {
    const { clock, isPaused } = gameState;
    if (!isPaused) {
      return false;
    }
    if (!clock.timestamp || timestamp - clock.timestamp > 100) {
      drawPause();
      clock.count += 1;
      if (clock.count >= 50) {
        clock.count = 0;
        sounds.secondTick();
      }
    }
    clock.rafId = requestAnimationFrame(updateDrawClock);
  };
  function drawOver() {
    const { width, height } = canvas;
    ctx.fillStyle = COLOR_RGBA_BLACK;
    ctx.fillRect(0, 0, width, height);
    drawTetrisText();
    ctx.save();
    ctx.fillStyle = COLOR_RED;
    ctx.strokeStyle = COLOR_YELLOW;
    ctx.textAlign = 'center';
    ctx.font = `${baseFontSize * 2.3}px ${GAME_FONT_FAMILY}`;
    ctx.strokeText('GAME', width / 2, height / 2.2);
    ctx.fillText('GAME', width / 2, height / 2.2);
    ctx.restore();
    ctx.save();
    ctx.fillStyle = COLOR_RED;
    ctx.strokeStyle = COLOR_YELLOW;
    ctx.textAlign = 'center';
    ctx.font = `${baseFontSize * 2.3}px ${GAME_FONT_FAMILY}`;
    ctx.strokeText('OVER', width / 2, height / 1.8);
    ctx.fillText('OVER', width / 2, height / 1.8);
    ctx.restore();
    drawTextEnterStart();
  }
  function forceOver() {
    if (gameState.isPaused) {
      return false;
    }
    stopBGM();
    gameState.isGameOver = true;
    gameState.isPaused = false;
    gameState.countdown.show = false;
    gameState.isHiddenMode = false;
    cancelAnimationFrame(gameState.gameRafId);
    sounds.gameOver();
    saveHighScore();
    setTimeout(() => {
      drawOver();
    }, 10);
    return true;
  }
  function resize() {
    const { isSelectLevel, isGameOver, board, curr, cx, cy, level, next } =
      gameState;
    const h = globalThis.innerHeight * 0.9;
    BLOCK_SIZE = Math.floor(h / BOARD_ROWS);
    canvas.width = BLOCK_SIZE * BOARD_COLS;
    canvas.height = BLOCK_SIZE * BOARD_ROWS;
    baseFontSize = Math.floor(canvas.height * 0.032);
    const nextSize = Math.min(
      globalThis.innerWidth * 0.1,
      globalThis.innerHeight * 0.18,
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
  }
  function updateUI(score, lines, level, highScore) {
    document.querySelector('#score').textContent = pad(score, 5);
    document.querySelector('#lines').textContent = pad(lines, 2);
    document.querySelector('#level').textContent = pad(level, 2);
    document.querySelector('#highScore').textContent = pad(highScore, 5);
  }

  // lib/tetris.js
  var start = () => {
    gameState.isSelectLevel = false;
    gameState.baseLines = (gameState.level - 1) * 10;
    triggerCountdownEffect();
  };
  var togglePause = () => {
    if (gameState.isGameOver || gameState.isSelectLevel) {
      return false;
    }
    const { clock } = gameState;
    gameState.isPaused = !gameState.isPaused;
    if (gameState.isPaused) {
      cancelAnimationFrame(gameState.gameRafId);
      stopBGM();
      sounds.pause();
      clock.rafId = requestAnimationFrame(updateDrawClock);
    } else {
      cancelAnimationFrame(clock.rafId);
      clock.rafId = null;
      clock.timestamp = 0;
      clock.count = 0;
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
      gameState.highScore,
    );
    spawn();
    playBGM();
    updateSpeed();
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
  var executeDrawLevelSelectCommand = () => {
    stopBGM();
    cancelAnimationFrame(gameState.gameRafId);
    resetBoard();
    gameState.isGameOver = false;
    gameState.isHiddenMode = false;
    gameState.isSelectLevel = true;
    gameState.score = 0;
    gameState.lines = 0;
    gameState.level = 1;
    gameState.next = null;
    updateUI(
      gameState.score,
      gameState.lines,
      gameState.level,
      gameState.highScore,
    );
    drawLevelSelect(gameState.level);
  };
  var executeLevelSelectionCommand = (key, lowerKey) => {
    if (key >= '1' && key <= '9') {
      gameState.level = Number.parseInt(key, 10);
      sounds.levelSelect();
      drawLevelSelect(gameState.level);
    }
    if (lowerKey === 'p') {
      startHold();
    }
    if (key === 'Enter') {
      start();
    }
  };
  var executeShortcutsCommand = (lowerKey) => {
    const commands = {
      m: toggleBGM,
      // M: 切换背景音乐
      r: restartGame,
      // R: 重新开始游戏
      q: forceOver,
      // Q: 强制结束游戏
      p: togglePause,
      // P: 暂停/继续游戏
    };
    const command = commands[lowerKey];
    if (command) {
      command();
      return true;
    }
    return false;
  };
  function executeDirectionControlCommand(key) {
    const controls = {
      ArrowLeft: () => move(-1, 0),
      // 左移
      ArrowRight: () => move(1, 0),
      // 右移
      ArrowDown: () => move(0, 1),
      // 下移
      ArrowUp: rotate,
      // 旋转方块
      ' ': drop,
      // 空格：直接落地
    };
    const action = controls[key];
    if (action) {
      action();
    }
  }
  function onResize() {
    resize();
  }
  var onPauseStop = (e) => {
    if (e.key.toLowerCase() === 'p') {
      stopHold();
    }
  };
  var onControlButtonsPress = (e) => {
    const { key } = e;
    const lowerKey = key.toLowerCase();
    if (gameState.countdown.show || gameState.levelUpEffect.show) {
      return false;
    }
    if (gameState.isSelectLevel) {
      executeLevelSelectionCommand(key, lowerKey);
      return false;
    }
    if (gameState.isGameOver) {
      if (key === 'Enter') {
        executeDrawLevelSelectCommand();
      }
      return false;
    }
    if (executeShortcutsCommand(lowerKey)) {
      return false;
    }
    if (gameState.isPaused) {
      return false;
    }
    executeDirectionControlCommand(key);
    drawBoard(gameState.board);
    drawCurr(gameState.curr, gameState.cx, gameState.cy);
  };
  var lazyDrawLevelSelect = () => {
    if (document?.fonts?.load) {
      document.fonts.load('40px "Press Start 2P"').then(() => {
        drawLevelSelect(gameState.level);
      });
    } else {
      setTimeout(() => {
        drawLevelSelect(gameState.level);
      }, 150);
    }
  };
  var bindEvents = () => {
    globalThis.addEventListener('resize', onResize);
    document.addEventListener('keydown', onControlButtonsPress);
    document.addEventListener('keyup', onPauseStop);
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
      gameState.highScore,
    );
    lazyDrawLevelSelect();
    bindEvents();
  };
  init();
})();
