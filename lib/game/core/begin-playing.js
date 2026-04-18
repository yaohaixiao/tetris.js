import GameState from '../../game/state/game-state.js';
import EngineState from '../../engine/state/engine-state.js';
import Sounds from '../../audio/sounds.js';
import padStart from '../../utils/pad-start.js';
import playBGM from '../../audio/play-bgm.js';
import spawn from '../logic/spawn.js';
import restartGameLoop from '../../engine/restart-game-loop.js';
import setGameStateMode from '../state/set-game-state-mode.js';

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
