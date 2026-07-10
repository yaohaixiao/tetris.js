import isObject from '@/lib/utils/types/is-object.js';

/**
 * # 检测数据是否为 HTMLElement DOM 节点
 *
 * @function isElement
 * @param {HTMLElement} o - HTML DOM 元素
 * @returns {boolean} - 是 HTMLElement，返回 true，否则返回 false
 */
const isElement = (o) =>
  !!(isObject(o) && o.nodeName && o.tagName && o.nodeType === 1);

export default isElement;
