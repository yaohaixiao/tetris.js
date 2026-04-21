import renderBoard from '@/lib/ui/board/render-board.js';
import applyGravity from '@/lib/game/utils/apply-gravity.js';
import findFullLines from '@/lib/game/utils/find-full-lines.js';
import startClearLines from '@/lib/controllers/clear-lines-controller.js';

/**
 * # 重力下落动画（Gravity Fall Animation）
 *
 * 用于处理消行后的“重力结算动画”阶段：
 *
 * ## 流程说明
 *
 * 1. 捕获当前棋盘状态（before）
 * 2. 使用 applyGravity 计算下落后的结果（after）
 * 3. 对比 before / after 生成每个方块的运动轨迹
 * 4. 在动画期间使用 overrideCells 渲染插值位置
 * 5. 动画结束后更新 board 状态
 * 6. 检查是否产生新的满行并触发连锁消除
 *
 * ## 注意
 *
 * - 该动画会直接修改 state.board（应用重力结果）
 * - 动画系统负责视觉过渡，而非逻辑计算
 */
class GravityFallAnimation {
  /**
   * ## 创建重力下落动画实例
   *
   * @param {object} state - 游戏状态对象（包含 board 等核心数据）
   */
  constructor(state) {
    // 游戏状态引用
    this.state = state;

    // 渲染层级（数值越大越靠前）
    this.layer = 150;

    // 是否阻塞用户输入（动画期间禁止操作）
    this.blocking = true;

    // 动画名称标识
    this.name = 'fall';

    // 动画持续时间
    this.duration = 0.15;

    // 动画计时器
    this.timer = 0;

    /*
     * 动画数据集合 每一项表示一个方块的运动轨迹：
     * { x: 列, fromY: 起始Y, toY: 目标Y, value: 方块类型 }
     */
    this.animations = [];

    // 初始化捕获过程
    this.capture();
  }

  /**
   * ## 捕获重力下落前后的状态，并生成动画数据
   *
   * ## 核心逻辑
   *
   * - Before：当前棋盘状态
   * - TempBoard：应用 applyGravity 后的结果
   * - 通过逐列对比生成每个方块的运动路径
   */
  capture() {
    const { board, clearLines } = this.state;
    const ROWS = board.length;
    const COLS = board[0].length;

    // 1. 保存原始棋盘（before）
    const before = board.map((row) => [...row]);

    // 2. 复制棋盘用于计算重力结果
    const tempBoard = board.map((row) => [...row]);

    // 应用重力逻辑（真实结算结果）
    applyGravity(tempBoard, clearLines);

    // 3. 逐列对比 before / after
    for (let x = 0; x < COLS; x++) {
      const beforeCol = [];
      const afterCol = [];

      // 提取单列数据
      for (let y = 0; y < ROWS; y++) {
        beforeCol.push(before[y][x]);
        afterCol.push(tempBoard[y][x]);
      }

      // 过滤非空方块（保持顺序）
      const beforeBlocks = [];
      const afterBlocks = [];

      for (let y = 0; y < ROWS; y++) {
        if (beforeCol[y]) beforeBlocks.push({ y, value: beforeCol[y] });
        if (afterCol[y]) afterBlocks.push({ y, value: afterCol[y] });
      }

      // 4. 按顺序匹配生成动画
      for (let i = 0; i < beforeBlocks.length; i++) {
        const from = beforeBlocks[i];
        const to = afterBlocks[i];

        if (!to) continue;

        // 只有发生位移才需要动画
        if (from.y !== to.y) {
          this.animations.push({
            x,
            fromY: from.y,
            toY: to.y,
            value: from.value,
          });
        }
      }
    }

    // 5. 应用重力结果到真实棋盘
    this.state.board = tempBoard;
  }

  /**
   * ## 更新动画状态（每帧调用）
   *
   * @param {number} delta - 帧间时间差（秒）
   * @returns {boolean} 是否继续动画
   */
  update(delta) {
    this.timer += delta;

    // 动画结束
    if (this.timer >= this.duration) {
      this.stop();
      return false;
    }

    return true;
  }

  /**
   * ## 渲染动画帧
   *
   * 使用 overrideCells 覆盖原始棋盘，实现插值下落效果
   */
  render() {
    // 当前进度（0~1）
    const progress = Math.min(this.timer / this.duration, 1);

    /*
     * EaseOut cubic
     * 缓动函数： 前快后慢，更符合“重力下落感”
     */
    const eased = 1 - Math.pow(1 - progress, 3);

    renderBoard(this.state.board, {
      overrideCells: this.animations.map((a) => ({
        x: a.x,
        y: a.fromY + (a.toY - a.fromY) * eased,
        value: a.value,
      })),
    });
  }

  /**
   * ## 动画结束处理
   *
   * 1. 检测是否产生新的满行
   * 2. 若存在则触发连锁消除动画
   */
  stop() {
    const { state } = this;

    // 检查新形成的满行
    const lines = findFullLines(state.board);

    // 触发连锁消除
    if (lines.length > 0) {
      startClearLines(lines);
    }
  }
}

export default GravityFallAnimation;
