import isObject from '@/lib/utils/types/is-object.js';

/**
 * ============================================================
 *
 * # 检测数据是否为 HTMLElement DOM 节点
 *
 * ============================================================
 *
 * 通过检查 nodeName、tagName、nodeType === 1 三个特征属性， 判断传入对象是否为有效的 HTML DOM 元素节点。
 *
 * @function isElement
 * @param {HTMLElement} o - HTML DOM 元素
 * @returns {boolean} 是 HTMLElement 返回 true，否则返回 false
 */
const isElement = (o) =>
  !!(isObject(o) && o.nodeName && o.tagName && o.nodeType === 1);

export default isElement;
