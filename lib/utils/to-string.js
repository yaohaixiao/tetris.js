/**
 * # Object 对象原型上的 toString 方法
 *
 * @function toString
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
 * @returns {string} - 返回检测数据的类型字符串
 */
const toString = (val) => Object.prototype.toString.apply(val);

export default toString;
