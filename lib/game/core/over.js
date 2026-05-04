import Engine from '@/lib/engine';
import Game from '@/lib/game';
import Audio from '@/lib/services/audio';
import Replay from '@/lib/runtime/replay-runtime.js';
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
  Audio.stopBGM();
  Audio.Sounds.gameOver();

  if (Replay.hasData) {
    // 3. 重置游戏场地
    store.resetBoard();
    store.setState({
      score: 0,
      lines: 0,
      level: 1,
    });

    // 4. 开启回放
    store.setMode('replay');
    Replay.startPlay(Engine.timestamp);

    spawn();
  } else {
    store.setMode('game-over');
  }
};

export default over;
