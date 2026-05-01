import Engine from '@/lib/engine';
import Sounds from '@/lib/audio/sounds.js';
import stopBGM from '@/lib/audio/stop-bgm.js';
import LevelUpAnimation from '@/lib/animations/level-up-animation.js';

/**
 * # 启动“升级（Level Up）流程”
 *
 * 包含三件事：
 *
 * 1. 停止背景音乐（BGM）
 * 2. 播放升级音效
 * 3. 播放升级动画，并在结束后恢复 BGM
 *
 * 当前设计特点：
 *
 * - Index 单例直接访问 state
 * - 音频 + 动画 + 生命周期强耦合
 * - 通过 onComplete 手动编排副作用
 *
 * 使用场景：
 *
 * - Level 提升时触发
 *
 * @function startLevelUp
 * @param {number} level - 当前等级
 */
const startLevelUp = (level) => {
  const animation = new LevelUpAnimation(level);

  // 1. 音频：暂停 BGM
  stopBGM();

  // 2. 音效：播放升级提示音
  Sounds.levelUp();

  // 3. 动画：播放 Level Up 动画
  Engine.Animations.register(animation);
};

export default startLevelUp;
