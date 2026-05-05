import Engine from '@/lib/engine';
import Game from '@/lib/game';
import CommandQueue from '@/lib/core/command/command-queue.js';
import Audio from '@/lib/services/audio';
import UI from '@/lib/services/ui';
import Replay from '@/lib/runtime/replay-runtime.js';
import setBeginningState from '@/lib/game/utils/set-beginning-state.js';

/**
 * # 重置游戏状态
 *
 * 该函数用于将当前游戏从游戏结束（Game Over）状态安全地重置回主菜单状态， 或者从游戏中（Playing）状态强制重新开始游戏。
 *
 * 执行流程：
 *
 * 1. 停止背景音乐
 * 2. 重置游戏主循环/引擎状态
 * 3. 清空游戏棋盘数据
 * 4. 切换游戏模式为 main-menu
 * 5. 重置核心游戏状态数据（score / lines / level / next）
 * 6. 重新渲染 HUD（分数/等级/最高分）
 *
 * @function reset
 * @param {string} [mode='main-menu'] - 希望重置的状态. Default is `'main-menu'`
 * @returns {void}
 */
const reset = (mode = 'main-menu') => {
  const { store } = Game;
  let level = store.getLevel();

  // 1. 停止背景音乐：避免从游戏结束/暂停状态切回菜单时音频继续播放
  Audio.stopBGM();

  // 2. 重置动画，
  Engine.Animations.clear();
  CommandQueue.clear();

  // 按R键重新开始，则清理回放数据
  if(mode === 'playing') {
    Replay.stopRecord();
    Replay.stopPlay();
    Replay.clear();
  }

  // 3. 重置棋盘数据
  store.resetBoard();

  // 结束状态，返回主菜单，重置难度等级
  if (mode === 'main-menu') {
    store.setDifficulty('easy');
    level = 1;
  }

  setBeginningState(mode, level);

  // 4. 更新游戏HUD状态信息
  store.setState({
    score: 0,
    lines: 0,
    level: 1,
    next: null,
  });

  // 5. 更新 HUD UI
  UI.updateHud(store.getState());

  // 6. 重新开始记录
  Replay.startRecord(Engine.timestamp);
};

export default reset;
