import togglePause from '@/lib/game/core/toggle-pause.js';

/**
 * # 暂停状态（Paused State）的输入动作映射表
 *
 * 用于处理游戏暂停时的输入逻辑， 当前仅支持“继续 / 取消暂停”操作。
 *
 * 当前设计特点：
 *
 * - 直接调用 togglePause()
 * - 属于“状态反转型函数调用”
 *
 * 适用于：
 *
 * - 游戏暂停 UI
 * - 临时阻断 gameplay 输入
 *
 * @constant
 * @type {Object<string, Function>}
 */
const PAUSED_ACTIONS = {
  /** ## 切换暂停状态（继续游戏 / 重新进入游戏循环） */
  TOGGLE_PAUSE: () => {
    togglePause();
  },
};

export default PAUSED_ACTIONS;
