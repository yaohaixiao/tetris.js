import GameState from '@/lib/game/state/game-state.js';
import EngineState from '@/lib/engine/state/engine-state.js';
import Sounds from '@/lib/audio/sounds.js';
import playBGM from '@/lib/audio/play-bgm.js';
import spawn from '@/lib/game/logic/spawn.js';
import setGameStateMode from '@/lib/game/state/set-game-state-mode.js';
import restartGameLoop from '@/lib/engine/restart-game-loop.js';
import padStart from '@/lib/utils/pad-start.js';

const beginPlaying = () => {
  const $level = document.querySelector('#level');

  if ($level) {
    $level.textContent = padStart(GameState.level, 2);
  }

  setGameStateMode('playing');

  // 生成第一个下落的方块
  spawn();
  // 播放游戏开始/等级启动音效
  Sounds.levelStart();

  setTimeout(() => {
    // 播放背景音乐
    playBGM();
  }, 250);

  // 根据当前等级设置下落速度，启动游戏主循环
  EngineState.rafId = requestAnimationFrame(restartGameLoop);
};

export default beginPlaying;
