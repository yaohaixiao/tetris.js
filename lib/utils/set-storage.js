/**
 * # 使用本地存贮保存数据
 *
 * @function setStorage
 * @param {string} key - 存储的关键字
 * @param {string} value - 存储的（字符串）值
 * @returns {void}
 */
const setStorage = (key, value) => {
  localStorage.setItem(key, value);
};

export default setStorage;
