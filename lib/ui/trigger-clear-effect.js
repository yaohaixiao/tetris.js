import BOARD from '../constants/board.js';
import GAME from '../constants/game.js';
import GameState from '../state/game-state.js';
import Effects from './effects.js';
import drawBoard from './draw-board.js';
import drawCurr from './draw-curr.js';
import drawClearEffect from './draw-clear-effect.js';
import updateClearEffect from './update-clear-effect.js';
import triggerLevelUpEffect from './trigger-level-up-effect.js';
import updateUI from './update-ui.js';
import saveHighScore from '../state/save-high-score.js';
import updateSpeed from '../game/update-speed.js';

/**
 * # 闪烁动画执行函数
 *
 * 执行消行前的闪烁动画，等待 3 次闪烁全部完成 动画期间持续渲染游戏画面 + 闪烁特效 动画结束后执行真正地消行、计分、升级逻辑
 *
 * @function triggerClearEffect
 * @returns {void}
 */
const triggerClearEffect = () => {
  const { ROWS, COLS } = BOARD;
  const { CLEAR_SCORES, MAX_LEVEL } = GAME;
  const effect = Effects.clear;

  // 绘制游戏主棋盘
  drawBoard(GameState.board);
  // 绘制当前下落方块
  drawCurr(GameState.curr, GameState.cx, GameState.cy);
  // 绘制消行闪烁特效
  drawClearEffect();

  // 检查闪烁动画是否全部完成
  if (updateClearEffect()) {
    // ====================== 闪烁结束 → 执行消行 ======================
    let clear = 0;

    // 从下往上遍历，删除所有满行
    for (let y = ROWS - 1; y >= 0; y--) {
      const isFullLine = GameState.board[y].every((cell) => !!cell);

      if (isFullLine) {
        // 删除当前满行
        GameState.board.splice(y, 1);
        // 顶部添加新空行
        GameState.board.unshift(Array.from({ length: COLS }).fill(0));
        clear++;
        // 删除后索引回退，重新检查当前位置
        y++;
      }
    }

    /* ====================== 更新分数、行数、等级 ====================== */
    GameState.lines += clear;
    GameState.score += CLEAR_SCORES[clear] * GameState.level;

    // 计算当前等级（每 10 行升级）
    const totalLines = GameState.baseLines + GameState.lines;
    const newLevel = Math.floor(totalLines / 10) + 1;
    const oldLevel = GameState.level;

    // 触发升级特效
    if (newLevel > oldLevel) {
      triggerLevelUpEffect();
    }

    // 限制等级范围
    GameState.level = Math.min(Math.max(GameState.level, newLevel), MAX_LEVEL);

    // 更新游戏速度与界面显示
    updateSpeed();
    updateUI(
      GameState.score,
      GameState.lines,
      GameState.level,
      GameState.highScore,
    );

    // 保存最高分
    saveHighScore();

    // 清空特效队列
    effect.lines = [];
    cancelAnimationFrame(effect.rafId);
  } else {
    // 动画未完成 → 继续下一帧
    effect.rafId = requestAnimationFrame(triggerClearEffect);
  }
};

export default triggerClearEffect;
