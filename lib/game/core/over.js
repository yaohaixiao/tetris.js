const over = (context) => {
  const { id, Store } = context;
  const mode = Store.getMode();

  // 防止重复执行
  if (mode === 'game-over' || mode === 'replay') {
    return;
  }

  // 1. 先停止录制
  context.emit(`replay:${id}:stop:record`);

  // 2. 游戏结束，停止播放背景音乐，并播放游戏结束的音效
  context.emit('audio:stop:bgm');
  context.emit('audio:play:sound', { sound: 'GAME_OVER' });

  // 3. 有回放记录数据，则开始播放回放
  context.emit(`replay:${id}:game:over`);
};

export default over;
