import isString from '@/lib/utils/is-string.js';
import isSymbol from '@/lib/utils/is-symbol.js';

/**
 * # 检测对象自身属性中是否具有指定的属性。
 *
 * @function hasOwn
 * @param {object} obj - （必须）检测的目标对象
 * @param {string | symbol} prop - （必须）属性名
 * @returns {boolean} - 检测对象包含指定属性名，返回 true，否则返回 false
 */
const hasOwn = (obj, prop) => {
  if (obj === null || obj === undefined) {
    return false;
  }

  if (!isString(prop) && !isSymbol(prop)) {
    return false;
  }

  const { hasOwnProperty } = Object.prototype;
  return hasOwnProperty.call(obj, prop);
};

export default hasOwn;
