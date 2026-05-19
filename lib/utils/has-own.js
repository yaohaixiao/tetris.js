import isString from '@/lib/utils/is-string.js';
import isSymbol from '@/lib/utils/is-symbol.js';

/**
 * # 检测对象自身属性中是否具有指定的属性
 *
 * 使用 `Object.prototype.hasOwnProperty` 进行安全的属性检测， 仅检查对象自身的属性，不检查原型链。
 *
 * ## 边界处理
 *
 * - `obj` 为 `null` 或 `undefined` 时返回 `false`
 * - `prop` 不是字符串或 Symbol 时返回 `false`
 *
 * @example
 *   const obj = { a: 1 };
 *   hasOwn(obj, 'a'); // true
 *   hasOwn(obj, 'toString'); // false（原型链属性）
 *   hasOwn(null, 'a'); // false
 *
 * @function hasOwn
 * @param {object} obj - 要检测的目标对象
 * @param {string | symbol} prop - 属性名
 * @returns {boolean} 对象自身包含指定属性时返回 `true`，否则返回 `false`
 */
const hasOwn = (obj, prop) => {
  // 空值保护
  if (obj === null || obj === undefined) {
    return false;
  }

  // 属性名类型校验
  if (!isString(prop) && !isSymbol(prop)) {
    return false;
  }

  // 使用原型方法进行安全检测
  const { hasOwnProperty } = Object.prototype;
  return hasOwnProperty.call(obj, prop);
};

export default hasOwn;
