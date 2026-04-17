import renderPause from '../ui/render-paused.js';
import Sounds from '../audio/sounds.js';

class PausedAnimation {
  constructor(layer = 500) {
    // 在游戏上层
    this.layer = layer;
    this.name = 'paused';
    this.timer = 0;
    this.blocking = true;
  }

  update(delta) {
    this.timer += delta;

    renderPause();

    // 每秒播放一次 tick
    if (this.timer >= 1) {
      Sounds.secondTick();
      this.timer = 0;
    }

    // paused 是“常驻动画”，永远不结束
    return true;
  }

  render() {
    renderPause();
  }
}

export default PausedAnimation;
