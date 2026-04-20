import Engine from '@/lib/engine/engine.js';
import Sounds from '@/lib/audio/sounds.js';
import stopBGM from '@/lib/audio/stop-bgm.js';

/**
 * # 游戏结束处理函数
 *
 * 触发游戏结束状态，停止所有游戏逻辑、播放音效、保存分数、显示结束画面 防止重复调用，确保只执行一次结束流程
 *
 * @function gameOver
 * @returns {boolean | undefined} 已结束时返回 false，避免重复执行
 */
const gameOver = () => {
  const mode = Engine.getMode();

  // 如果游戏已经结束，直接返回，防止重复执行
  if (mode === 'game-over' || mode === 'paused' || mode === 'main-menu') {
    return false;
  }

  // 标记游戏结束状态
  Engine.setMode('game-over');
  // 保存最新最高分
  Engine.saveHighScore();

  // 停止背景音乐
  stopBGM();
  // 播放游戏结束音效
  Sounds.gameOver();
};

export default gameOver;
