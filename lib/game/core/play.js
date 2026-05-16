/**
 * # 游戏继续
 *
 * 游戏结束或等级选择界面时无法暂停
 *
 * @function play
 * @param context - 执行上下文对象
 * @returns {void}
 */
const play = (context) => {
  const { id, Store, Level } = context;
  const mode = context.Store.getMode();

  // 游戏结束或处于等级选择界面时，禁止暂停/继续操作
  if (mode !== 'paused') {
    return;
  }

  const level = Store.getLevel();
  const maxLevel = Level.max;

  context.emit(`ui:${id}:update:mode`, { mode: 'playing' });

  // 执行继续游戏逻辑
  Store.setMode('playing');
  context.emit(`game:${id}:stop:paused`);
  context.emit('audio:play:sound', { sound: 'RESUME' });
  context.emit('audio:play:bgm', { level, maxLevel });
};

export default play;
