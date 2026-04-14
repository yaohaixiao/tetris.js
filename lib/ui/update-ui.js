import pad from '../utils/pad.js';

/**
 * # 更新游戏界面上的所有 UI 分数信息
 *
 * 将分数、行数、等级、最高分格式化后渲染到对应 DOM 元素
 *
 * @function updateUI
 * @param {number} score - 当前游戏得分
 * @param {number} lines - 当前消除行数
 * @param {number} level - 当前游戏等级
 * @param {number} highScore - 历史最高得分
 * @returns {void}
 */
const updateUI = (score, lines, level, highScore) => {
  // 更新当前得分（固定 5 位，左侧补零）
  document.querySelector('#score').textContent = pad(score, 5);
  // 更新消除行数（固定 2 位，左侧补零）
  document.querySelector('#lines').textContent = pad(lines, 2);
  // 更新当前等级（固定 2 位，左侧补零）
  document.querySelector('#level').textContent = pad(level, 2);
  // 更新历史最高分（固定 5 位，左侧补零）
  document.querySelector('#highScore').textContent = pad(highScore, 5);
};

export default updateUI;
