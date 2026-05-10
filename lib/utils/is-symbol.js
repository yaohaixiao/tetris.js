/**
 * # 检测数据是否为 Symbol 类型
 *
 * @function isSymbol
 * @param {null
 *   | undefined
 *   | string
 *   | boolean
 *   | Array
 *   | object
 *   | Function
 *   | symbol} val
 *   - 检测数据
 *
 * @returns {boolean} - 是 symbol 类型，返回 true，否则返回 false
 */
const isSymbol = (val) => typeof val === 'symbol';

export default isSymbol;
