import Sounds from '../audio/sounds.js';
import GameState from '../state/game-state.js';
import Effects from './effects.js';
import drawOver from './draw-over.js';
import stopBGM from '../audio/stop-bgm.js';
import saveHighScore from '../state/save-high-score.js';

/**
 * # 强制触发游戏结束
 *
 * 停止音乐、清除定时器、播放结束音效、保存最高分并显示游戏结束界面
 *
 * @function forceOver
 * @returns {boolean} - 暂停状态，返回 false，否则返回 true
 */
const forceOver = () => {
  const effect = Effects.countdown;

  if (GameState.isPaused) {
    return false;
  }

  // 停止背景音乐
  stopBGM();

  // 设置游戏结束状态
  GameState.isGameOver = true;
  GameState.isPaused = false;
  GameState.isHiddenMode = false;
  effect.show = false;

  // 清除游戏主循环
  cancelAnimationFrame(GameState.rafId);

  // 播放游戏结束音效
  Sounds.gameOver();

  // 保存当前最高分
  saveHighScore();

  // 延迟短暂时间后绘制游戏结束界面
  setTimeout(() => {
    drawOver();
  }, 10);

  return true;
};

export default forceOver;
