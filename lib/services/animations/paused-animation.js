import Base from '@/lib/core';
import { AudioEvents } from '@/lib/events/event-catalog.js';

/**
 * # PausedAnimation（暂停动画）
 *
 * 在游戏暂停时显示暂停界面，并播放每秒一次的"滴答"提示音。 这是一个常驻动画，不会自动结束，需要外部主动调用 `stop()` 移除。
 *
 * ## 动画表现
 *
 * - 暂停时显示半透明遮罩和"PAUSED"文字
 * - 每秒播放一次滴答音效，提醒玩家游戏仍在暂停状态
 * - 动画层级最高（500），确保遮罩在最上层
 * - 阻塞所有用户输入（除继续/退出等暂停菜单操作外）
 *
 * ## 时间驱动
 *
 * 全部使用 Scheduler 驱动，不使用 `update(delta)`：
 *
 * - 滴答音效：每 1000ms 播放一次
 * - 外部调用 `stop()` 设置 `_finished = true` 结束动画
 *
 * ## 生命周期
 *
 * 1. `constructor` → 启动滴答定时器
 * 2. Scheduler 每秒播放音效
 * 3. 外部调用 `stop()` → 设置 `_finished = true`
 * 4. AnimationSystem 调用 `dispose()` → 取消定时器
 *
 * @augments Base
 * @class PausedAnimation
 */
class PausedAnimation extends Base {
  /**
   * ## 构造函数
   *
   * 初始化暂停动画，启动滴答定时器。
   *
   * @param {object} options - 配置对象
   */
  constructor(options) {
    super(options);

    this.initialize();
  }

  initialize() {
    /**
     * ## 渲染层级
     *
     * 设为 500（最高层），确保暂停遮罩显示在所有内容之上。
     *
     * @type {number}
     */
    this.layer = 500;

    /**
     * ## 是否阻塞用户输入
     *
     * 暂停期间禁止大部分游戏操作。
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
    this.name = 'paused';

    /**
     * ## 是否已结束
     *
     * 由外部调用 `stop()` 设置为 `true`， AnimationSystem 在 `flush()` 时自动移除。
     *
     * @type {boolean}
     */
    this._finished = false;

    /**
     * ## 是否处于激活状态
     *
     * 用于控制 `resume()` 时避免重复启动定时器。
     *
     * @type {boolean}
     */
    this.active = true;

    // 启动滴答定时器
    this._startTick();
  }

  /**
   * ## 启动滴答定时器
   *
   * 每 1000ms 播放一次滴答音效，提醒玩家游戏仍在暂停中。
   *
   * @private
   * @returns {void}
   */
  _startTick() {
    const { Scheduler } = this;
    const events = AudioEvents();

    /**
     * ## 滴答定时器 ID
     *
     * @type {number}
     */
    this._tickId = Scheduler.interval(() => {
      this.emit(events.PLAY_SOUND, { sound: 'SECOND_TICK' });
    }, 1000);
  }

  /**
   * ## 恢复暂停动画
   *
   * 将活跃状态设为 `true`，重新启动滴答定时器。 如果已经处于活跃状态则忽略。
   *
   * @returns {void}
   */
  resume() {
    if (this.active) return;
    this.active = true;
    this._startTick();
  }

  /**
   * ## 暂停结束处理
   *
   * 将活跃状态设为 `false`，标记动画结束。 AnimationSystem 会在 `flush()` 时自动调用 `dispose()` 清理。
   *
   * @returns {void}
   */
  stop() {
    this.active = false;
    this._finished = true;
  }

  /**
   * ## 清理资源
   *
   * 由 AnimationSystem 在移除动画时自动调用。 取消滴答定时器。
   *
   * @returns {void}
   */
  dispose() {
    const { Scheduler } = this;
    if (this._tickId != null) {
      Scheduler.cancel(this._tickId);
    }
  }

  /**
   * ## 渲染暂停动画
   *
   * 实际的渲染由 UI 层监听事件完成，此方法为空实现。
   *
   * @returns {void}
   */
  render() {
    // UI 层通过事件处理渲染
  }
}

export default PausedAnimation;
