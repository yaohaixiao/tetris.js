import MAIN_MENU_ACTIONS from '@/lib/game/actions/main-menu-actions.js';
import DIFFICULT_ACTIONS from '@/lib/game/actions/difficulty-actions.js';
import GAME_PLAYING_ACTIONS from '@/lib/game/actions/game-playing-actions.js';
import PAUSED_ACTIONS from '@/lib/game/actions/paused-actions.js';
import GAME_OVER_ACTIONS from '@/lib/game/actions/game-over-actions.js';
import REPLAY_ACTIONS from '@/lib/game/actions/replay-actions.js';

/**
 * # 状态 -> Action 映射表
 *
 * 根据 engine 当前 mode，选择不同的 action handler 集合
 *
 * 设计模式：
 *
 * - State Machine Router
 * - Command Dispatcher
 *
 * 核心职责：
 *
 * - 不执行逻辑
 * - 只负责“路由 + 分发”
 */
const ACTIONS_MAP = {
  'main-menu': MAIN_MENU_ACTIONS,
  difficulty: DIFFICULT_ACTIONS,
  playing: GAME_PLAYING_ACTIONS,
  paused: PAUSED_ACTIONS,
  'game-over': GAME_OVER_ACTIONS,
  replay: REPLAY_ACTIONS,
};

/**
 * # Command 分发器
 *
 * 将 Command 根据当前游戏状态（mode） 路由到对应 action handler 执行
 *
 * @param {object} cmd - 要执行的命令
 * @param {string} mode - 游戏当前模式
 */
const dispatchCommand = (cmd, mode) => {
  const { action, payload } = cmd;

  // 获取当前 mode 对应的 action 集合
  const actions = ACTIONS_MAP[mode];

  // 如果当前状态没有定义 actions，直接忽略
  if (!actions) {
    return;
  }

  // 根据 command action 找到对应 handler
  const handler = actions[action];

  // 执行 handler（如果存在）
  handler?.(payload);
};

export default dispatchCommand;
