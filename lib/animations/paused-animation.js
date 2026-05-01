import Sounds from '@/lib/audio/sounds.js';

/**
 * # 暂停动画类
 *
 * 负责在游戏暂停时显示暂停界面，并播放每秒一次的提示音效 这是一个"常驻"动画，不会自动结束，需要外部主动移除
 */
class PausedAnimation {
  /**
   * ## 渲染层级（UI 层，显示在最前面）
   *
   * @type {number}
   */
  layer = 500;

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
  name = 'paused';

  /**
   * ## 计时器（秒），用于控制音效播放间隔
   *
   * @type {number}
   */
  timer = 0;

  /**
   * ## 是否处于激活
   *
   * @type {boolean}
   */
  active = true;

  /**
   * ## 更新暂停动画状态
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   * @returns {boolean} - 始终返回 true，表示动画永远不会自动结束
   */
  update(delta) {
    if (!this.active) {
      return false;
    }

    // 累加计时器
    this.timer += delta;

    /*
     * 每秒播放一次"滴答"提示音
     * 用于提醒玩家游戏仍在暂停状态，避免长时间无操作
     */
    if (this.timer >= 1) {
      // 播放秒针滴答声
      Sounds.secondTick();
      // 重置计时器，准备下一次播放
      this.timer = 0;
    }

    return true;
  }

  /**
   * ## 暂停结束处理
   *
   * 将活动状态 active 设置为 true
   */
  stop() {
    this.active = false;
  }

  /**
   * ## 渲染暂停动画
   *
   * 将暂停界面绘制到屏幕上
   */
  render() {
    this.active = true;
  }
}

export default PausedAnimation;
