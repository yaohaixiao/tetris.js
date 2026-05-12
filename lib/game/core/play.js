/**
 * # 游戏继续
 *
 * 游戏结束或等级选择界面时无法暂停
 *
 * @function play
 * @param context - 执行上下文对象
 * @returns {boolean | undefined} 无效状态时返回 false
 */
const play = (context) => {
  const { Store, options } = context;
  const mode = context.Store.getMode();

  // 游戏结束或处于等级选择界面时，禁止暂停/继续操作
  if (mode !== 'paused') {
    return false;
  }

  const level = Store.getLevel();
  const maxLevel = options.Level.max;

  context.emit('ui:update:mode', { mode: 'playing' });

  // 执行继续游戏逻辑
  Store.setMode('playing');
  context.emit('game:stop:paused');
  context.emit('audio:play:sound', { sound: 'RESUME' });
  context.emit('audio:play:bgm', { level, maxLevel });
};

export default play;
