import EngineState from '@/lib/engine/state/engine-state.js';

/**
 * # 所有合法的游戏模式（FSM 状态集合）
 *
 * 使用 Set 做快速校验，避免无效字符串进入系统。
 *
 * 可选值：
 *
 * - 'main-menu' : 主菜单
 * - 'playing' : 游戏进行中
 * - 'paused' : 暂停状态
 * - 'game-over' : 游戏结束
 *
 * @type {Set<string>}
 */
const MODES = new Set(['main-menu', 'playing', 'paused', 'game-over']);

/**
 * # 设置当前游戏模式（状态机切换入口）
 *
 * 功能：
 *
 * 1. 校验 mode 是否合法
 * 2. 避免重复设置相同 mode（减少无意义更新）
 * 3. 更新 EngineState 中的 mode
 *
 * @param {string} mode - 目标模式（必须在 MODES 集合中）
 * @returns {void}
 */
const setMode = (mode) => {
  // 1. 校验 mode 是否合法，同时避免重复设置相同状态
  if (!MODES.has(mode) || EngineState.mode === mode) {
    return;
  }

  // 2. 更新当前游戏模式
  EngineState.mode = mode;
};

export default setMode;
