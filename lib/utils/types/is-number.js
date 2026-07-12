/**
 * ============================================================
 *
 * # 检测数据是否为有效的 Number 类型
 *
 * ============================================================
 *
 * 比 typeof === 'number' 更严格，排除 NaN 和 Infinity。
 *
 * ## 示例
 *
 * ```javascript
 * isNumber(123); // true
 * isNumber(NaN); // false
 * isNumber(Infinity); // false
 * isNumber('123'); // false
 * isNumber(null); // false
 * isNumber(undefined); // false
 * isNumber({}); // false
 * ```
 *
 * @function isNumber
 * @param {null
 *   | undefined
 *   | string
 *   | boolean
 *   | Array
 *   | object
 *   | Function
 *   | symbol} value
 *   要检测的数据
 * @returns {boolean} 是有效数字返回 true，否则返回 false
 */
const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

export default isNumber;
