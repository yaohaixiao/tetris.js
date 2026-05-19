import padStart from '@/lib/utils/pad-start.js';

/**
 * # 设置 DOM 元素的文本内容（支持补零）
 *
 * @function setText
 * @param {HTMLElement | null} el - 目标 DOM 元素
 * @param {number | string} value - 要显示的数值
 * @param {number} [pad=0] - 左侧补零的长度（如 5 → "00005"）。默认值为 `0`. Default is `0`
 * @returns {string} 设置的文本内容
 */
const setText = (el, value, pad = 0) =>
  (el.textContent = pad ? padStart(value, pad) : String(value));

/**
 * # 数值平滑动画
 *
 * 每帧追赶目标值与当前显示值之间差距的 10%， 实现分数、最高分等数字的平滑滚动效果。
 *
 * ### 算法
 *
 * 1. 计算当前显示值与目标值的差值
 * 2. 每帧追赶上帧差值的 10%（最小步进为 1）
 * 3. 支持动画过程中目标值被动态更新
 *
 * @param {object} tracker - 追踪器对象
 * @param {number} tracker.visual - 当前显示值
 * @param {number} tracker.target - 目标值
 * @param {HTMLElement} element - 目标 DOM 元素
 * @param {number} padding - 左侧补零长度
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
 * # 创建 HUD 管理器
 *
 * 负责管理游戏界面中的数据显示和动画：
 *
 * - **分数**：带动画平滑过渡
 * - **最高分**：带动画平滑过渡
 * - **行数**：即时更新
 * - **等级**：即时更新
 * - **控制者标识**：显示 "HUMAN" 或 "AI"
 *
 * ## 设计特点
 *
 * - **分数动画**：使用 `visual` + `target` 分离设计，支持动画过程中目标值变化
 * - **即时更新**：行数和等级变化立即生效，无需动画
 * - **Reset 同步**：重置时清空所有显示和内部状态
 *
 * @function createHud
 * @param {object} HudElements - HUD 各 DOM 元素的集合
 * @param {HTMLElement} HudElements.score - 分数显示元素
 * @param {HTMLElement} HudElements.highScore - 最高分显示元素
 * @param {HTMLElement} HudElements.lines - 消除行数显示元素
 * @param {HTMLElement} HudElements.level - 等级显示元素
 * @param {HTMLElement} HudElements.controller - 控制者标识显示元素
 * @returns {object} HUD 管理对象，提供 `update`、`tick`、`reset`、`updateController` 方法
 */
const createHud = (HudElements) => {
  /**
   * ## 分数追踪器
   *
   * - `visual`：当前显示值（动画中间值）
   * - `target`：目标值（Store 中的实际分数）
   */
  const scoreTracker = { visual: 0, target: 0 };

  /**
   * ## 最高分追踪器
   *
   * - `visual`：当前显示值（动画中间值）
   * - `target`：目标值（Store 中的实际最高分）
   */
  const highScoreTracker = { visual: 0, target: 0 };

  /**
   * ## 上次更新的值缓存
   *
   * 用于判断是否需要更新 DOM（避免重复渲染）。
   */
  const prev = { lines: -1, level: -1 };

  return {
    /**
     * ## 更新 HUD 目标值
     *
     * 分数和最高分只更新 target（由 tick 驱动动画）， 行数和等级立即更新 DOM。
     *
     * @param {object} state - 游戏状态
     * @param {number} state.score - 当前分数
     * @param {number} state.highScore - 最高分
     * @param {number} state.lines - 消除行数
     * @param {number} state.level - 当前等级
     * @returns {void}
     */
    update: (state) => {
      // 更新两个追踪器的目标值（不直接修改 DOM）
      scoreTracker.target = Number(state.score) || 0;
      highScoreTracker.target = Number(state.highScore) || 0;

      // 行数和等级：无动画，即时更新
      if (state.lines !== prev.lines) {
        setText(HudElements.lines, state.lines, 2);
        prev.lines = state.lines;
      }

      if (state.level !== prev.level) {
        setText(HudElements.level, state.level, 2);
        prev.level = state.level;
      }
    },

    /**
     * ## 更新控制者标识
     *
     * @param {string} controller - 控制者身份（'human' 或 'ai'），会转为大写显示
     * @returns {void}
     */
    updateController(controller) {
      setText(HudElements.controller, controller.toUpperCase());
    },

    /**
     * ## 每帧驱动动画
     *
     * 在游戏主循环中调用，更新分数和最高分的平滑动画。
     *
     * @returns {void}
     */
    tick: () => {
      // 分别驱动分数和最高分的平滑动画
      animationScore(scoreTracker, HudElements.score, 5);
      animationScore(highScoreTracker, HudElements.highScore, 5);
    },

    /**
     * ## 重置 HUD 为初始状态
     *
     * 清空所有追踪器和 DOM 显示，通常在返回主菜单或游戏重置时调用。
     *
     * @returns {void}
     */
    reset: () => {
      // 重置追踪器
      scoreTracker.visual = 0;
      scoreTracker.target = 0;

      highScoreTracker.visual = 0;
      highScoreTracker.target = 0;

      prev.lines = -1;
      prev.level = -1;

      // 立即清空 DOM 显示
      setText(HudElements.score, 0, 5);
      setText(HudElements.highScore, 0, 5);
      setText(HudElements.lines, 0, 2);
      setText(HudElements.level, 1, 2);
    },
  };
};

export default createHud;
