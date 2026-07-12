import isFunction from '@/lib/utils/types/is-function.js';

/**
 * ============================================================
 *
 * # 检测数据是否为 Object 类型
 *
 * ============================================================
 *
 * 判断值是否为非 null 的对象或函数。 函数被视为可调用对象（callable object），因此纳入判断范围。
 *
 * @function isObject
 * @param {null
 *   | undefined
 *   | string
 *   | boolean
 *   | Array
 *   | object
 *   | Function
 *   | symbol} o
 *   要检测的数据
 * @returns {boolean} 是 object 类型返回 true，否则返回 false
 */
const isObject = (o) => o !== null && (typeof o === 'object' || isFunction(o));

export default isObject;
