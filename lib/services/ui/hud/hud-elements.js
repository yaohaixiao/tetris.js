/**
 * # HUD DOM 引用集合
 *
 * 用于缓存游戏界面中 HUD（分数、行数、等级、最高分）相关的 DOM 节点， 避免在每次更新时重复执行
 * `document.querySelector`，提升性能。
 *
 * 要求：
 *
 * - 对应的 DOM 元素必须在脚本执行前已存在（建议在 DOMContentLoaded 之后初始化）
 * - 若元素不存在，对应字段将为 `null`，调用方需自行保证安全性
 *
 * @typedef {object} HudDomType
 * @property {HTMLElement | null} controller - 分数显示元素（#controller）
 * @property {HTMLElement | null} score - 分数显示元素（#score）
 * @property {HTMLElement | null} lines - 消除行数显示元素（#lines）
 * @property {HTMLElement | null} level - 当前等级显示元素（#level）
 * @property {HTMLElement | null} combo - Combo 连续消减显示元素（#combo）
 * @property {HTMLElement | null} highScore - 最高分显示元素（#highScore）
 */

/**
 * HUD DOM 节点缓存对象
 *
 * @function HudElements
 * @param {object} options - 参数对象
 * @returns {HudDomType} - 返回显示 Hud 信息的 DOM 元素
 */
const HudElements = (options) => {
  const { controller, score, lines, level, combo, highScore } = options;

  return {
    /** @type {HTMLElement | null} 分数显示元素 */
    controller: document.querySelector(`#${controller}`),

    /** @type {HTMLElement | null} 分数显示元素 */
    score: document.querySelector(`#${score}`),

    /** @type {HTMLElement | null} 行数显示元素 */
    lines: document.querySelector(`#${lines}`),

    /** @type {HTMLElement | null} 等级显示元素 */
    level: document.querySelector(`#${level}`),

    /** @type {HTMLElement | null} 连续消减显示元素 */
    combo: document.querySelector(`#${combo}`),

    /** @type {HTMLElement | null} 最高分显示元素 */
    highScore: document.querySelector(`#${highScore}`),
  };
};

export default HudElements;
