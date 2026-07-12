import COLORS from '@/lib/constants/colors.js';
import Base from '@/lib/core';
import applyClearLines from '@/lib/game/actions/apply-clear-lines.js';
import {
  AudioEvents,
  GameEvents,
  ReplayEvents,
  UIEvents,
} from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：ClearLinesAnimation 消行动画
 *
 * ============================================================
 *
 * 控制消除行的闪烁动画特效， 并在动画完成后执行实际的消行操作。
 *
 * ## 动画表现
 *
 * - 每行独立维护透明度状态
 * - 每 120ms 切换一次透明度（6 个阶段）
 * - 偶数阶段（0, 2, 4）：显示（alpha = 1）
 * - 奇数阶段（1, 3, 5）：隐藏（alpha = 0）
 * - 总持续时间为 720ms
 *
 * ## 时间驱动
 *
 * - 闪烁切换：Scheduler.sequence 每 120ms 执行一次
 * - 动画结束：720ms 后设置 _finished = true
 * - 收尾逻辑：dispose() 时计算消除结果、触发分数动画、 执行升级、更新状态
 *
 * ## 消除结果复用
 *
 * ApplyClearLines 是纯函数，可在 initialize 和 dispose 中分别安全调用，结果一致。
 *
 * ## 生命周期
 *
 * 1. Constructor → 计算消除结果 → 启动闪烁序列、 分数动画、结束定时器 → 播放消行音效
 * 2. Scheduler 每 120ms 切换透明度，720ms 后标记结束
 * 3. Dispose() → 取消定时器 → 重新计算消除结果 → 执行升级、更新状态等收尾逻辑
 *
 * @augments Base
 * @class ClearLinesAnimation
 */
class ClearLinesAnimation extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置对象
   */
  constructor(options) {
    super(options);
    this.initialize(options);
  }

  /**
   * ## initialize：初始化动画
   *
   * 设置动画属性，为每行创建独立的透明度状态， 启动闪烁序列、分数动画和结束定时器，播放消行音效。
   *
   * @param {object} options - 配置对象
   * @param {number[]} options.lines - 待消除的行号数组
   * @returns {void}
   */
  initialize(options) {
    const { lines } = options;

    /**
     * 渲染层级（200 = UI 层）。
     *
     * @type {number}
     */
    this.layer = 200;

    /**
     * 是否阻塞用户输入。
     *
     * @type {boolean}
     */
    this.blocking = true;

    /**
     * 动画名称标识。
     *
     * @type {string}
     */
    this.name = 'clear-lines';

    /**
     * 是否已结束。
     *
     * @type {boolean}
     */
    this._finished = false;

    /**
     * Scheduler 任务 ID 列表。
     *
     * @type {number[]}
     */
    this._schedulerIds = [];

    const { Scheduler, Game, Store } = this;
    const GE = GameEvents(Game.id);
    const AE = AudioEvents();

    /**
     * 动画行数据。
     *
     * | 属性  | 类型   | 说明                         |
     * | :---- | :----- | :--------------------------- |
     * | y     | number | 行索引                       |
     * | alpha | number | 当前透明度（1=显示, 0=隐藏） |
     *
     * @type {{ y: number; alpha: number; color: string }[]}
     */
    this.lines = lines.map((y) => ({
      y,
      alpha: 1,
      color: Store.getState().next?.color || COLORS.WHITE,
    }));

    // 提前计算消除得分（纯函数，无副作用）
    const { clearScore, combo, comboScore } = applyClearLines(Game);

    // 闪烁切换函数
    const toggle = () => {
      for (const line of this.lines) {
        line.alpha = line.alpha === 1 ? 0 : 1;
      }
    };

    // 闪烁序列 + 分数动画触发
    const ids = Scheduler.sequence([
      {
        fn: () => {
          this.emit(GE.START_CLEAR_SCORE, {
            score: clearScore,
            lines: this.lines.map((l) => l.y),
            combo,
            comboScore,
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

    // 动画结束定时器（720ms 后）
    const endId = Scheduler.delay(() => {
      this._finished = true;
    }, 720);

    this._schedulerIds.push(endId);

    // 播放消行音效
    this.emit(AE.PLAY_SOUND, {
      sound: 'CLEAR',
      lines: lines.length - 1,
      level: Store.getLevel(),
    });
  }

  /**
   * ## dispose：清理资源并执行收尾逻辑
   *
   * 取消所有定时器，重新计算消除结果， 依次执行升级、更新状态、保存最高分、刷新 HUD。
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
          this.emit(RE.STOP_CLEAR_LINES, { isLevelUp: levelUp, level });
        },
      },
      {
        fn: () => {
          this.emit(GE.UPDATE_STATE, {
            stateHandler: result.stateHandler,
          });
        },
      },
      {
        fn: () => {
          this.emit(GE.SAVE_HIGH_SCORE);
        },
      },
      {
        fn: () => {
          this.emit(GE.UPDATE_HUD);
        },
      },
    ]);
  }

  /**
   * ## render：渲染动画
   *
   * 将当前闪烁状态传递给 UI 层进行绘制。
   *
   * @returns {void}
   */
  render() {
    const { Game, lines } = this;
    const UE = UIEvents(Game.id);
    this.emit(UE.RENDER_CLEAR_LINES, { state: { lines } });
  }
}

export default ClearLinesAnimation;
