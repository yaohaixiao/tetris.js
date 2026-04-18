import Sounds from '@/lib/audio/sounds.js';
import renderPause from '@/lib/ui/render-paused.js';

/**
 * # 暂停动画类
 *
 * 负责在游戏暂停时显示暂停界面，并播放每秒一次的提示音效 这是一个"常驻"动画，不会自动结束，需要外部主动移除
 */
class PausedAnimation {
  /**
   * ## 创建暂停动画实例
   *
   * @param {number} [layer=500] - 渲染层级，默认 500（显示在游戏界面上层） 使用较高的默认值确保暂停界面覆盖游戏内容.
   *   Default is `500`
   */
  constructor(layer = 500) {
    this.layer = layer; // 渲染层级（数字越大越靠前）
    this.name = 'paused'; // 动画名称标识
    this.timer = 0; // 计时器（秒），用于控制音效播放间隔
    this.blocking = true; // 是否阻塞用户输入（暂停期间禁止游戏操作）
  }

  /**
   * ## 更新暂停动画状态
   *
   * @param {number} delta - 距离上一帧的时间差（秒）
   * @returns {boolean} - 始终返回 true，表示动画永远不会自动结束
   */
  update(delta) {
    // 累加计时器
    this.timer += delta;

    // 渲染暂停界面（每一帧都渲染，确保界面持续显示）
    renderPause();

    /*
     * 每秒播放一次"滴答"提示音
     * 用于提醒玩家游戏仍在暂停状态，避免长时间无操作
     */
    if (this.timer >= 1) {
      Sounds.secondTick(); // 播放秒针滴答声
      this.timer = 0; // 重置计时器，准备下一次播放
    }

    /*
     * 注意：paused 动画是"常驻动画"，永远不自动结束
     * 需要通过外部调用移除动画（例如按下暂停键时调用 removeAnimation）
     */
    return true;
  }

  /**
   * ## 渲染暂停动画
   *
   * 将暂停界面绘制到屏幕上
   */
  render() {
    renderPause();
  }
}

export default PausedAnimation;
