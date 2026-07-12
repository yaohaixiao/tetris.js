/**
 * HUD DOM 节点类型定义。
 *
 * @typedef {object} HudDomType
 * @property {HTMLElement | null} controller - 控制者显示元素
 * @property {HTMLElement | null} score - 分数显示元素
 * @property {HTMLElement | null} lines - 消除行数显示元素
 * @property {HTMLElement | null} level - 当前等级显示元素
 * @property {HTMLElement | null} combo - 连续消减显示元素
 * @property {HTMLElement | null} highScore - 最高分显示元素
 */

/**
 * ============================================================
 *
 * # HUD DOM 引用集合
 *
 * ============================================================
 *
 * 缓存游戏界面中 HUD 相关的 DOM 节点， 避免每次更新时重复执行 document.querySelector。
 *
 * ## 要求
 *
 * - 对应的 DOM 元素必须在脚本执行前已存在
 * - 若元素不存在，对应字段将为 null，调用方需自行保证安全性
 *
 * @function HudElements
 * @param {object} options - 参数对象
 * @param {object} options.Hud - HUD 元素 ID 配置
 * @param {object} options.Player - 玩家信息
 * @param {string} options.Player.name - 玩家名称
 * @param {number} options.Player.index - 玩家索引
 * @returns {HudDomType} HUD DOM 元素集合
 */
const HudElements = (options) => {
  const { Hud, Player } = options;
  const { controller, score, lines, level, combo, highScore } = Hud;
  const { name, index } = Player;

  return {
    /** @type {HTMLElement | null} 控制者显示元素 */
    controller: document.querySelector(`#${name}-${index}-${controller}`),

    /** @type {HTMLElement | null} 分数显示元素 */
    score: document.querySelector(`#${name}-${index}-${score}`),

    /** @type {HTMLElement | null} 行数显示元素 */
    lines: document.querySelector(`#${name}-${index}-${lines}`),

    /** @type {HTMLElement | null} 等级显示元素 */
    level: document.querySelector(`#${name}-${index}-${level}`),

    /** @type {HTMLElement | null} 连续消减显示元素 */
    combo: document.querySelector(`#${name}-${index}-${combo}`),

    /** @type {HTMLElement | null} 最高分显示元素 */
    highScore: document.querySelector(`#${name}-${index}-${highScore}`),
  };
};

export default HudElements;
