import Engine from '@/lib/engine';
import Game from '@/lib/game';
import UI from '@/lib/services/ui';
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

  // 2. 游戏结束，停止播放背景音乐，并播放游戏结束的音效
  Audio.stopBGM();
  Audio.Sounds.gameOver();

  // 3. 有回放记录数据，则开始播放回放
  if (Replay.hasData) {
    // 重置游戏场地
    store.resetBoard();
    // 重置 HUD 信息和游戏开始时的难度设定
    store.setState({
      // 绘制游戏开始难度设定产生的方块信息
      board: store.getBeginningBoard(),
      score: 0,
      lines: 0,
      level: 1,
    });
    // 进入游戏回放状态
    store.setMode('replay');

    UI.updateHud(store.getState());

    // 开始回放
    Replay.startPlay(Engine.timestamp);

    // 开始绘制方块
    spawn();
  } else {
    // 没有回放记录，则直接进入游戏结束状态
    store.setMode('game-over');
  }
};

export default over;
