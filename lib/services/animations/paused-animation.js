import Base from '@/lib/core';
import { AudioEvents } from '@/lib/events/event-catalog.js';

/**
 * # PausedAnimation（暂停动画）
 *
 * 在游戏暂停时显示暂停界面，并播放每秒一次的"滴答"提示音。 这是一个**常驻动画**，不会自动结束，需要外部主动移除。
 *
 * ## 动画表现
 *
 * - 暂停时显示半透明遮罩和"PAUSED"文字
 * - 每秒播放一次滴答音效，提醒玩家游戏仍在暂停状态
 * - 动画层级最高（500），确保遮罩在最上层
 * - 阻塞所有用户输入（除继续/退出等暂停菜单操作外）
 *
 * ## 生命周期
 *
 * 1. `constructor` → 初始化状态，启动滴答定时器
 * 2. `update(delta)` → 累加计时器，每秒播放音效
 * 3. `render()` → 渲染暂停界面
 * 4. 外部调用 `stop()` → 停止定时器，标记为非活跃
 *
 * @augments Base
 * @class PausedAnimation
 */
class PausedAnimation extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Scheduler - 任务调度器
   */
  constructor(options) {
    super(options);

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
     * ## 计时器（秒）
     *
     * 用于控制滴答音效的播放间隔。
     *
     * @type {number}
     */
    this.timer = 0;

    /**
     * ## 是否处于激活状态
     *
     * @type {boolean}
     */
    this.active = true;

    /**
     * ## 滴答定时器 ID
     *
     * @type {number}
     */
    this._tickId = 0;

    // 启动滴答定时器
    this._tick();
  }

  /**
   * ## 启动滴答定时器
   *
   * 每秒播放一次滴答音效。
   *
   * @private
   * @returns {void}
   */
  _tick() {
    if (!this.active) {
      return;
    }

    const { Scheduler } = this;
    const events = AudioEvents();

    this._tickId = Scheduler.interval(() => {
      this.emit(events.PLAY_SOUND, { sound: 'SECOND_TICK' });
    }, 1000);
  }

  /**
   * ## 更新暂停动画状态
   *
   * 累加计时器，每秒触发一次滴答音效。
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   * @returns {boolean} 始终返回 `true`，表示动画不会自动结束
   */
  update(delta) {
    // 非活跃状态，通知动画系统移除
    if (!this.active) {
      return false;
    }

    const events = AudioEvents();

    // 累加计时器
    this.timer += delta;

    /**
     * 每秒播放一次"滴答"提示音
     *
     * 用于提醒玩家游戏仍在暂停状态，避免长时间无操作。
     */
    if (this.timer >= 1) {
      // 播放秒针滴答声
      this.emit(events.PLAY_SOUND, { sound: 'SECOND_TICK' });
      // 重置计时器，准备下一次播放
      this.timer = 0;
    }

    return true;
  }

  /**
   * ## 恢复暂停动画
   *
   * 将活跃状态设为 `true`，使动画重新生效。
   *
   * @returns {void}
   */
  resume() {
    this.active = true;
  }

  /**
   * ## 暂停结束处理
   *
   * 将活跃状态设为 `false`，取消滴答定时器。
   *
   * @returns {void}
   */
  stop() {
    const { Scheduler } = this;
    this.active = false;
    Scheduler.cancel(this._tickId);
  }

  /**
   * ## 渲染暂停动画
   *
   * 标记活跃状态为 `true`，实际的渲染由 UI 层监听事件完成。
   *
   * @returns {void}
   */
  render() {
    this.active = true;
  }
}

export default PausedAnimation;
