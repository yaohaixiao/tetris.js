import GameState from '../state/game-state.js';
import Sounds from '../audio/sounds.js';
import Effects from '../ui/effects.js';
import stopBGM from '../audio/stop-bgm.js';
import playBGM from '../audio/play-bgm.js';
import updateDrawPause from '../ui/update-draw-pause.js';
import updateSpeed from '../game/update-speed.js';

/**
 * # 切换游戏暂停 / 继续状态
 *
 * 游戏结束或等级选择界面时无法暂停
 *
 * @function togglePause
 * @returns {boolean | undefined} 无效状态时返回 false
 */
const togglePause = () => {
  // 游戏结束或处于等级选择界面时，禁止暂停/继续操作
  if (GameState.isGameOver || GameState.isSelectLevel) {
    return false;
  }

  const effect = Effects.clock;

  // 切换暂停状态
  GameState.isPaused = !GameState.isPaused;

  // 执行暂停逻辑
  if (GameState.isPaused) {
    // 清除游戏主循环，方块停止下落
    cancelAnimationFrame(GameState.rafId);
    // 暂停背景音乐
    stopBGM();
    // 播放暂停音效
    Sounds.pause();
    // 绘制暂停界面
    effect.rafId = requestAnimationFrame(updateDrawPause);
  }
  // 执行继续游戏逻辑
  else {
    cancelAnimationFrame(effect.rafId);
    effect.rafId = null;
    effect.timestamp = 0;
    effect.count = 0;

    // 播放恢复游戏音效
    Sounds.resume();
    // 恢复背景音乐
    playBGM();
    // 重启游戏主循环，恢复方块下落速度
    updateSpeed();
  }
};

export default togglePause;
