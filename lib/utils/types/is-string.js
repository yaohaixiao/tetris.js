/**
 * # 检测数据是否为 String 类型
 *
 * @function isString
 * @param {null
 *   | undefined
 *   | string
 *   | boolean
 *   | Array
 *   | object
 *   | Function
 *   | symbol} str
 *   - 检测数据
 *
 * @returns {boolean} - 是 string 类型，返回 true，否则返回 false
 */
const isString = (str) => typeof str === 'string';

export default isString;
