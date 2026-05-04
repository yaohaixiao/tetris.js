import Game from '@/lib/game';
import Audio from '@/lib/services/audio';
import reset from '@/lib/game/core/reset.js';
import spawn from '@/lib/game/logic/spawn.js';

/**
 * # 重新开始游戏
 *
 * 重置所有游戏数据、清空棋盘、生成新方块，并重启游戏主循环与背景音乐
 *
 * @function restart
 * @returns {void}
 */
const restart = () => {
  const { store } = Game;
  const mode = store.getMode();

  if (mode !== 'playing') {
    return;
  }

  reset('playing');

  // 生成第一个新方块
  spawn();
  // 重启背景音乐
  Audio.playBGM(store.getLevel());
};

export default restart;
