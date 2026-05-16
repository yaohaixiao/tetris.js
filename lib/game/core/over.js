const over = (game) => {
  const { id, Store } = game;
  const mode = Store.getMode();

  // 防止重复执行
  if (mode === 'game-over' || mode === 'replay') {
    return;
  }

  // 1. 先停止录制
  game.emit(`replay:${id}:stop:record`);

  // 2. 游戏结束，停止播放背景音乐，并播放游戏结束的音效
  game.emit('audio:stop:bgm');
  game.emit('audio:resume:sound', { sound: 'GAME_OVER' });

  // 3. 有回放记录数据，则开始播放回放
  game.emit(`replay:${id}:game:over`);
};

export default over;
