const over = (context) => {
  const mode = context.Store.getMode();

  // 防止重复执行
  if (mode === 'game-over' || mode === 'replay') {
    return;
  }

  // 1. 先停止录制
  context.emit('replay:stop:record');

  // 2. 游戏结束，停止播放背景音乐，并播放游戏结束的音效
  context.emit('audio:stop:bgm');
  context.emit('audio:play:sound', { sound: 'GAME_OVER' });

  // 3. 有回放记录数据，则开始播放回放
  context.emit('replay:game:over');
};

export default over;
