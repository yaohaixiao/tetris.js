import padStart from '@/lib/utils/pad-start.js';

/**
 * # 设置文本内容（支持补零）
 *
 * @function setText
 * @param {HTMLElement | null} el - 目标 DOM 元素
 * @param {number | string} value - 要显示的数值
 * @param {number} [pad=0] - 左侧补零长度（如 5 → 00001）. Default is `0`
 * @returns {string} - 返回字符串
 */
const setText = (el, value, pad = 0) =>
  (el.textContent = pad ? padStart(value, pad) : String(value));

// 通用的数值追赶逻辑
const animationScore = (tracker, element, padding) => {
  if (tracker.visual === tracker.target) {
    return;
  }

  const diff = tracker.target - tracker.visual;
  // 追赶剩余距离的 10%，最小步进 1
  const step = Math.ceil(Math.abs(diff) * 0.1);

  if (diff > 0) {
    tracker.visual += step;

    if (tracker.visual > tracker.target) {
      tracker.visual = tracker.target;
    }
  } else {
    tracker.visual -= step;

    if (tracker.visual < tracker.target) {
      tracker.visual = tracker.target;
    }
  }

  setText(element, tracker.visual, padding);
};

/**
 * # 创建 HUD 管理器
 *
 * 负责管理游戏界面中的：
 *
 * - 分数（带动画）
 * - 行数
 * - 等级
 * - 最高分
 *
 * 特点：
 *
 * - 分数支持平滑动画（支持动画过程中目标值变化）
 * - 使用 prev + target 分离，避免状态错乱
 * - Reset 时同步 UI 与内部状态
 *
 * @function createHud
 * @param {object} HudElements - 显示 Hud 信息的 DOM 元素
 * @returns {object} - 返回对外暴露的工具对象
 */
const createHud = (HudElements) => {
  // 定义两个追踪器：一个给当前分，一个给最高分
  const scoreTracker = { visual: 0, target: 0 };
  const highScoreTracker = { visual: 0, target: 0 };

  const prev = { lines: -1, level: -1 };

  return {
    update: (state) => {
      // 更新两个追踪器的目标值
      scoreTracker.target = Number(state.score) || 0;
      highScoreTracker.target = Number(state.highScore) || 0;

      // 静态属性即时更新
      if (state.lines !== prev.lines) {
        setText(HudElements.lines, state.lines, 2);
        prev.lines = state.lines;
      }

      if (state.level !== prev.level) {
        setText(HudElements.level, state.level, 2);
        prev.level = state.level;
      }
    },

    tick: () => {
      // 每帧分别驱动两个动画
      animationScore(scoreTracker, HudElements.score, 5);
      animationScore(highScoreTracker, HudElements.highScore, 5);
    },

    reset: () => {
      scoreTracker.visual = 0;
      scoreTracker.target = 0;

      highScoreTracker.visual = 0;
      highScoreTracker.target = 0;

      prev.lines = -1;
      prev.level = -1;

      // 重置时立刻清空 DOM
      setText(HudElements.score, 0, 5);
      setText(HudElements.highScore, 0, 5);
      setText(HudElements.lines, 0, 2);
      setText(HudElements.level, 1, 2);
    },
  };
};

export default createHud;
