import hasOwn from '@/lib/utils/has-own.js';

/**
 * # 扩展对象
 *
 * 将 `source` 对象中的**自有属性**复制到 `origin` 对象上。 这是一个浅拷贝操作，会直接修改 `origin` 并返回。
 *
 * ## 与 Object.assign 的区别
 *
 * - 同样执行浅拷贝
 * - 额外通过 `hasOwn` 检查确保只复制自有属性（非原型链上的属性）
 *
 * ## 使用场景
 *
 * 用于配置合并、选项扩展等需要将一个对象的属性混入另一个对象的场景。
 *
 * @example
 *   const defaults = { a: 1, b: 2 };
 *   const options = { b: 3, c: 4 };
 *   extend(defaults, options);
 *   // defaults = { a: 1, b: 3, c: 4 }
 *
 * @function extend
 * @param {object} origin - 目标对象（会被直接修改）
 * @param {object} source - 来源对象（从中复制属性）
 * @returns {object} 扩展后的 `origin` 对象（支持链式调用）
 */
const extend = (origin, source) => {
  // 遍历 source 的所有可枚举属性
  for (const prop in source) {
    // 只复制自有属性，忽略原型链上的属性
    if (hasOwn(source, prop)) {
      origin[prop] = source[prop];
    }
  }

  return origin;
};

export default extend;
