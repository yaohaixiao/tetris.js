/**
 * # 游戏暂停
 *
 * 游戏结束或等级选择界面时无法暂停
 *
 * @function pause
 * @param {object} game - 执行上下文对象
 * @returns {void}
 */
const pause = (game) => {
  const { id, Store } = game;
  const mode = Store.getMode();

  // 游戏结束或处于等级选择界面时，禁止暂停/继续操作
  if (mode !== 'playing') {
    return;
  }

  game.emit(`ui:${id}:update:mode`, { mode: 'paused' });

  Store.setMode('paused');
  game.emit('audio:stop:bgm');
  game.emit('audio:resume:sound', { sound: 'PAUSED' });
  game.emit(`game:${id}:start:paused`);
};

export default pause;
