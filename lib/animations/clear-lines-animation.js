import Engine from '@/lib/engine';
import BOARD from '@/lib/ui/constants/board.js';
import GAME from '@/lib/game/constants/game.js';
import Sounds from '@/lib/audio/sounds.js';
import renderClear from '@/lib/ui/board/render-clear.js';
import renderHud from '@/lib/ui/hud/render-hud.js';
import startLevelUp from '@/lib/controllers/level-up-controller.js';

/**
 * # ClearLinesAnimation
 *
 * 表示“消除行”的动画实例。
 *
 * 职责包括：
 *
 * - 控制消除行的闪烁动画（基于时间切换透明度）
 * - 在动画完成后执行真实的游戏状态更新（删除行、加分、升级等）
 * - 在渲染阶段绘制当前动画效果
 *
 * ## 生命周期
 *
 * 1. 创建实例（constructor）
 * 2. 每帧调用 update(delta)
 * 3. 若 update 返回 false，则动画结束并从系统移除
 * 4. 在结束时执行 stop() 完成状态收敛
 *
 * ## 动画表现
 *
 * - 每行独立维护 timer
 * - 每 0.12 秒切换一次 alpha（闪烁效果）
 * - 总持续时间为 0.72 秒
 *
 * ## 依赖
 *
 * - Engine.Game.store：用于读取与更新游戏状态
 * - Sounds：播放消除音效
 * - RenderClear：渲染闪烁效果
 * - RenderHud：刷新 HUD
 * - StartLevelUp：触发升级流程
 */
class ClearLinesAnimation {
  /**
   * ## 渲染层级（UI 层，显示在最前面）
   *
   * @type {number}
   */
  layer = 200;

  /**
   * ## 是否阻塞用户输入
   *
   * @type {boolean}
   */
  blocking = true;

  /**
   * ## 动画名称标识
   *
   * @type {string}
   */
  name = 'clear-lines';

  /**
   * ## 构造函数
   *
   * @param {number[]} lines - 需要执行消除动画的行索引数组（从 0 开始）
   */
  constructor(lines) {
    /**
     * 动画行数据
     *
     * 每一项包含：
     *
     * - Y: 行索引
     * - Alpha: 当前透明度（用于闪烁）
     * - Timer: 当前动画时间（秒）
     *
     * @type {{ y: number; alpha: number; timer: number }[]}
     */
    this.lines = lines.map((y) => ({
      y,
      alpha: 1,
      timer: 0,
    }));

    // 播放对应数量的消除音效（1行/2行/3行/4行）
    Sounds.clear(lines.length - 1);
  }

  /**
   * ## 更新动画状态
   *
   * 每帧调用，用于：
   *
   * - 推进每一行的动画时间
   * - 根据 timer 计算当前闪烁状态（alpha）
   * - 判断动画是否结束
   *
   * @param {number} delta - 距离上一帧的时间差（单位：秒）
   * @returns {boolean} - 是否继续存活（true = 继续，false = 结束）
   */
  update(delta) {
    // 标记是否所有行都已完成动画
    let done = true;

    // 遍历每一行动画数据
    for (const line of this.lines) {
      /**
       * 当前阶段（phase）
       *
       * 每 0.12 秒为一个阶段： phase = 0,1,2,3...
       */
      const phase = Math.floor(line.timer / 0.12);

      /**
       * 控制闪烁：
       *
       * - 偶数阶段：显示（alpha = 1）
       * - 奇数阶段：隐藏（alpha = 0）
       */
      line.alpha = phase % 2 === 0 ? 1 : 0;

      // 累加时间
      line.timer += delta;

      /**
       * 判断是否仍在动画期间
       *
       * 总时长为 0.72 秒（6 个 phase）
       */
      if (line.timer < 0.72) {
        done = false;
      }
    }

    // 所有行动画完成
    if (done) {
      // 执行动画结束后的逻辑
      this.stop();

      // 返回 false → 动画系统移除此实例
      return false;
    }

    return true;
  }

  /**
   * ## 动画结束后的收尾逻辑
   *
   * 包含：
   *
   * 1. 实际删除已满的行
   * 2. 更新分数与消除行数
   * 3. 判断并处理升级
   * 4. 更新 HUD
   *
   * 注意：此处直接修改游戏状态（state），后稍需要优化
   */
  stop() {
    const { CLEAR_LINE_SCORES, MAX_LEVEL } = GAME;
    const { ROWS, COLS } = BOARD;

    // 获取全局游戏状态
    const { store } = Engine.Game;
    const state = store.getState();

    /**
     * 当前需要清除的行（来自 state）
     *
     * @type {number[]}
     */
    const lines = state.clearLines || [];

    // 实际清除的行数
    const cleared = lines.length;

    /**
     * 1. 执行真实地行删除逻辑
     *
     * 从底部向上遍历：
     *
     * - 删除满行
     * - 顶部插入空行
     */
    for (let y = ROWS - 1; y >= 0; y--) {
      // 判断当前行是否满行
      const isFullLine = state.board[y].every(Boolean);

      if (isFullLine) {
        // 删除当前行
        state.board.splice(y, 1);

        // 在顶部插入空行
        state.board.unshift(Array.from({ length: COLS }).fill(0));

        // 关键：删除后需要回退一行重新检查
        y++;
      }
    }

    // 清空待消除行记录
    state.clearLines = [];

    // 2. 更新分数与行数
    state.lines += cleared;
    state.score += CLEAR_LINE_SCORES[cleared] * state.level;

    // 3. 计算等级变化
    const totalLines = state.baseLines + state.lines;
    const newLevel = Math.floor(totalLines / 10) + 1;

    // 如果升级，则触发升级流程
    if (newLevel > state.level) {
      startLevelUp(newLevel);
    }

    // 限制等级范围并写入 state
    const level = Math.min(Math.max(state.level, newLevel), MAX_LEVEL);
    store.setLevel(level);

    // 4. 更新 HUD（分数、行数、等级等）
    renderHud(state);
  }

  /**
   * ## 渲染动画
   *
   * 在渲染阶段调用：
   *
   * - 根据当前 lines 数据（含 alpha）绘制闪烁效果
   *
   * 不修改 state，仅负责视觉表现
   */
  render() {
    renderClear({ lines: this.lines });
  }
}

export default ClearLinesAnimation;
