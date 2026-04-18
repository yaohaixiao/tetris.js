import BOARD from '@/lib/ui/constants/board.js';
import GAME from '@/lib/game/constants/game.js';
import GameState from '@/lib/game/state/game-state.js';
import renderActiveOnly from '@/lib/ui/render-active-only.js';
import renderClear from '@/lib/ui/render-clear.js';
import updateHUD from '@/lib/ui/update-hud.js';
import startLevelUp from '@/lib/controllers/level-up-controller.js';

/**
 * # 消除行动画类
 *
 * 负责管理消除行时的闪烁动画效果，并在动画完成后更新游戏状态（分数、等级等）
 */
class ClearLinesAnimation {
  /**
   * ## 创建消除行动画实例
   *
   * @param {number[]} lines - 需要消除的行索引数组
   */
  constructor(lines) {
    // 将行索引转换为动画数据对象数组
    this.lines = lines.map((y) => ({
      y, // 行的Y坐标（行号）
      alpha: 1, // 当前透明度（1=完全不透明，0=完全透明）
      timer: 0, // 动画计时器（秒）
    }));
    this.name = 'clear-lines'; // 动画名称，用于标识
    this.layer = 200; // 渲染层级（数值越大越靠前）
    this.blocking = true; // 是否阻塞用户输入（动画期间禁止操作）
  }

  /**
   * ## 更新动画状态
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   * @returns {boolean} - 动画是否仍在进行中（true=进行中，false=已完成）
   */
  update(delta) {
    let done = true; // 标记所有行的动画是否都已完成

    // 遍历所有正在动画的行
    for (const line of this.lines) {
      // 计算当前动画阶段（每0.12秒切换一次透明度）
      const phase = Math.floor(line.timer / 0.12);

      // 偶数阶段显示，奇数阶段隐藏，实现闪烁效果
      line.alpha = phase % 2 === 0 ? 1 : 0;
      line.timer += delta; // 累加时间

      // 如果动画时间未达到总时长（0.72秒），则动画未完成
      if (line.timer < 0.72) {
        done = false;
      }
    }

    // 如果所有行的动画都已完成
    if (done) {
      this.finish(); // 执行完成后的清理和更新操作
      return false; // 返回false表示动画已结束
    }

    return true; // 返回true表示动画仍在进行
  }

  /**
   * ## 渲染动画效果
   *
   * 先渲染活动区块，再渲染消除行的闪烁效果
   */
  render() {
    renderActiveOnly(); // 只渲染当前活动的方块（下落中的方块）
    renderClear({ lines: this.lines }); // 渲染指定行的清除闪烁效果
  }

  /**
   * ## 动画完成后的清理工作
   *
   * 执行实际的行的消除、分数更新、等级提升等逻辑
   */
  finish() {
    const { ROWS, COLS } = BOARD; // 获取棋盘的行数和列数
    const { CLEAR_SCORES, MAX_LEVEL } = GAME; // 获取消除得分规则和最大等级
    let cleared = 0; // 本次消除的行数计数器

    // 从下往上遍历每一行（因为消除后上面的行会下落）
    for (let y = ROWS - 1; y >= 0; y--) {
      // 检查当前行是否完全填满（所有格子都有方块）
      const isFullLine = GameState.board[y].every(Boolean);

      if (isFullLine) {
        // 移除当前满行
        GameState.board.splice(y, 1);
        // 在棋盘顶部添加一个新的空行
        GameState.board.unshift(Array.from({ length: COLS }).fill(0));
        cleared++; // 消除行数加1
        y++; // 继续检查同一位置的新行（因为数组索引已变化）
      }
    }

    // 更新总消除行数和分数
    GameState.lines += cleared;
    // 分数计算：基础分数 × 当前等级
    GameState.score += CLEAR_SCORES[cleared] * GameState.level;

    // 计算新的等级（基础行数 + 累计消除行数，每10行升1级）
    const totalLines = GameState.baseLines + GameState.lines;
    const newLevel = Math.floor(totalLines / 10) + 1;

    // 如果新等级高于当前等级，触发升级动画/效果
    if (newLevel > GameState.level) {
      startLevelUp();
    }

    // 更新当前等级（限制在1到最大等级之间）
    GameState.level = Math.min(Math.max(GameState.level, newLevel), MAX_LEVEL);

    // 更新游戏HUD界面（显示分数、行数、等级、最高分）
    updateHUD(
      GameState.score,
      GameState.lines,
      GameState.level,
      GameState.highScore,
    );
  }
}

export default ClearLinesAnimation;
