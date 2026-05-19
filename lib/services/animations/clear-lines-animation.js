import Base from '@/lib/core';
import Engine from '@/lib/engine';
import applyClearLines from '@/lib/game/actions/apply-clear-lines.js';

/**
 * # ClearLinesAnimation（消行动画）
 *
 * 控制消除行的闪烁动画特效，并在动画完成后执行实际的消行操作。
 *
 * ## 动画表现
 *
 * - 每行独立维护计时器
 * - 每 0.12 秒切换一次透明度（闪烁效果，共 6 个阶段）
 * - 偶数阶段（0, 2, 4）：显示（alpha = 1）
 * - 奇数阶段（1, 3, 5）：隐藏（alpha = 0）
 * - 总持续时间为 0.72 秒
 *
 * ## 生命周期
 *
 * 1. `constructor` → 初始化动画行数据，播放消行音效
 * 2. `update(delta)` → 每帧推进计时器，更新闪烁状态
 * 3. 动画结束 → 调用 `stop()` 执行消行、加分、升级等逻辑
 * 4. 从动画系统移除
 *
 * ## 依赖
 *
 * - **Game.Store**：读取与更新游戏状态
 * - **Sounds**：播放消除音效
 * - **applyClearLines**：执行真实地消行和分数更新
 * - **UI**：渲染闪烁效果
 *
 * @class ClearLinesAnimation
 */
class ClearLinesAnimation extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Game - 游戏主实例
   * @param {number[]} options.lines - 待消除的行号数组
   */
  constructor(options) {
    super(options);

    this.initialize(options);
  }

  /**
   * ## 初始化动画
   *
   * 设置动画属性并为每行创建独立的动画状态数据。
   *
   * @param {object} options - 配置对象
   * @param {number[]} options.lines - 待消除的行号数组
   * @returns {void}
   */
  initialize(options) {
    const { lines } = options;

    /**
     * ## 渲染层级
     *
     * 设为 200（UI 层），确保闪烁效果显示在最前面。
     *
     * @type {number}
     */
    this.layer = 200;

    /**
     * ## 是否阻塞用户输入
     *
     * 消行动画期间禁止玩家操作。
     *
     * @type {boolean}
     */
    this.blocking = true;

    /**
     * ## 动画名称标识
     *
     * 用于 `hasBlocking()` 精确匹配。
     *
     * @type {string}
     */
    this.name = 'clear-lines';

    /**
     * ## 动画行数据
     *
     * 每项包含：
     *
     * | 属性  | 类型   | 说明                         |
     * | ----- | ------ | ---------------------------- |
     * | y     | number | 行索引                       |
     * | alpha | number | 当前透明度（1=显示, 0=隐藏） |
     * | timer | number | 累积动画时间（秒）           |
     *
     * @type {{ y: number; alpha: number; timer: number }[]}
     */
    this.lines = lines.map((y) => ({
      y,
      alpha: 1,
      timer: 0,
    }));

    // 播放对应数量的消除音效（传入消除行数-1 用于音符选择）
    this.emit('audio:resume:sound', {
      sound: 'CLEAR',
      lines: lines.length - 1,
    });
  }

  /**
   * ## 更新动画状态
   *
   * 每帧调用，推进每行的计时器并根据 phase 计算闪烁透明度。
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   * @returns {boolean} - 执行完成，返回 true，否则返回 false
   */
  update(delta) {
    // 标记是否所有行都已完成动画
    let done = true;

    // 遍历每一行的动画数据
    for (const line of this.lines) {
      /**
       * 当前阶段（phase）
       *
       * 每 0.12 秒为一个阶段：phase = 0, 1, 2, 3, 4, 5
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
       * 总时长为 0.72 秒（6 个阶段 × 0.12 秒）
       */
      if (line.timer < 0.72) {
        done = false;
      }
    }

    // 所有行的动画都完成
    if (done) {
      // 执行动画结束后的消行逻辑
      this.stop();

      // 返回 false → 动画系统移除本实例
      return false;
    }

    return true;
  }

  /**
   * ## 动画结束后的收尾逻辑
   *
   * 通过 Scheduler 序列依次执行：
   *
   * 1. 触发升级逻辑（回放时不触发）
   * 2. 更新游戏状态（消行、加分、升级）
   * 3. 保存最高分
   * 4. 刷新 HUD 显示
   *
   * @returns {void}
   */
  stop() {
    const { Game } = this;
    const uuid = Game.id;
    const result = applyClearLines(Game);
    const { level, levelUp } = result;
    const isLevelUp = levelUp;

    Engine.Scheduler.sequence([
      {
        fn: () => {
          // 1. 触发升级逻辑（回放时不触发升级提示音/动画）
          this.emit(`replay:${uuid}:stop:clear:lines`, { isLevelUp, level });
        },
      },
      {
        fn: () => {
          // 2. 更新游戏状态（消行、加分、更新等级）
          this.emit(`game:${uuid}:update:state`, {
            stateHandler: result.stateHandler,
          });
        },
      },
      {
        fn: () => {
          // 3. 检查并保存最高分
          this.emit(`game:${uuid}:save:high:score`);
        },
      },
      {
        fn: () => {
          // 4. 刷新 HUD 显示（分数、等级等）
          this.emit(`game:${uuid}:update:hud`);
        },
      },
    ]);
  }

  /**
   * ## 渲染动画
   *
   * 在渲染阶段调用，将当前闪烁状态传递给 UI 层进行绘制。 不修改 state，仅负责视觉表现。
   *
   * @returns {void}
   */
  render() {
    const { lines } = this;

    // 发送渲染事件，UI 层根据 lines 中的 alpha 值绘制闪烁效果
    this.emit(`ui:${this.Game.id}:render:clear`, { state: { lines } });
  }
}

export default ClearLinesAnimation;
