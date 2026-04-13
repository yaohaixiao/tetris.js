/**
 * # 数字补零工具函数
 *
 * 将数字转换为字符串并在左侧补 0，使其达到指定长度
 *
 * @function pad
 * @param {number} n - 需要补零的原始数字
 * @param {number} len - 补零后目标字符串长度
 * @returns {string} - 补零后的固定长度字符串
 */
export const pad = (n, len) => n.toString().padStart(len, '0');

export const formatTime = (date, format = 'yyyy-MM-dd HH:mm:ss') => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const toSymbol = () => (hours > 12 ? 'PM' : 'AM');
  const hasSymbol = format.includes('a');
  const symbols = {
    yyyy: year,
    MM: pad(month, 2),
    dd: pad(day, 2),
    HH: pad(hours, 2),
    hh: hasSymbol && hours > 12 ? hours - 12 : hours,
    mm: pad(minutes, 2),
    ss: pad(seconds, 2),
    // a 表示12小时制
    a: toSymbol(),
  };
  let time = format;

  for (const key of Object.keys(symbols)) {
    time = time.replace(key, symbols[key]);
  }

  return time;
};

/**
 * # 使用本地存贮保存数据
 *
 * @function setStorage
 * @param {string} key - 存储的关键字
 * @param {string} value - 存储的（字符串）值
 * @returns {void}
 */
export const setStorage = (key, value) => {
  localStorage.setItem(key, value);
};

/**
 * # 使用本地存贮保存数据
 *
 * @function getStorage
 * @param {string} key - 存储的关键字
 * @returns {string} - 获取本地保存的关键字为 key 的数据
 */
export const getStorage = (key) => localStorage.getItem(key);
