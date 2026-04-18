import Sounds from '@/lib/audio/sounds.js';
import stopBGM from '@/lib/audio/stop-bgm.js';
import playBGM from '@/lib/audio/play-bgm.js';
import restartGameLoop from '@/lib/engine/restart-game-loop.js';
import setGameStateMode from '@/lib/game/state/set-game-state-mode.js';
import getGameStateMode from '@/lib/game/state/get-game-state-mode.js';
import {
  startPaused,
  stopPaused,
} from '@/lib/controllers/paused-controller.js';

/**
 * # 切换游戏暂停 / 继续状态
 *
 * 游戏结束或等级选择界面时无法暂停
 *
 * @function togglePause
 * @returns {boolean | undefined} 无效状态时返回 false
 */
const togglePause = () => {
  const mode = getGameStateMode();

  // 游戏结束或处于等级选择界面时，禁止暂停/继续操作
  if (mode === 'game-over' || mode === 'main-menu') {
    return false;
  }

  // 执行暂停逻辑
  if (mode === 'playing') {
    setGameStateMode('paused');
    // 暂停背景音乐
    stopBGM();
    // 播放暂停音效
    Sounds.pause();
    // 绘制暂停界面
    startPaused();
  }
  // 执行继续游戏逻辑
  else {
    stopPaused();

    setGameStateMode('playing');

    // 播放恢复游戏音效
    Sounds.resume();
    // 恢复背景音乐
    playBGM();

    // 重启游戏主循环，恢复方块下落速度
    restartGameLoop();
  }
};

export default togglePause;
