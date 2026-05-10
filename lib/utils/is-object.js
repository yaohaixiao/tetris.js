import isFunction from '@/lib/utils/is-function.js';

/**
 * # 检测数据是否为 Object 类型
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
 *   - 检测数据
 *
 * @returns {boolean} - 是 object 类型，返回 true，否则返回 false
 */
const isObject = (o) => o !== null && (typeof o === 'object' || isFunction(o));

export default isObject;
