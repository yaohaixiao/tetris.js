// lib/services/animations/clear-lines-animation.js

import Base from '@/lib/core';
import applyClearLines from '@/lib/game/actions/apply-clear-lines.js';
import {
  AudioEvents,
  GameEvents,
  ReplayEvents,
  UIEvents,
} from '@/lib/events/event-catalog.js';

/**
 * # ClearLinesAnimation（消行动画）
 *
 * 控制消除行的闪烁动画特效，并在动画完成后执行实际的消行操作。
 *
 * ## 动画表现
 *
 * - 每行独立维护透明度状态
 * - 每 120ms 切换一次透明度（闪烁效果，共 6 个阶段）
 * - 偶数阶段（0, 2, 4）：显示（alpha = 1）
 * - 奇数阶段（1, 3, 5）：隐藏（alpha = 0）
 * - 总持续时间为 720ms（6 × 120ms）
 *
 * ## 时间驱动
 *
 * 全部使用 Scheduler 驱动：
 *
 * - 闪烁切换：Scheduler.sequence 每 120ms 执行一次 toggle
 * - 动画结束：720ms 后设置 `_finished = true`
 * - 收尾逻辑：AnimationSystem 调用 `dispose()` 时计算消除结果、触发分数动画、执行升级、更新状态
 *
 * ## 消除结果复用
 *
 * `applyClearLines` 是纯函数，可在 `initialize` 和 `dispose` 中分别安全调用，结果一致。 `initialize`
 * 中调用用于提前获取 `clearScore`，供分数动画在闪烁开始时同步显示。 `dispose` 中再次调用用于执行实际的消行、加分、升级等状态更新。
 *
 * ## 生命周期
 *
 * 1. `constructor` → `initialize()` → 计算消除结果 → 启动闪烁序列、分数动画、结束定时器 → 播放消行音效
 * 2. Scheduler 每 120ms 切换透明度，720ms 后标记结束
 * 3. AnimationSystem 调用 `dispose()` → 取消定时器 → 重新计算消除结果 → 执行升级、更新状态等收尾逻辑
 *
 * @augments Base
 * @class ClearLinesAnimation
 */
class ClearLinesAnimation extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.Scheduler - 任务调度器
   * @param {number[]} options.lines - 待消除的行号数组
   */
  constructor(options) {
    super(options);
    this.initialize(options);
  }

  /**
   * ## 初始化动画
   *
   * 设置动画属性，为每行创建独立的透明度状态， 调用 `applyClearLines` 获取本次消除得分供分数动画使用，
   * 启动闪烁序列、分数动画和结束定时器，播放消行音效。
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
     * 设为 200（UI 层），确保闪烁效果显示在游戏界面上方。
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
     * ## 是否已结束
     *
     * 设为 `true` 后，AnimationSystem 会在 `flush()` 时自动移除。
     *
     * @type {boolean}
     */
    this._finished = false;

    /**
     * ## Scheduler 任务 ID 列表
     *
     * 记录所有注册的 Scheduler 任务，用于 `dispose()` 时批量取消。
     *
     * @type {number[]}
     */
    this._schedulerIds = [];

    /**
     * ## 动画行数据
     *
     * 每项包含行索引和当前透明度。
     *
     * | 属性  | 类型   | 说明                         |
     * | ----- | ------ | ---------------------------- |
     * | y     | number | 行索引                       |
     * | alpha | number | 当前透明度（1=显示, 0=隐藏） |
     *
     * @type {{ y: number; alpha: number }[]}
     */
    this.lines = lines.map((y) => ({ y, alpha: 1 }));

    const { Scheduler, Game } = this;
    const GE = GameEvents(Game.id);
    const AE = AudioEvents();

    /**
     * ## 提前计算消除得分
     *
     * `applyClearLines` 是纯函数，此处调用仅用于获取 `clearScore`， 供分数动画在闪烁开始时立即显示。不会产生副作用。
     *
     * @type {number}
     */
    const { clearScore } = applyClearLines(Game);

    /**
     * ## 闪烁切换函数
     *
     * 将所有行的透明度在 1 和 0 之间切换。
     */
    const toggle = () => {
      for (const line of this.lines) {
        line.alpha = line.alpha === 1 ? 0 : 1;
      }
    };

    /**
     * ## 闪烁序列（含分数动画触发）
     *
     * 6 个任务：
     *
     * - 第 1 个（delay 50ms）：触发消除得分动画
     * - 第 2-6 个（各 delay 120ms）：切换透明度，共 5 次 toggle
     */
    const ids = Scheduler.sequence([
      {
        fn: () => {
          this.emit(GE.START_CLEAR_SCORE, {
            score: clearScore,
            lines: this.lines.map((l) => l.y),
          });
        },
        delay: 50,
      },
      { fn: toggle, delay: 120 },
      { fn: toggle, delay: 120 },
      { fn: toggle, delay: 120 },
      { fn: toggle, delay: 120 },
      { fn: toggle, delay: 120 },
    ]);

    this._schedulerIds.push(...ids);

    /**
     * ## 动画结束定时器
     *
     * 720ms 后标记动画完成，AnimationSystem 将调用 dispose()。
     */
    const endId = Scheduler.delay(() => {
      this._finished = true;
    }, 720);

    this._schedulerIds.push(endId);

    /**
     * ## 播放消行音效
     *
     * 传入消除行数 - 1 用于音符选择和和弦变奏。
     */
    this.emit(AE.PLAY_SOUND, {
      sound: 'CLEAR',
      lines: lines.length - 1,
    });
  }

  /**
   * ## 清理资源并执行收尾逻辑
   *
   * 由 AnimationSystem 在移除动画时自动调用。 取消所有 Scheduler 定时器，重新调用 `applyClearLines`
   * 获取最终消除结果， 依次执行升级逻辑、更新状态、保存最高分、刷新 HUD。
   *
   * `applyClearLines` 是纯函数，此处再次调用结果与 `initialize` 中一致。
   *
   * @returns {void}
   */
  dispose() {
    const { Scheduler, Game } = this;

    // 取消所有闪烁和结束定时器
    for (const id of this._schedulerIds) {
      Scheduler.cancel(id);
    }

    const uuid = Game.id;
    const result = applyClearLines(Game);
    const { level, levelUp } = result;
    const GE = GameEvents(uuid);
    const RE = ReplayEvents(uuid);

    Scheduler.sequence([
      {
        fn: () => {
          // 触发升级逻辑（回放时不触发升级提示音/动画）
          this.emit(RE.STOP_CLEAR_LINES, { isLevelUp: levelUp, level });
        },
      },
      {
        fn: () => {
          // 更新游戏状态（消行、加分、更新等级）
          this.emit(GE.UPDATE_STATE, {
            stateHandler: result.stateHandler,
          });
        },
      },
      {
        fn: () => {
          // 检查并保存最高分
          this.emit(GE.SAVE_HIGH_SCORE);
        },
      },
      {
        fn: () => {
          // 刷新 HUD 显示（分数、等级等）
          this.emit(GE.UPDATE_HUD);
        },
      },
    ]);
  }

  /**
   * ## 渲染动画
   *
   * 将当前闪烁状态传递给 UI 层进行绘制。
   *
   * @returns {void}
   */
  render() {
    const { Game } = this;
    const UE = UIEvents(Game.id);
    this.emit(UE.RENDER_CLEAR_LINES, { state: { lines: this.lines } });
  }
}

export default ClearLinesAnimation;
