import {
  BOARD_COLS,
  BOARD_ROWS,
  CLEAR_SCORES,
  MAX_LEVEL,
  COLOR_RGBA_BLACK,
  COLOR_BLACK,
  COLOR_GREEN,
  COLOR_RED,
  COLOR_TEAL,
  COLOR_YELLOW,
  COLOR_WHITE,
  FIREWORKS_COLORS,
  GAME_FONT_FAMILY,
} from './constants.js';
import { stopBGM, sounds, playBGM } from './audio.js';
import { pad } from './utils.js';
import { gameState, saveHighScore } from './state.js';
import { startGame, updateSpeed } from './game.js';

// 主画布
const canvas = document.querySelector('#game-board');
const ctx = canvas.getContext('2d');
// 方块预览画布
const nextCanvas = document.querySelector('#next-piece');
const nextCtx = nextCanvas.getContext('2d');

// 全局尺寸
let BLOCK_SIZE;
let baseFontSize;

/**
 * # 绘制倒计时
 *
 * 绘制倒计时 3 2 1 动画界面
 *
 * @function drawCountDownEffect
 * @returns {void}
 */
export function drawCountDownEffect() {
  const { width, height } = canvas;
  const cd = gameState.countDown;

  clearBoard();

  ctx.save();
  ctx.fillStyle = COLOR_RGBA_BLACK;
  ctx.fillRect(0, 0, width, height);

  /* ======== 绘制文本：TETRIS.JS ======== */
  ctx.save();
  // 设置文本居中对齐
  ctx.textAlign = 'center';
  // 设置像素风格字体与大小
  ctx.font = `${baseFontSize * 1.1}px ${GAME_FONT_FAMILY}`;
  ctx.fillStyle = COLOR_GREEN;
  ctx.fillText('TETRIS.JS', width / 2, height * 0.1);
  ctx.restore();

  // 数字：缩放动画
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.translate(width / 2, height / 2);
  ctx.scale(cd.scale, cd.scale);
  // 设置数字样式
  ctx.font = `${baseFontSize * 3.25}px ${GAME_FONT_FAMILY}`;
  ctx.fillStyle = COLOR_YELLOW;
  ctx.strokeStyle = COLOR_BLACK;
  ctx.lineWidth = 6;
  ctx.strokeText(cd.number.toString(), 0, 0);
  ctx.fillText(cd.number.toString(), 0, 0);
  ctx.restore();

  // 文字：固定大小、不缩放
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  // 固定字体大小，不再跟着 scale 变
  ctx.font = `${baseFontSize * 1.1}px ${GAME_FONT_FAMILY}`;
  ctx.fillStyle = COLOR_GREEN;
  ctx.strokeStyle = COLOR_BLACK;
  ctx.strokeText('GET READY!', width / 2, height / 2 + 120);
  ctx.fillText('GET READY!', width / 2, height / 2 + 120);
  ctx.restore();

  ctx.restore();
}

/**
 * # 触发倒计时
 *
 * 显示 3 2 1 倒计时动画界面，播放倒计时音效
 *
 * @function triggerCountDownEffect
 * @returns {void}
 */
export function triggerCountDownEffect() {
  gameState.countDown = {
    show: true,
    number: 3,
    scale: 4,
    timer: null,
    count: 0,
  };

  updateCountDownEffect();
  sounds.countDown();
}

/**
 * # 更新倒计时逻辑
 *
 * 绘制倒计时 3 2 1 动画界面
 *
 * @function updateCountDownEffect
 * @returns {boolean} - 执行结束返回 true
 */
export function updateCountDownEffect() {
  const cd = gameState.countDown;

  if (cd.timer) {
    clearTimeout(cd.timer);
  }

  drawCountDownEffect();
  cd.count += 1;
  // 缩放变小
  cd.scale = Math.max(1, cd.scale - 0.4);

  if (cd.count >= 20) {
    cd.count = 0;
    cd.number--;
    cd.scale = 4;

    if (cd.number >= 1) {
      sounds.countDown();
    }
  }

  // 倒计时结束
  if (cd.number <= 0) {
    // 重置数据
    clearTimeout(cd.timer);
    cd.show = false;
    cd.number = 3;
    cd.scale = 4;
    cd.timer = null;
    cd.count = 0;

    // 开始游戏
    startGame();

    return true;
  }

  cd.timer = setTimeout(() => {
    updateCountDownEffect();
  }, 50);
}

/**
 * # 绘制升级庆祝文字 + 烟花
 *
 * @function drawLevelUpEffect
 * @returns {boolean} - 不在升级中，返回 false，否则 true
 */
export function drawLevelUpEffect() {
  const effect = gameState.levelUpEffect;
  const { width, height } = canvas;

  if (!effect.show) {
    return false;
  }

  ctx.save();

  // 半透明遮罩
  ctx.fillStyle = COLOR_RGBA_BLACK;
  ctx.fillRect(0, 0, width, height);

  /* ======== 绘制文本：TETRIS.JS ======== */
  ctx.save();
  // 设置文本居中对齐
  ctx.textAlign = 'center';
  // 设置像素风格字体与大小
  ctx.font = `${baseFontSize * 1.1}px ${GAME_FONT_FAMILY}`;
  ctx.fillStyle = COLOR_GREEN;
  ctx.fillText('TETRIS.JS', width / 2, height * 0.1);
  ctx.restore();

  ctx.save();
  /* ======== 绘制 Level UP ======== */
  ctx.textAlign = 'center';
  ctx.font = `${baseFontSize * 1.2}px ${GAME_FONT_FAMILY}`;
  ctx.fillStyle = COLOR_GREEN;
  ctx.fillText(`LEVEL UP`, width / 2, height / 2.5);
  ctx.restore();

  ctx.save();
  /* ======== 绘制 Level 数值 ======== */
  ctx.textAlign = 'center';
  ctx.font = `${baseFontSize * 2.5}px ${GAME_FONT_FAMILY}`;
  ctx.fillStyle = COLOR_GREEN;
  ctx.fillText(`${gameState.level}`, width / 2, height / 1.85);
  ctx.restore();

  /* ======== 绘制 Congrats ======== */
  ctx.save();
  // 绘制 Congrats
  ctx.textAlign = 'center';
  ctx.font = `${baseFontSize * 1.3}px ${GAME_FONT_FAMILY}`;
  ctx.fillStyle = COLOR_YELLOW;
  ctx.strokeStyle = COLOR_BLACK;
  ctx.lineWidth = 3;
  ctx.strokeText('CONGRATS!', width / 2, height / 1.6);
  ctx.fillText('CONGRATS!', width / 2, height / 1.6);
  ctx.restore();

  // 绘制烟花
  for (const fire of effect.fireworks) {
    ctx.globalAlpha = fire.alpha;
    ctx.fillStyle = fire.color;
    ctx.beginPath();
    ctx.arc(fire.x, fire.y, fire.radius, 0, Math.PI * 2);
    ctx.fill();

    // 粒子向外扩散，形成中心爆炸效果
    fire.x += fire.vx;
    fire.y += fire.vy;
    fire.alpha -= 0.024;
  }

  ctx.restore();

  return true;
}

/**
 * # 触发升级庆祝特效
 *
 * @function triggerLevelUpEffect
 * @returns {void}
 */
export function triggerLevelUpEffect() {
  const { width, height } = canvas;
  // 生成一批烟花
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
  // 播放升级的音乐
  sounds.levelUp();
}

/**
 * # 更新升级动画帧
 *
 * @function updateLevelUpEffect
 * @returns {boolean} 动画是否结束
 */
export function updateLevelUpEffect() {
  gameState.levelUpEffect.timer++;

  // 动画持续约 3 秒
  if (gameState.levelUpEffect.timer > 3) {
    gameState.levelUpEffect.show = false;
    gameState.levelUpEffect.fireworks = [];
    playBGM();

    return true;
  }

  return false;
}

/**
 * # 绘制整行闪烁特效
 *
 * 遍历所有待消除的行，根据当前透明度绘制白色高亮闪烁效果 仅在消行动画期间执行，不影响正常游戏画面渲染
 *
 * @function drawClearEffect
 * @returns {void}
 */
export function drawClearEffect() {
  // 遍历所有需要闪烁消除的行数据
  for (const line of gameState.clearEffects) {
    // 保存画布上下文状态，避免透明度影响其他绘制
    ctx.save();

    // 设置当前行的透明度，控制闪烁显隐
    ctx.globalAlpha = line.alpha;

    // 整行绘制白色闪烁块（覆盖整行，视觉效果最明显）
    for (let x = 0; x < BOARD_COLS; x++) {
      drawBlock(ctx, x, line.y, line.color);
    }

    // 恢复画布上下文状态
    ctx.restore();
  }
}

/**
 * # 闪烁动画执行函数
 *
 * 执行消行前的闪烁动画，等待 3 次闪烁全部完成 动画期间持续渲染游戏画面 + 闪烁特效 动画结束后执行真正地消行、计分、升级逻辑
 *
 * @function triggerClearEffect
 * @returns {void}
 */
export function triggerClearEffect() {
  // 绘制游戏主棋盘
  drawBoard(gameState.board);
  // 绘制当前下落方块
  drawCurr(gameState.curr, gameState.cx, gameState.cy);
  // 绘制消行闪烁特效
  drawClearEffect();

  // 检查闪烁动画是否全部完成
  if (updateClearEffect()) {
    // ====================== 闪烁结束 → 执行消行 ======================
    let clear = 0;

    // 从下往上遍历，删除所有满行
    for (let y = BOARD_ROWS - 1; y >= 0; y--) {
      const isFullLine = gameState.board[y].every((cell) => !!cell);

      if (isFullLine) {
        // 删除当前满行
        gameState.board.splice(y, 1);
        // 顶部添加新空行
        gameState.board.unshift(Array.from({ length: BOARD_COLS }).fill(0));
        clear++;
        // 删除后索引回退，重新检查当前位置
        y++;
      }
    }

    /* ====================== 更新分数、行数、等级 ====================== */
    gameState.lines += clear;
    gameState.score += CLEAR_SCORES[clear] * gameState.level;

    // 计算当前等级（每 10 行升级）
    const totalLines = gameState.baseLines + gameState.lines;
    const newLevel = Math.floor(totalLines / 10) + 1;
    const oldLevel = gameState.level;

    // 触发升级特效
    if (newLevel > oldLevel) {
      triggerLevelUpEffect();
    }

    // 限制等级范围
    gameState.level = Math.min(Math.max(gameState.level, newLevel), MAX_LEVEL);

    // 更新游戏速度与界面显示
    updateSpeed();
    updateUI(
      gameState.score,
      gameState.lines,
      gameState.level,
      gameState.highScore,
    );

    // 保存最高分
    saveHighScore();

    // 清空特效队列
    gameState.clearEffects = [];
  } else {
    // 动画未完成 → 继续下一帧
    requestAnimationFrame(triggerClearEffect);
  }
}

/**
 * # 更新消除行闪烁动画状态
 *
 * 控制每行严格闪烁 3 次（亮 → 暗 → 亮 → 暗 → 亮 → 暗）
 *
 * @function updateClearEffect
 * @returns {boolean} - 所有行闪烁动画是否全部完成，true 表示全部结束
 */
export function updateClearEffect() {
  // 标记：所有闪烁动画是否完成
  let allDone = true;

  // 遍历所有正在闪烁的行
  for (const line of gameState.clearEffects) {
    // 计算当前动画阶段：每 0.12 秒切换一次亮/暗
    const phase = Math.floor(line.timer / 0.12);

    // 偶数阶段显示（alpha=1），奇数阶段隐藏（alpha=0），实现闪烁效果
    line.alpha = phase % 2 === 0 ? 1 : 0;

    // 推进动画时间（固定 16ms，对应 60fps 游戏帧率）
    line.timer += 0.016;

    // 总时长 0.72 秒 = 0.12s × 6段，刚好完成 3 次完整闪烁
    if (line.timer < 0.72) {
      // 只要有一行未完成，整体标记为未完成
      allDone = false;
    }
  }

  // 返回动画是否全部结束
  return allDone;
}

/**
 * # 向消除特效队列中添加一行需要闪烁的行
 *
 * 用于在消行前，标记哪一行需要执行闪烁动画，同一行只会添加一次，避免重复渲染导致异常
 *
 * @function addClearEffect
 * @param {number} y - 需要闪烁消除的行号
 * @returns {void}
 */
export function addClearEffect(y) {
  const isLineContains = gameState.clearEffects.some((line) => line.y === y);

  // 检查当前行是否已在特效队列中，避免重复添加
  if (!isLineContains) {
    // 向队列添加新闪烁行：初始透明度 1（完全显示），计时器从 0 开始
    gameState.clearEffects.push({ y, alpha: 1, timer: 0 });
  }
}

/**
 * # 绘制单个方块
 *
 * 在 Canvas 上绘制一个带边框的单个方块（网格单元）
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 渲染上下文
 * @param {number} x - 方块在网格中的 X 轴坐标（列数）
 * @param {number} y - 方块在网格中的 Y 轴坐标（行数）
 * @param {string} color - 方块的填充颜色（支持十六进制、rgb、颜色名等）
 * @returns {void}
 */
export function drawBlock(ctx, x, y, color) {
  // 方块基础尺寸
  const bs = BLOCK_SIZE;
  // 方块之间的间隔间隙
  const gap = 1;
  // 实际绘制的方块大小（扣除两侧间隙）
  const size = bs - gap * 2;
  // 计算方块在 Canvas 上的实际像素坐标 X
  const px = x * bs + gap;
  // 计算方块在 Canvas 上的实际像素坐标 Y
  const py = y * bs + gap;

  // 设置填充色并绘制实心方块
  ctx.fillStyle = color;
  ctx.fillRect(px, py, size, size);
  // 设置黑色边框并绘制方块轮廓
  ctx.strokeStyle = COLOR_BLACK;
  ctx.strokeRect(px, py, size, size);
}

/**
 * # 清空整个画布
 *
 * 为重新绘制棋盘做准备
 *
 * @function clearBoard
 * @returns {void}
 */
export function clearBoard() {
  const { width, height } = canvas;

  // 清空整个画布，为重新绘制棋盘做准备
  ctx.clearRect(0, 0, width, height);
}

/**
 * # 绘制面板
 *
 * 渲染并绘制完整的游戏棋盘（核心功能：清空画布 → 遍历棋盘网格 → 绘制所有存在的方块）
 *
 * @function drawBoard
 * @param {string[][]} board - 游戏棋盘二维数组，存储每个格子的颜色值，空值表示无方块
 * @returns {void}
 */
export function drawBoard(board) {
  // 清空整个画布
  clearBoard();

  // 双层循环遍历棋盘所有行和列（Y 轴为行，X 轴为列）
  for (let y = 0; y < BOARD_ROWS; y++) {
    for (let x = 0; x < BOARD_COLS; x++) {
      // 如果当前棋盘格子有颜色值（存在方块），则调用方块绘制函数
      if (board[y][x]) {
        drawBlock(ctx, x, y, board[y][x]);
      }
    }
  }
}

/**
 * # 绘制当前方块
 *
 * 遍历当前方块的形状矩阵，在指定位置绘制所有格子
 *
 * @function drawCurr
 * @param {object} curr - 当前活动方块对象
 * @param {number[][]} curr.shape - 方块的形状矩阵（二维数组，非0表示有格子）
 * @param {string} curr.color - 方块的填充颜色
 * @param {number} cx - 方块左上角在棋盘上的 X 坐标（列）
 * @param {number} cy - 方块左上角在棋盘上的 Y 坐标（行）
 * @returns {void}
 */
export function drawCurr(curr, cx, cy) {
  // 获取当前方块的形状矩阵
  const { shape, color } = curr;
  const { length } = shape;

  // 双层循环遍历方块的形状矩阵
  for (let y = 0; y < length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      // 如果当前位置有方块，则绘制到棋盘对应位置
      if (shape[y][x]) {
        drawBlock(ctx, cx + x, cy + y, color);
      }
    }
  }
}

/**
 * # 绘制预览方块
 *
 * 在预览画布中央居中显示下一个方块的形状和颜色
 *
 * @function drawNext
 * @param {object | null} next - 下一个预览方块对象
 * @param {number[][]} next.shape - 预览方块的形状矩阵
 * @param {string} next.color - 预览方块的填充颜色
 * @returns {void}
 */
export function drawNext(next) {
  const { shape } = next;
  const { width, height } = nextCanvas;
  // 预览区域固定为 5x5 网格大小
  const gridSize = 5;
  // 计算单个预览方块的尺寸（自适应预览画布）
  const blockSize = Math.floor(width / gridSize);
  // 计算水平居中偏移量
  const ox = Math.floor((width - shape[0].length * blockSize) / 2);
  // 计算垂直居中偏移量
  const oy = Math.floor((height - shape.length * blockSize) / 2);

  // 清空预览画布
  nextCtx.clearRect(0, 0, width, height);

  // 遍历预览方块形状矩阵
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      // 当前位置有方块时进行绘制
      if (shape[y][x]) {
        const px = ox + x * blockSize;
        const py = oy + y * blockSize;

        // 绘制填充方块与黑色边框
        nextCtx.fillStyle = next.color;
        nextCtx.fillRect(px, py, blockSize - 2, blockSize - 2);
        nextCtx.strokeStyle = COLOR_BLACK;
        nextCtx.strokeRect(px, py, blockSize - 2, blockSize - 2);
      }
    }
  }
}

/**
 * # 绘制游戏难度选择界面
 *
 * 显示当前选择的等级、操作提示文本，居中展示在游戏主画布
 *
 * @function drawLevelSelect
 * @param {number} level - 当前选中的游戏难度等级
 * @returns {void}
 */
export function drawLevelSelect(level) {
  const { width, height } = canvas;

  // 清空画布，准备绘制等级选择界面
  clearBoard();

  ctx.save();
  // 半透明遮罩层
  ctx.fillStyle = COLOR_RGBA_BLACK;
  ctx.fillRect(0, 0, width, height);

  /* ======== 绘制文本：TETRIS.JS ======== */
  ctx.save();
  // 设置文本居中对齐
  ctx.textAlign = 'center';
  // 设置像素风格字体与大小
  ctx.font = `${baseFontSize * 1.1}px "Press Start 2P"`;
  ctx.fillStyle = COLOR_GREEN;
  ctx.fillText('TETRIS.JS', width / 2, height * 0.1);
  ctx.restore();

  /* ======== 绘制文本：LEVEL（绿色） ======== */
  ctx.save();
  // 设置文本居中对齐
  ctx.textAlign = 'center';
  // 设置像素风格字体与大小
  ctx.font = `${baseFontSize}px "Press Start 2P"`;
  ctx.fillStyle = COLOR_GREEN;
  ctx.fillText('LEVEL', width / 2, height * 0.35);
  ctx.restore();

  /* ======== 绘制文本：当前选中的等级数字（绿色） ======== */
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `${baseFontSize * 3}px "Press Start 2P"`;
  ctx.fillStyle = COLOR_GREEN;
  ctx.fillText(level.toString(), width / 2, height * 0.5);
  ctx.restore();

  /* ======== 绘制文本：1-9 快捷键（白色） ======== */
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `${baseFontSize}px "Press Start 2P"`;
  ctx.fillStyle = COLOR_WHITE;
  ctx.fillText('1-9 KEY', width / 2, height * 0.58);
  ctx.restore();

  /* ======== 绘制文本：ENTER START（YELLOW） ======== */
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `${baseFontSize * 1.15}px "Press Start 2P"`;
  ctx.fillStyle = COLOR_TEAL;
  ctx.fillText('ENTER START', width / 2, height * 0.7);
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `${baseFontSize * 0.9}px "Press Start 2P"`;
  ctx.fillStyle = COLOR_WHITE;
  ctx.fillText('P 3SEC: HIDDEN', width / 2, height * 0.8);

  ctx.restore();
}

/**
 * # 绘制游戏暂停界面
 *
 * 全屏半透明遮罩 + 居中显示 PAUSED 文字
 *
 * @function drawPause
 * @returns {void}
 */
export function drawPause() {
  const { width, height } = canvas;

  // 绘制半透明黑色遮罩覆盖整个画布
  ctx.fillStyle = COLOR_RGBA_BLACK;
  ctx.fillRect(0, 0, width, height);

  /* ======== 绘制文本：TETRIS.JS ======== */
  ctx.save();
  // 设置文本居中对齐
  ctx.textAlign = 'center';
  // 设置像素风格字体与大小
  ctx.font = `${baseFontSize * 1.1}px ${GAME_FONT_FAMILY}`;
  ctx.fillStyle = COLOR_GREEN;
  ctx.fillText('TETRIS.JS', width / 2, height * 0.1);
  ctx.restore();

  /* ======== 绘制文本：PAUSED ======== */
  ctx.save();
  // 设置文字样式：黄色、居中、像素字体
  ctx.fillStyle = COLOR_YELLOW;
  ctx.textAlign = 'center';
  ctx.font = `${baseFontSize * 1.6}px "Press Start 2P"`;
  // 居中绘制暂停文字
  ctx.fillText('PAUSED', width / 2, height / 2);
  ctx.restore();
}

/**
 * # 绘制游戏结束界面
 *
 * 先绘制最终棋盘，再添加半透明遮罩，居中显示红色 GAME OVER 文字
 *
 * @function drawOver
 * @returns {void}
 */
export function drawOver() {
  const { width, height } = canvas;
  // const { board } = gameState;

  /*
   * 绘制游戏结束时的最终棋盘状态
   * drawBoard(board);
   */

  // 绘制全屏半透明黑色遮罩
  ctx.fillStyle = COLOR_RGBA_BLACK;
  ctx.fillRect(0, 0, width, height);

  /* ======== 绘制文本：TETRIS.JS ======== */
  ctx.save();
  // 设置文本居中对齐
  ctx.textAlign = 'center';
  // 设置像素风格字体与大小
  ctx.font = `${baseFontSize * 1.1}px ${GAME_FONT_FAMILY}`;
  ctx.fillStyle = COLOR_GREEN;
  ctx.fillText('TETRIS.JS', width / 2, height * 0.1);
  ctx.restore();

  /* ======== 绘制文本：GAME OVER ======== */
  ctx.save();
  // 设置文字样式：红色、居中、像素字体
  ctx.fillStyle = COLOR_RED;
  ctx.textAlign = 'center';
  ctx.font = `${baseFontSize * 1.45}px "Press Start 2P"`;

  // 画布居中绘制游戏结束文字
  ctx.fillText('GAME OVER', width / 2, height / 2);
  ctx.restore();
}

/**
 * # 强制触发游戏结束
 *
 * 停止音乐、清除定时器、播放结束音效、保存最高分并显示游戏结束界面
 *
 * @function forceOver
 * @returns {boolean} - 暂停状态，返回 false，否则返回 true
 */
export function forceOver() {
  if (gameState.isPaused) {
    return false;
  }

  // 停止背景音乐
  stopBGM();

  // 设置游戏结束状态
  gameState.isGameOver = true;
  gameState.isPaused = false;
  gameState.countDown.show = false;
  gameState.isHiddenMode = false;

  // 清除游戏主循环定时器
  clearInterval(gameState.gameInterval);

  // 播放游戏结束音效
  sounds.gameOver();

  // 保存当前最高分
  saveHighScore();

  // 延迟短暂时间后绘制游戏结束界面
  setTimeout(() => {
    drawOver();
  }, 10);

  return true;
}

/**
 * # 窗口大小自适应调整函数
 *
 * 根据屏幕尺寸动态计算方块大小、画布尺寸、字体大小，并重新渲染当前游戏界面
 *
 * @function resize
 * @returns {void}
 */
export function resize() {
  const { isSelectLevel, isGameOver, board, curr, cx, cy, level, next } =
    gameState;
  // 获取窗口高度的90%作为基准高度
  const h = globalThis.innerHeight * 0.9;

  // 根据窗口高度计算单个方块的尺寸
  BLOCK_SIZE = Math.floor(h / BOARD_ROWS);
  // 重新设置主画布的宽度和高度
  canvas.width = BLOCK_SIZE * BOARD_COLS;
  canvas.height = BLOCK_SIZE * BOARD_ROWS;
  // 动态计算基础字体大小，适配画布高度
  baseFontSize = Math.floor(canvas.height * 0.032);

  // 计算预览区域的大小，取宽度和高度限制的较小值
  const nextSize = Math.min(
    globalThis.innerWidth * 0.1,
    globalThis.innerHeight * 0.18,
  );
  // 设置预览画布的尺寸
  nextCanvas.width = nextSize;
  nextCanvas.height = nextSize;

  // 根据当前游戏状态重新渲染对应的界面
  if (isSelectLevel || isGameOver) {
    // 等级选择 / 游戏结束界面
    drawLevelSelect(level);
  } else {
    // 正常游戏界面：绘制棋盘 + 下一个方块 + 当前下落方块
    drawBoard(board);
    drawNext(next);

    if (curr) {
      drawCurr(curr, cx, cy);
    }
  }
}

/**
 * # 更新游戏界面上的所有 UI 分数信息
 *
 * 将分数、行数、等级、最高分格式化后渲染到对应 DOM 元素
 *
 * @function updateUI
 * @param {number} score - 当前游戏得分
 * @param {number} lines - 当前消除行数
 * @param {number} level - 当前游戏等级
 * @param {number} highScore - 历史最高得分
 * @returns {void}
 */
export function updateUI(score, lines, level, highScore) {
  // 更新当前得分（固定 5 位，左侧补零）
  document.querySelector('#score').textContent = pad(score, 5);
  // 更新消除行数（固定 2 位，左侧补零）
  document.querySelector('#lines').textContent = pad(lines, 2);
  // 更新当前等级（固定 2 位，左侧补零）
  document.querySelector('#level').textContent = pad(level, 2);
  // 更新历史最高分（固定 5 位，左侧补零）
  document.querySelector('#highScore').textContent = pad(highScore, 5);
}
