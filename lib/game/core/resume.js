/**
 * # 游戏继续
 *
 * 游戏结束或等级选择界面时无法暂停
 *
 * @function resume
 * @param {object} game - 执行上下文对象
 * @returns {void}
 */
const resume = (game) => {
  const { id, Store } = game;
  const mode = Store.getMode();

  // 游戏结束或处于等级选择界面时，禁止暂停/继续操作
  if (mode !== 'paused') {
    return;
  }

  const level = Store.getLevel();

  game.emit(`ui:${id}:update:mode`, { mode: 'playing' });

  // 执行继续游戏逻辑
  Store.setMode('playing');
  game.emit(`game:${id}:stop:paused`);
  game.emit('audio:resume:sound', { sound: 'RESUME' });
  game.emit('audio:resume:bgm', { level });
};

export default resume;
