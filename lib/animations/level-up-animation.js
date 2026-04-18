import Canvas from '@/lib/ui/canvas.js';
import FIREWORK_COLORS from '@/lib/ui/constants/firework-colors.js';
import renderLevelUp from '@/lib/ui/render-level-up.js';

class LevelUpAnimation {
  constructor({ onComplete }) {
    this.fireworks = this.createFireworks();
    this.onComplete = onComplete;

    this.name = 'level-up';
    this.timer = 0;
    // 单位：秒
    this.duration = 3;
    this.spawnTimer = 0;
    // 显示在最上层
    this.layer = 100;
    // 是否阻塞游戏
    this.blocking = true;
  }

  createFireworks() {
    const { width, height } = Canvas.gameBoard;

    const particles = [];

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 15;

      particles.push({
        x: width / 2,
        y: height / 2 - 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        color:
          FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
        alpha: 1,
      });
    }

    return particles;
  }

  update(delta) {
    this.timer += delta;
    this.spawnTimer += delta;

    this.updateFireworks(delta);

    if (this.spawnTimer > 0.6) {
      this.fireworks.push(...this.createFireworks());
      this.spawnTimer = 0;
    }

    if (this.timer >= this.duration) {
      this.onComplete?.();
      // 告诉 animations system 删除自己
      return false;
    }

    return true;
  }

  updateFireworks(delta) {
    const gravity = 0.01;

    for (const p of this.fireworks) {
      p.vx *= 0.98;
      p.vy *= 0.98;

      p.vy += gravity * delta;

      p.x += p.vx * delta * 0.008;
      p.y += (p.vy * delta) & 0.008;

      p.alpha -= delta * 0.024;
      p.radius += delta * 10;
    }

    this.fireworks = this.fireworks.filter((p) => p.alpha > 0);
  }

  render() {
    renderLevelUp({
      show: true,
      fireworks: this.fireworks,
    });
  }
}

export default LevelUpAnimation;
