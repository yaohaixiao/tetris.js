import Engine from '@/lib/engine';
import Game from '@/lib/game';
import spawn from '@/lib/game/logic/spawn.js';
import stopBGM from '@/lib/audio/stop-bgm.js';
import playBGM from '@/lib/audio/play-bgm.js';
import renderHud from '@/lib/ui/hud/render-hud.js';

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

  if (mode === 'paused' || mode === 'game-over' || mode === 'main-menu') {
    return;
  }

  // 停止当前背景音乐
  stopBGM();

  // 重置核心游戏状态
  store.setState({
    mode: 'playing',
    score: 0,
    lines: 0,
    level: 1,
  });
  // 重置游戏棋盘为空
  store.resetBoard();

  const state = store.getState();

  // 刷新分数、等级、行数等 UI 显示
  renderHud({
    ...state,
    needReset: true,
  });

  // 生成第一个新方块
  spawn();
  // 重启背景音乐
  playBGM(store.getLevel());
  // 启动游戏主循环（方块自动下落）
  Engine.restart();
};

export default restart;
