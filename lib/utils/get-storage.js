/**
 * # 使用本地存贮保存数据
 *
 * @function getStorage
 * @param {string} key - 存储的关键字
 * @returns {string} - 获取本地保存的关键字为 key 的数据
 */
const getStorage = (key) => localStorage.getItem(key);

export default getStorage;
