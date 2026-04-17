import padStart from '../../utils/pad-start.js';
import HudDom from './hud-dom.js';
import animateHUDNumber from './animate-hud-number.js';

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
 * @returns {object} - 返回对外暴露的工具对象
 */
const createHud = () => {
  // 上一次已确认的显示状态（动画完成后的最终值）
  const prev = {
    score: 0,
    lines: 0,
    level: 1,
    highScore: 0,
  };

  // 当前目标值（用于动画追踪）
  const target = {
    score: 0,
  };

  // 当前动画状态
  const animating = {
    score: false,
  };

  /**
   * # 更新分数（带动画）
   *
   * 支持：
   *
   * - 动画过程中目标值变化（不会丢更新）
   * - 自动衔接下一段动画
   *
   * @function updateScore
   * @param {number} next - 新的分数值
   * @returns {void}
   */
  const updateScore = (next) => {
    target.score = next;

    // 如果动画正在进行 → 等当前动画结束后再处理
    if (animating.score) return;

    animating.score = true;

    animateHUDNumber(
      prev.score,
      target.score,
      300,
      // 每帧更新 UI
      (v) => {
        setText(HudDom.score, v, 5);
      },
      // 动画结束回调
      () => {
        prev.score = target.score;

        animating.score = false;

        if (prev.score !== target.score) {
          updateScore(target.score);
        }
      },
    );
  };

  /**
   * # 更新行数（无动画）
   *
   * @function updateLines
   * @param {number} next - 新的行数
   * @returns {void}
   */
  const updateLines = (next) => {
    if (next !== prev.lines) {
      setText(HudDom.lines, next, 2);
      prev.lines = next;
    }
  };

  /**
   * # 更新等级（无动画）
   *
   * @function updateLevel
   * @param {number} next - 新的等级
   * @returns {void}
   */
  const updateLevel = (next) => {
    if (next === prev.level) {
      return;
    }

    setText(HudDom.level, next, 2);
    prev.level = next;
  };

  /**
   * # 更新最高分（无动画）
   *
   * @function updateHighScore
   * @param {number} next - 新的最高分
   * @returns {void}
   */
  const updateHighScore = (next) => {
    if (next !== prev.highScore) {
      setText(HudDom.highScore, next, 5);
      prev.highScore = next;
    }
  };

  /**
   * # 更新 HUD 显示
   *
   * 根据游戏状态刷新所有 HUD 数据
   *
   * @function update
   * @param {{
   *   score: number;
   *   lines: number;
   *   level: number;
   *   highScore: number;
   * }} state
   *   - 当前游戏状态
   *
   * @returns {void}
   */
  const update = (state) => {
    updateScore(state.score);
    updateLines(state.lines);
    updateLevel(state.level);
    updateHighScore(state.highScore);
  };

  /**
   * # 重置 HUD
   *
   * 用于：
   *
   * - 游戏重新开始
   * - 游戏结束后清空 UI
   *
   * 同时重置：
   *
   * - 内部状态（prev / animating）
   * - DOM 显示
   *
   * @function reset
   * @returns {void}
   */
  const reset = () => {
    prev.score = prev.lines = prev.level = prev.highScore = 0;
    animating.score = false;

    setText(HudDom.score, 0, 5);
    setText(HudDom.lines, 0, 2);
    setText(HudDom.level, 1, 2);
    setText(HudDom.highScore, 0, 5);
  };

  return {
    update,
    reset,
  };
};

export default createHud;
