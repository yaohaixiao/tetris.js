import GameState from '../state/game-state.js';
import Sounds from '../audio/sounds.js';
import pad from '../utils/pad.js';
import playBGM from '../audio/play-bgm.js';
import spawn from './spawn.js';
import updateSpeed from './update-speed';

const startGame = () => {
  const $level = document.querySelector('#level');

  if ($level) {
    $level.textContent = pad(GameState.level, 2);
  }

  // 生成第一个下落的方块
  spawn();
  // 播放游戏开始/等级启动音效
  Sounds.levelStart();

  setTimeout(() => {
    // 播放背景音乐
    playBGM();
  }, 250);

  // 根据当前等级设置下落速度，启动游戏主循环
  updateSpeed();
};

export default startGame;
