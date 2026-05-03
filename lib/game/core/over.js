import Game from '@/lib/game';
import Sounds from '@/lib/audio/sounds.js';
import Replay from '@/lib/engine/replay';
import stopBGM from '@/lib/audio/stop-bgm.js';
import spawn from '@/lib/game/logic/spawn.js';

const over = () => {
  const { store } = Game;
  const mode = store.getMode();

  // 防止重复执行
  if (mode === 'game-over' || mode === 'replay') {
    return;
  }

  // 1. 先停止录制
  Replay.stopRecord();

  // 2. 游戏结束流程
  Game.saveHighScore();
  stopBGM();
  Sounds.gameOver();

  // 3. 重置游戏场地
  store.resetBoard();
  store.setState({
    score: 0,
    lines: 0,
    level: 1,
  });

  // 4. 开启回放
  store.setMode('replay');
  Replay.startPlay();
  spawn();
};

export default over;
