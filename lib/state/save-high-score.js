import GameState from './game-state.js';
import setStorage from '../utils/set-storage.js';

/**
 * # 保存最高分到本地存储
 *
 * 判断当前得分是否大于历史最高分，若是则更新并保存到 localStorage
 *
 * @function loadHighScore
 * @returns {void}
 */
const saveHighScore = () => {
  const { score } = GameState;

  // 仅当当前得分超过历史最高分才执行保存
  if (score > GameState.highScore) {
    // 更新游戏状态中的最高分
    GameState.highScore = score;
    // 保存到浏览器本地存储，持久化记录
    setStorage('tetris-high-score', GameState.highScore.toString());
  }
};

export default saveHighScore;
