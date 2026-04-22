import GAME from '@/lib/game/constants/game.js';
import Sounds from '@/lib/audio/sounds.js';
import renderClear from '@/lib/ui/board/render-clear.js';
import renderHud from '@/lib/ui/hud/render-hud.js';
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
   * @param {object} state - 游戏状态.
   */
  constructor(lines, state) {
    // 将行索引转换为动画数据对象数组
    this.lines = lines.map((y) => ({
      // 行的Y坐标（行号）
      y,
      // 当前透明度（1=完全不透明，0=完全透明）
      alpha: 1,
      // 动画计时器（秒）
      timer: 0,
    }));
    this.state = state;
    // 渲染层级（数值越大越靠前）
    this.layer = 200;
    // 是否阻塞用户输入（动画期间禁止操作）
    this.blocking = true;
    // 动画名称，用于标识
    this.name = 'clear-lines';

    // 播放音效：lines.length - 1 用于选取不同的音效
    Sounds.clear(lines.length - 1);
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
      // 累加时间
      line.timer += delta;

      // 如果动画时间未达到总时长（0.72秒），则动画未完成
      if (line.timer < 0.72) {
        done = false;
      }
    }

    // 如果所有行的动画都已完成
    if (done) {
      // 执行完成后的清理和更新操作
      this.stop();

      // 返回false表示动画已结束
      return false;
    }

    // 返回true表示动画仍在进行
    return true;
  }

  /**
   * ## 动画完成后的清理工作
   *
   * 执行实际的行的消除、分数更新、等级提升等逻辑
   */
  stop() {
    const { CLEAR_SCORES, MAX_LEVEL } = GAME;
    const { state } = this;

    const lines = state.clearLines || [];
    const cleared = lines.length;

    // 排序（防错位）
    lines.sort((a, b) => b - a);

    // 真正删除行
    for (const y of lines) {
      state.board.splice(y, 1);
      state.board.unshift(Array.from({ length: state.board[0].length }).fill(0));
    }

    // 清空（必须）
    state.clearLines = [];

    // ===== 原逻辑继续 =====
    state.lines += cleared;
    state.score += CLEAR_SCORES[cleared] * state.level;

    const totalLines = state.baseLines + state.lines;
    const newLevel = Math.floor(totalLines / 10) + 1;

    if (newLevel > state.level) {
      startLevelUp();
    }

    state.level = Math.min(Math.max(state.level, newLevel), MAX_LEVEL);

    renderHud(state.score, state.lines, state.level, state.highScore);
  }

  /**
   * ## 渲染动画效果
   *
   * 先渲染活动区块，再渲染消除行的闪烁效果
   */
  render() {
    // 渲染指定行的清除闪烁效果
    renderClear({ lines: this.lines });
  }
}

export default ClearLinesAnimation;
