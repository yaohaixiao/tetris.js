/**
 * # 游戏暂停
 *
 * 游戏结束或等级选择界面时无法暂停
 *
 * @function pause
 * @param context - 执行上下文对象
 * @returns {void}
 */
const pause = (context) => {
  const { id, Store } = context;
  const mode = Store.getMode();

  // 游戏结束或处于等级选择界面时，禁止暂停/继续操作
  if (mode !== 'playing') {
    return;
  }

  context.emit(`ui:${id}:update:mode`, { mode: 'paused' });

  Store.setMode('paused');
  context.emit('audio:stop:bgm');
  context.emit('audio:play:sound', { sound: 'PAUSED' });
  context.emit(`game:${id}:start:paused`);
};

export default pause;
