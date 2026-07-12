/**
 * ============================================================
 *
 * # 判断一个值是否为函数（兼容所有函数类型）
 *
 * ============================================================
 *
 * 通过 typeof 与 Object.prototype.toString 双重检测， 兼容普通函数、箭头函数、异步函数、生成器函数、类、 DOM
 * 方法及特殊环境下 typeof 误判为 object 的函数。
 *
 * @function isFunction
 * @param {null
 *   | undefined
 *   | string
 *   | boolean
 *   | Array
 *   | object
 *   | Function
 *   | symbol} val
 *   要判断的值
 * @returns {boolean} 是函数返回 true，否则返回 false
 */
const isFunction = (val) => {
  // 排除 null/undefined 及非函数非对象类型
  if (val == null || (typeof val !== 'function' && typeof val !== 'object')) {
    return false;
  }

  /**
   * 核心判断：通过原型链和内部属性区分函数与其他对象
   *
   * 1. 普通函数/箭头函数/异步函数/生成器函数： typeof 为 function
   * 2. DOM 方法（如 document.createElement）： typeof 为 function
   * 3. 类（class）： typeof 为 function，实例化需 new，仍属函数类型
   * 4. 特殊环境兜底： Object.prototype.toString 检测 [object Function]
   */
  return (
    typeof val === 'function' ||
    Object.prototype.toString.call(val) === '[object Function]'
  );
};

export default isFunction;
