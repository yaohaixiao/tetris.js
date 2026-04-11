import {
  BOARD_COLS,
  BOARD_ROWS,
  CLEAR_SCORES,
  MAX_LEVEL,
  TETROMINOES,
} from './constants.js';
import { gameState, saveHighScore } from './state.js';
import {
  drawLevelUpEffect,
  triggerLevelUp,
  updateLevelUpAnim,
  addClearEffect,
  drawClearEffects,
  updateClearEffects,
  drawBoard,
  drawCurr,
  drawNext,
  drawOver,
  updateUI,
} from './ui.js';
import { stopBGM, sounds } from './audio.js';

/**
 * # 获取当前等级的方块自动下落速度（延迟时间 ms）
 *
 * 等级越高，下落速度越快（延迟值越小） 最低延迟限制为 100ms，防止速度过快无法操作 计算公式：1000 - (等级 - 1) *
 * 80，保证每级速度平滑递增
 *
 * @function getSpeed
 * @returns {number} 方块下落间隔时间（毫秒）
 */
export const getSpeed = () =>
  // 计算速度：基础值1000ms，每升一级减少80ms，最低不低于100ms
  Math.max(100, 1000 - (gameState.level - 1) * 80);

/**
 * # 随机生成下一个方块类型
 *
 * 从 TETROMINOES 方块库中，随机返回一种方块的数据（形状 + 颜色） 用于游戏生成新方块时调用，保证随机性
 *
 * @function randomTetromino
 * @returns {object} 随机选中的方块对象（包含 shape 形状、color 颜色）
 */
export const randomTetromino = () => {
  // 生成 0 ~ 方块总数 之间的随机整数，作为索引
  const randomIndex = Math.floor(Math.random() * TETROMINOES.length);

  // 返回随机选中的方块
  return TETROMINOES[randomIndex];
};

/**
 * # 碰撞检测
 *
 * 检测当前方块在指定偏移位置后，是否与边界或已有方块发生碰撞 用于移动、旋转前的合法性判断
 *
 * @function collision
 * @param {number} ox - X 轴偏移量
 * @param {number} oy - Y 轴偏移量
 * @returns {boolean} 发生碰撞返回 true，无碰撞返回 false
 */
export const collision = (ox, oy) => {
  // 获取当前方块的形状矩阵
  const s = gameState.curr.shape;

  // 遍历方块的每一格进行碰撞判断
  for (let y = 0; y < s.length; y++) {
    for (let x = 0; x < s[y].length; x++) {
      // 只判断方块有内容的格子
      if (s[y][x]) {
        // 计算偏移后的实际棋盘坐标
        const nx = gameState.cx + x + ox;
        const ny = gameState.cy + y + oy;

        /*
         * 碰撞判断条件：
         * 1. 超出左边界  2. 超出右边界
         * 3. 超出底部边界 4. 与已有方块重叠
         */
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

  // 无碰撞
  return false;
};

/**
 * # 旋转当前方块
 *
 * 对当前方块进行顺时针旋转（矩阵转置 + 反转） 旋转后若发生碰撞，则自动撤销旋转，保证游戏正常运行
 *
 * @function rotate
 * @returns {void}
 */
export const rotate = () => {
  // 保存旋转前的形状，用于碰撞后恢复
  const prev = gameState.curr.shape;

  // 顺时针旋转矩阵：转置 + 反转行
  gameState.curr.shape = prev[0].map((_, i) =>
    prev.map((r) => r[i]).toReversed(),
  );

  // 旋转后发生碰撞 → 恢复原状
  if (collision(0, 0)) {
    gameState.curr.shape = prev;
  } else {
    // 旋转成功 → 播放音效
    sounds.rotate();
  }
};

/**
 * # 更新游戏下落速度
 *
 * 清除原有游戏循环定时器，并根据当前等级设置新的下落速度 通常在消行升级、游戏重新开始时调用
 *
 * @function updateSpeed
 * @returns {void}
 */
export function updateSpeed() {
  // 清除之前的游戏循环定时器，防止多个定时器同时运行
  clearInterval(gameState.gameInterval);

  // 设置新的定时器，使用当前等级对应的速度（getSpeed()）
  gameState.gameInterval = setInterval(loop, getSpeed());
}

/**
 * # 闪烁动画执行函数
 *
 * 执行消行前的闪烁动画，等待 3 次闪烁全部完成 动画期间持续渲染游戏画面 + 闪烁特效 动画结束后执行真正地消行、计分、升级逻辑
 *
 * @function drawClearFlash
 * @returns {void}
 */
const drawClearFlash = () => {
  // 绘制游戏主棋盘
  drawBoard(gameState.board);
  // 绘制当前下落方块
  drawCurr(gameState.curr, gameState.cx, gameState.cy);
  // 绘制消行闪烁特效
  drawClearEffects();

  // 检查闪烁动画是否全部完成
  if (updateClearEffects()) {
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

    // ====================== 更新分数、行数、等级 ======================
    gameState.lines += clear;
    gameState.score += CLEAR_SCORES[clear] * gameState.level;

    // 计算当前等级（每 10 行升级）
    const totalLines = gameState.baseLines + gameState.lines;
    const newLevel = Math.floor(totalLines / 10) + 1;
    const oldLevel = gameState.level;

    // 触发升级特效
    if (newLevel > oldLevel) {
      triggerLevelUp();
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

    // 更新游戏下落速度
    updateSpeed();
  } else {
    // 动画未完成 → 继续下一帧
    requestAnimationFrame(drawClearFlash);
  }
};

/**
 * # 游戏结束处理函数
 *
 * 触发游戏结束状态，停止所有游戏逻辑、播放音效、保存分数、显示结束画面 防止重复调用，确保只执行一次结束流程
 *
 * @function gameOver
 * @returns {boolean | undefined} 已结束时返回 false，避免重复执行
 */
export function gameOver() {
  // 如果游戏已经结束，直接返回，防止重复执行
  if (gameState.isGameOver) {
    return false;
  }

  // 标记游戏结束状态
  gameState.isGameOver = true;

  // 停止背景音乐
  stopBGM();

  // 清除游戏主循环定时器
  clearInterval(gameState.gameInterval);

  // 播放游戏结束音效
  sounds.gameOver();

  // 保存最新最高分
  saveHighScore();

  // 延迟绘制游戏结束画面（保证画面更新完成）
  setTimeout(drawOver, 20);
}

/**
 * # 生成新方块
 *
 * 1. 将 next 方块变为当前下落方块
 * 2. 重新随机生成下一个方块
 * 3. 初始化方块位置（居中显示）
 * 4. 绘制下一个方块预览界面
 * 5. 检测出生碰撞 → 碰撞则游戏结束
 *
 * @function spawn
 * @returns {void}
 */
export function spawn() {
  // 当前方块 = 下一个方块，若不存在则随机生成
  gameState.curr = gameState.next || randomTetromino();
  // 重新随机生成下一个预览方块
  gameState.next = randomTetromino();

  // 水平居中：屏幕中间 - 方块宽度的一半
  gameState.cx =
    Math.floor(BOARD_COLS / 2) - Math.floor(gameState.curr.shape[0].length / 2);
  // 垂直位置从顶部开始
  gameState.cy = 0;

  // 绘制右侧预览方块界面
  drawNext(gameState.next);

  // 出生点碰撞 → 无法生成新方块 → 游戏结束
  if (collision(0, 0)) {
    gameOver();
  }
}

/**
 * # 移动当前方块
 *
 * 尝试将当前方块按照指定的偏移量移动（左右/下） 先检测碰撞，无碰撞则执行移动并播放音效
 *
 * @function move
 * @param {number} ox - X 轴偏移量（-1=左, 1=右, 0=不移动）
 * @param {number} oy - Y 轴偏移量（1=下落, 0=不移动）
 * @returns {boolean} 移动成功返回 true，碰撞无法移动返回 false
 */
export function move(ox, oy) {
  // 无碰撞 → 可以移动
  if (!collision(ox, oy)) {
    gameState.cx += ox;
    gameState.cy += oy;
    // 播放移动音效
    sounds.move();
    return true;
  }

  // 发生碰撞，无法移动
  return false;
}

/**
 * # 方块落地锁定
 *
 * 将当前正在下落的方块，永久绘制到游戏棋盘上 锁定后方块无法再移动，成为棋盘的一部分
 *
 * @function lock
 * @returns {void}
 */
export function lock() {
  // 获取当前方块的形状矩阵
  const s = gameState.curr.shape;

  // 遍历方块的每一格
  for (let y = 0; y < s.length; y++) {
    for (let x = 0; x < s[y].length; x++) {
      // 如果当前格子有方块（非空），就将颜色写入棋盘
      if (s[y][x]) {
        gameState.board[gameState.cy + y][gameState.cx + x] =
          gameState.curr.color;
      }
    }
  }
}

/**
 * # 消除满行核心逻辑
 *
 * 1. 检测所有满行
 * 2. 添加闪烁特效（不立即删行）
 * 3. 播放消行音效
 * 4. 更新分数与等级
 * 5. 等待 drawClearFlash 完成闪烁后再真正删行
 *
 * @function clearLines
 * @returns {boolean} - 执行成功，返回 true，否则返回 false
 */
export function clearLines() {
  // 记录消除行数
  let clear = 0;
  // 存储需要闪烁消除的行号
  const linesToClear = [];

  // 从底部向上遍历所有行，检测满行
  for (let y = BOARD_ROWS - 1; y >= 0; y--) {
    // 优化判断：单元格有值（非空/非0）即为有方块
    const isLineFull = gameState.board[y].every((cell) => !!cell);

    // 如果是满行，加入待消除队列
    if (isLineFull) {
      linesToClear.push(y);
      clear++;
    }
  }

  // 如果没有满行，直接更新界面并退出
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

  // ==================== 有可消除行 ====================

  // 给所有满行添加闪烁特效
  for (const y of linesToClear) {
    addClearEffect(y);
  }

  // 播放悦耳消行音效
  sounds.clear();

  // 更新分数（消行越多分数越高）
  gameState.lines += clear;
  gameState.score += CLEAR_SCORES[clear] * gameState.level;

  // 等待闪烁 3 次动画完成 → 再删行
  drawClearFlash();

  return true;
}

/**
 * # 游戏主循环
 *
 * 控制游戏核心逻辑：下落、碰撞检测、锁定方块、消行、生成新方块 游戏结束或暂停时直接中断执行 每帧执行一次，保证游戏流畅运行
 *
 * @function loop
 * @returns {boolean} 返回是否继续执行主循环
 */
export function loop() {
  // 升级动画期间：只更新动画、不进行游戏逻辑
  if (gameState.levelUpEffect.show) {
    updateLevelUpAnim();
    drawBoard(gameState.board);
    drawCurr(gameState.curr, gameState.cx, gameState.cy);
    drawLevelUpEffect();
    return true;
  }

  // 游戏结束 / 暂停 → 停止主循环
  if (gameState.isGameOver || gameState.isPaused) {
    return false;
  }

  // 尝试向下移动一格，无法移动时执行锁定逻辑
  if (!move(0, 1)) {
    // 锁定当前方块到棋盘
    lock();
    // 播放落地音效
    sounds.fall();
    // 执行消行逻辑（包含闪烁3次特效）
    clearLines();
    // 生成新下落方块
    spawn();

    // 生成新方块后游戏结束 → 终止循环
    if (gameState.isGameOver) {
      return false;
    }
  }

  // 绘制游戏棋盘 + 当前下落方块
  drawBoard(gameState.board);
  drawCurr(gameState.curr, gameState.cx, gameState.cy);

  // 正常继续循环
  return true;
}

/**
 * # 快速下落（硬降）
 *
 * 方块瞬间直接落到底部，自动锁定、消行、生成新方块 相比普通下落，直接触达最底部，是玩家常用操作
 *
 * @function drop
 * @returns {void}
 */
export function drop() {
  // 循环向下移动，直到无法移动（触底/碰撞）
  while (true) {
    if (!move(0, 1)) {
      break;
    }
  }

  // 锁定方块到棋盘
  lock();
  // 播放落地音效
  sounds.fall();
  // 消行处理（含闪烁3次特效）
  clearLines();
  // 生成新方块
  spawn();
  // 播放快速下落完成音效
  sounds.drop();
}
