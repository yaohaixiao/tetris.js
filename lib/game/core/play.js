import EventBus from '@/lib/core/event-bus';
import Game from '@/lib/game';

/**
 * # 游戏继续
 *
 * 游戏结束或等级选择界面时无法暂停
 *
 * @function play
 * @returns {boolean | undefined} 无效状态时返回 false
 */
const play = () => {
  const { store } = Game;
  const mode = store.getMode();

  // 游戏结束或处于等级选择界面时，禁止暂停/继续操作
  if (mode !== 'paused') {
    return false;
  }

  EventBus.emit('ui:update:mode', { mode: 'playing' });

  // 执行继续游戏逻辑
  store.setMode('playing');
  EventBus.emit('effects:stop:paused');
  EventBus.emit('audio:sounds:resume');
  EventBus.emit('audio:play:bgm', { level: store.getLevel() });
};

export default play;
