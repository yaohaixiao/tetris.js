import Sounds from '@/lib/audio/sounds.js';
import stopBGM from '@/lib/audio/stop-bgm.js';
import playBGM from '@/lib/audio/play-bgm.js';
import { registerAnimation } from '@/lib/animations/system.js';
import LevelUpAnimation from '@/lib/animations/level-up-animation.js';

const startLevelUp = () => {
  // 音频控制
  stopBGM();
  Sounds.levelUp();

  // 注册动画
  registerAnimation(
    new LevelUpAnimation({
      onComplete: () => {
        // 🎵 动画结束后恢复 BGM
        playBGM();
      },
    }),
  );
};

export default startLevelUp;
