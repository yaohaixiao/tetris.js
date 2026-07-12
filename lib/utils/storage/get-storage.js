/**
 * ============================================================
 *
 * # 从本地存储读取数据
 *
 * ============================================================
 *
 * 对 localStorage.getItem 的简单封装， 用于读取持久化的游戏数据（如最高分）。
 *
 * ## 示例
 *
 * ```javascript
 * const highScore = getStorage('tetris-high-score');
 * // highScore = "9999" 或 null
 * ```
 *
 * @function getStorage
 * @param {string} key - 存储的键名
 * @returns {string | null} 存储的字符串值，不存在时返回 null
 */
const getStorage = (key) => localStorage.getItem(key);

export default getStorage;
