/**
 * # 将数据保存到本地存储
 *
 * 对 `localStorage.setItem` 的简单封装， 用于持久化游戏数据（如最高分）。
 *
 * @example
 *   setStorage('tetris-high-score', '9999');
 *
 * @function setStorage
 * @param {string} key - 存储的键名
 * @param {string} value - 要存储的字符串值
 * @returns {void}
 */
const setStorage = (key, value) => {
  localStorage.setItem(key, value);
};

export default setStorage;
