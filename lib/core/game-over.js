import Sounds from '../audio/sounds.js';
import stopBGM from '../audio/stop-bgm.js';
import saveHighScore from '../state/save-high-score.js';
import getGameStateMode from '../state/get-game-state-mode.js';
import setGameStateMode from '../state/set-game-state-mode.js';
import renderGameOver from '../ui/render-game-over.js';
import stopGameLoop from '../engine/stop-game-loop.js';

/**
 * # 游戏结束处理函数
 *
 * 触发游戏结束状态，停止所有游戏逻辑、播放音效、保存分数、显示结束画面 防止重复调用，确保只执行一次结束流程
 *
 * @function gameOver
 * @returns {boolean | undefined} 已结束时返回 false，避免重复执行
 */
const gameOver = () => {
  const mode = getGameStateMode();

  // 如果游戏已经结束，直接返回，防止重复执行
  if (mode === 'game-over' || mode === 'paused' || mode === 'main-menu') {
    return false;
  }

  // 标记游戏结束状态
  setGameStateMode('game-over');
  // 保存最新最高分
  saveHighScore();

  // 停止背景音乐
  stopBGM();
  // 播放游戏结束音效
  Sounds.gameOver();

  stopGameLoop();

  // 清除游戏主循环定时器
  renderGameOver();
};

export default gameOver;
