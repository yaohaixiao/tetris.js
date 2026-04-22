import renderBoard from '@/lib/ui/board/render-board.js';
import applyGravity from '@/lib/game/utils/apply-gravity.js';
import findFullLines from '@/lib/game/utils/find-full-lines.js';
import startClearLines from '@/lib/controllers/clear-lines-controller.js';

class GravityFallAnimation {
  /**
   * ## 创建重力下落动画实例
   *
   * @param {object} state - 游戏状态对象（包含 board 等核心数据）
   */
  constructor(state) {
    this.state = state;
    this.layer = 150; // 渲染层级
    this.blocking = true; // 动画期间禁止输入
    this.name = 'fall';
    this.duration = 0.15; // 动画时长（秒）
    this.timer = 0;
    this.animations = []; // 方块下落动画数据
    this.capture(); // 捕获下落前后状态
  }

  // 捕获重力下落前后的棋盘状态，生成每个方块的移动轨迹
  capture() {
    const { board, clearLines } = this.state;
    const ROWS = board.length;
    const COLS = board[0].length;

    // 保存下落前的棋盘
    const beforeBoard = board.map((row) => [...row]);
    // 临时棋盘计算下落结果
    const afterBoard = board.map((row) => [...row]);

    applyGravity(afterBoard, clearLines);

    // 逐列生成正确下落动画（修复点1）
    for (let x = 0; x < COLS; x++) {
      const before = [];
      const after = [];

      // 从下往上收集非空方块（和重力逻辑保持一致）
      for (let y = ROWS - 1; y >= 0; y--) {
        if (clearLines.includes(y)) continue;

        const beforeVal = beforeBoard[y][x];
        const afterVal = afterBoard[y][x];

        if (beforeVal) before.push({ y, val: beforeVal });
        if (afterVal) after.push({ y, val: afterVal });
      }

      // 一一对应生成动画
      for (let i = 0; i < Math.min(before.length, after.length); i++) {
        const f = before[i];
        const t = after[i];

        if (f.y !== t.y) {
          this.animations.push({
            x,
            fromY: f.y,
            toY: t.y,
            value: f.val,
          });
        }
      }
    }

    // 把最终结果同步到真实棋盘
    this.state.board = afterBoard;
  }

  /**
   * # 每帧更新动画进度
   *
   * @param {number} delta - 秒
   * @returns {boolean} 是否继续动画
   */
  update(delta) {
    this.timer += delta;

    if (this.timer >= this.duration) {
      this.stop();
      return false;
    }

    return true;
  }

  // 渲染平滑下落的方块
  render() {
    const progress = Math.min(this.timer / this.duration, 1);
    // 平滑缓动
    const eased = 1 - Math.pow(1 - progress, 3);

    // 渲染棋盘 + 覆盖下落中的方块位置
    renderBoard(this.state.board, {
      overrideCells: this.animations.map((a) => ({
        x: a.x,
        y: a.fromY + (a.toY - a.fromY) * eased,
        value: a.value,
      })),
    });
  }

  // 动画结束 → 检查是否产生新满行 → 连锁消除
  stop() {
    // 强制渲染最后一帧（修复点2）
    this.timer = this.duration;
    this.render();

    // 检查连锁消除
    const newFullLines = findFullLines(this.state.board);

    if (newFullLines.length > 0) {
      this.state.clearLines = newFullLines;
      startClearLines(newFullLines, this.state);
    }
  }
}

export default GravityFallAnimation;
