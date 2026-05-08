import EventBus from '@/lib/core/event-bus';
import Game from '@/lib/game';

/**
 * # 游戏暂停
 *
 * 游戏结束或等级选择界面时无法暂停
 *
 * @function pause
 * @returns {void}
 */
const pause = () => {
  const { store } = Game;
  const mode = store.getMode();

  // 游戏结束或处于等级选择界面时，禁止暂停/继续操作
  if (mode !== 'playing') {
    return;
  }

  EventBus.emit('ui:update:mode', { mode: 'paused' });

  store.setMode('paused');
  EventBus.emit('audio:stop:bgm');
  EventBus.emit('audio:sounds:pause');
  EventBus.emit('effects:start:paused');
};

export default pause;
