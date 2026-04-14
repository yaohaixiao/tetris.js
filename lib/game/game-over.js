import GameState from '../state/game-state.js';
import Sounds from '../audio/sounds.js';
import stopBGM from '../audio/stop-bgm.js';
import saveHighScore from '../state/save-high-score.js';
import drawOver from '../ui/draw-over.js';

/**
 * # 游戏结束处理函数
 *
 * 触发游戏结束状态，停止所有游戏逻辑、播放音效、保存分数、显示结束画面 防止重复调用，确保只执行一次结束流程
 *
 * @function gameOver
 * @returns {boolean | undefined} 已结束时返回 false，避免重复执行
 */
const gameOver = () => {
  // 如果游戏已经结束，直接返回，防止重复执行
  if (GameState.isGameOver) {
    return false;
  }

  // 标记游戏结束状态
  GameState.isGameOver = true;

  // 停止背景音乐
  stopBGM();

  // 清除游戏主循环定时器
  cancelAnimationFrame(GameState.rafId);

  // 播放游戏结束音效
  Sounds.gameOver();

  // 保存最新最高分
  saveHighScore();

  // 延迟绘制游戏结束画面（保证画面更新完成）
  setTimeout(drawOver, 20);
};

export default gameOver;
