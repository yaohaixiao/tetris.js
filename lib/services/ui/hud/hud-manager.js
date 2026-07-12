import padStart from '@/lib/utils/string/pad-start.js';
import HudElements from '@/lib/services/ui/hud/hud-elements.js';

/**
 * ============================================================
 *
 * # 设置 DOM 元素的文本内容（支持补零）
 *
 * ============================================================
 *
 * @function setText
 * @param {HTMLElement | null} el - 目标 DOM 元素
 * @param {number | string} value - 要显示的数值
 * @param {number} [pad=0] - 左侧补零的长度. Default is `0`
 * @returns {string} 设置的文本内容
 */
const setText = (el, value, pad = 0) =>
  (el.textContent = pad ? padStart(value, pad) : String(value));

/**
 * ============================================================
 *
 * # 数值平滑动画
 *
 * ============================================================
 *
 * 每帧追赶目标值与当前显示值之间差距的 10%， 实现分数、最高分等数字的平滑滚动效果。
 *
 * ## 算法
 *
 * 1. 计算当前显示值与目标值的差值
 * 2. 每帧追赶上帧差值的 10%（最小步进为 1）
 * 3. 支持动画过程中目标值被动态更新
 *
 * @function animationScore
 * @param {object} tracker - 追踪器对象
 * @param {number} tracker.visual - 当前显示值
 * @param {number} tracker.target - 目标值
 * @param {HTMLElement} element - 目标 DOM 元素
 * @param {number} padding - 左侧补零长度
 * @returns {void}
 */
const animationScore = (tracker, element, padding) => {
  // 当前显示值已等于目标值，无需动画
  if (tracker.visual === tracker.target) {
    return;
  }

  const diff = tracker.target - tracker.visual;
  // 追赶剩余距离的 10%，最小步进为 1
  const step = Math.ceil(Math.abs(diff) * 0.1);

  if (diff > 0) {
    tracker.visual += step;
    // 防止过度追赶
    if (tracker.visual > tracker.target) {
      tracker.visual = tracker.target;
    }
  } else {
    tracker.visual -= step;
    // 防止过度追赶
    if (tracker.visual < tracker.target) {
      tracker.visual = tracker.target;
    }
  }

  // 更新 DOM 显示
  setText(element, tracker.visual, padding);
};

/**
 * ============================================================
 *
 * # 模块：HudManager HUD 管理器
 *
 * ============================================================
 *
 * 负责管理游戏界面中的数据显示和动画。 每个实例维护独立的追踪器和 DOM 元素引用， 支持多实例（如对战模式的双人 HUD）。
 *
 * ## 管理的显示项
 *
 * - 分数：带动画平滑过渡
 * - 最高分：带动画平滑过渡
 * - 行数：即时更新
 * - 等级：即时更新
 * - Combo：即时更新
 * - 控制者标识：显示 "HUMAN" 或 "AI"
 *
 * ## 设计特点
 *
 * - 分数动画：visual + target 分离设计，支持动画中目标值变化
 * - 即时更新：行数和等级变化立即生效，无需动画
 * - Reset 同步：重置时清空所有显示和内部状态
 * - 多实例安全：所有状态存储在实例属性中，不共享闭包变量
 *
 * @class HudManager
 */
class HudManager {
  /**
   * ## 创建 HUD 实例
   *
   * @param {object} options - HUD 各 DOM 元素和 Player 信息
   */
  constructor(options) {
    /**
     * HUD DOM 元素集合。
     *
     * @type {object}
     */
    this.elements = HudElements(options);

    /**
     * 分数追踪器。
     *
     * - Visual：当前显示值（动画中间值）
     * - Target：目标值（Store 中的实际分数）
     *
     * @type {{ visual: number; target: number }}
     */
    this.scoreTracker = { visual: 0, target: 0 };

    /**
     * 最高分追踪器。
     *
     * - Visual：当前显示值（动画中间值）
     * - Target：目标值（Store 中的实际最高分）
     *
     * @type {{ visual: number; target: number }}
     */
    this.highScoreTracker = { visual: 0, target: 0 };

    /**
     * 上次更新的值缓存。
     *
     * 用于判断是否需要更新 DOM，避免重复渲染。
     *
     * @type {{ lines: number; level: number; combo: number }}
     */
    this.prev = { lines: -1, level: -1, combo: -1 };
  }

  /**
   * ## update：更新 HUD 目标值
   *
   * 分数和最高分只更新 target（由 tick 驱动动画）， 行数和等级立即更新 DOM。
   *
   * @param {object} state - 游戏状态
   * @param {number} state.score - 当前分数
   * @param {number} state.highScore - 最高分
   * @param {number} state.lines - 消除行数
   * @param {number} state.level - 当前等级
   * @param {number} state.combo - 连续消减次数
   * @returns {void}
   */
  update(state) {
    const { elements, scoreTracker, highScoreTracker, prev } = this;

    // 更新追踪器目标值（不直接修改 DOM）
    scoreTracker.target = Number(state.score) || 0;
    highScoreTracker.target = Number(state.highScore) || 0;

    // 行数和等级：无动画，即时更新
    if (state.lines !== prev.lines) {
      setText(elements.lines, state.lines, 2);
      prev.lines = state.lines;
    }

    if (state.level !== prev.level) {
      setText(elements.level, state.level, 2);
      prev.level = state.level;
    }

    if (state.combo !== prev.combo) {
      setText(elements.combo, state.combo, 2);
      prev.combo = state.combo;
    }
  }

  /**
   * ## updateController：更新控制者标识
   *
   * @param {string} controller - 控制者身份（'human' 或 'ai'）
   * @returns {void}
   */
  updateController(controller) {
    setText(this.elements.controller, controller.toUpperCase());
  }

  /**
   * ## tick：每帧驱动动画
   *
   * 在游戏主循环中调用，更新分数和最高分的平滑动画。
   *
   * @returns {void}
   */
  tick() {
    const { elements, scoreTracker, highScoreTracker } = this;

    // 分别驱动分数和最高分的平滑动画
    animationScore(scoreTracker, elements.score, 5);
    animationScore(highScoreTracker, elements.highScore, 5);
  }

  /**
   * ## reset：重置 HUD 为初始状态
   *
   * 清空所有追踪器和 DOM 显示， 通常在返回主菜单或游戏重置时调用。
   *
   * @returns {void}
   */
  reset() {
    const { elements, scoreTracker, highScoreTracker, prev } = this;

    // 重置追踪器
    scoreTracker.visual = 0;
    scoreTracker.target = 0;

    highScoreTracker.visual = 0;
    highScoreTracker.target = 0;

    prev.lines = -1;
    prev.level = -1;
    prev.combo = -1;

    // 立即清空 DOM 显示
    setText(elements.score, 0, 5);
    setText(elements.highScore, 0, 5);
    setText(elements.lines, 0, 2);
    setText(elements.level, 1, 2);
    setText(elements.combo, 0, 2);
  }
}

export default HudManager;
