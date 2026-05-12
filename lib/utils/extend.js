import hasOwn from '@/lib/utils/has-own.js';

/**
 * # 扩展对象
 *
 * 将 source 对象中的属性扩展到 origin 对象上
 *
 * @function extend
 * @param {object} origin - 原始对象
 * @param {object} source - 来源对象
 * @returns {object} - 返回扩展后的 origin 对象
 */
const extend = (origin, source) => {
  for (const prop in source) {
    if (hasOwn(source, prop)) {
      origin[prop] = source[prop];
    }
  }

  return origin;
};

export default extend;
