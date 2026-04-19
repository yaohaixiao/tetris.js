import EngineState from '@/lib/engine/state/engine-state.js';
import getStorage from '@/lib/utils/get-storage.js';

/**
 * # 从本地存储加载历史最高分
 *
 * 读取 localStorage 中的 tetris-high-score，转为数字并赋值给游戏状态 若无数据则默认设置为 0
 *
 * @function loadHighScore
 * @returns {void}
 */
const loadHighScore = () => {
  // 从本地存储读取最高分，转为十进制数字，无数据时默认为 0
  EngineState.highScore =
    Number.parseInt(getStorage('tetris-high-score'), 10) || 0;
};

export default loadHighScore;
