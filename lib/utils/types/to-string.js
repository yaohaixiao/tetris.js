/**
 * ============================================================
 *
 * # Object 对象原型上的 toString 方法
 *
 * ============================================================
 *
 * 对任意值调用 Object.prototype.toString， 返回精确的类型字符串（如 [object Array]）。
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
 *   要检测的数据
 * @returns {string} 检测数据的类型字符串
 */
const toString = (val) => Object.prototype.toString.apply(val);

export default toString;
