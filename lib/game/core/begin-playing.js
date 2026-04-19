import Engine from '@/lib/engine/engine.js';
import EngineState from '@/lib/engine/state/engine-state.js';
import Sounds from '@/lib/audio/sounds.js';
import playBGM from '@/lib/audio/play-bgm.js';
import spawn from '@/lib/game/logic/spawn.js';
import restartGameLoop from '@/lib/engine/restart-game-loop.js';
import padStart from '@/lib/utils/pad-start.js';

/**
 * @function beginPlaying
 * @param {object} [state=EngineState] - 游戏状态. Default is `EngineState`
 */
const beginPlaying = (state = EngineState) => {
  const $level = document.querySelector('#level');

  if ($level) {
    $level.textContent = padStart(state.level, 2);
  }

  Engine.setMode('playing');

  // 生成第一个下落的方块
  spawn(state);
  // 播放游戏开始/等级启动音效
  Sounds.levelStart();

  setTimeout(() => {
    // 播放背景音乐
    playBGM();
  }, 250);

  // 根据当前等级设置下落速度，启动游戏主循环
  Engine.rafId = requestAnimationFrame(restartGameLoop);
};

export default beginPlaying;
