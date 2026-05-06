import EventBus from '@/lib/core/event-bus';
import Game from '@/lib/game';

const over = () => {
  const { store } = Game;
  const mode = store.getMode();

  // 防止重复执行
  if (mode === 'game-over' || mode === 'replay') {
    return;
  }

  // 1. 先停止录制
  EventBus.emit('replay:stop:record');

  // 2. 游戏结束，停止播放背景音乐，并播放游戏结束的音效
  EventBus.emit('audio:stop:bgm');
  EventBus.emit('audio:sounds:game:over');

  // 3. 有回放记录数据，则开始播放回放
  EventBus.emit('replay:game:over');
};

export default over;
