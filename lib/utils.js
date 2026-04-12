import { gameState } from './state.js';

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
export const getStorage = (key) => {
  return localStorage.getItem(key);
};
