import { registerAnimation } from '../animations/system.js';
import LevelUpAnimation from '../animations/level-up-animation.js';

import Sounds from '../audio/sounds.js';
import stopBGM from '../audio/stop-bgm.js';
import playBGM from '../audio/play-bgm.js';

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
