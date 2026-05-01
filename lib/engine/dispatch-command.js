import MAIN_MENU_ACTIONS from '@/lib/engine/command/actions/main-menu-actions.js';
import GAME_PLAYING_ACTIONS from '@/lib/engine/command/actions/game-playing-actions.js';
import PAUSED_ACTIONS from '@/lib/engine/command/actions/paused-actions.js';
import GAME_OVER_ACTIONS from '@/lib/engine/command/actions/game-over-actions.js';

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
  playing: GAME_PLAYING_ACTIONS,
  paused: PAUSED_ACTIONS,
  'game-over': GAME_OVER_ACTIONS,
};

/**
 * # Command 分发器
 *
 * 将 Command 根据当前游戏状态（mode） 路由到对应 action handler 执行
 *
 * @param {object} cmd - 要执行的命令
 * @param {object} engine - 游戏引擎实例
 */
const dispatchCommand = (cmd, engine) => {
  const { type, payload } = cmd;
  const { Game } = engine;

  // 当前游戏状态（FSM state）
  const mode = Game.store.getMode();

  // 获取当前 mode 对应的 action 集合
  const actions = ACTIONS_MAP[mode];

  // 如果当前状态没有定义 actions，直接忽略
  if (!actions) {
    return;
  }

  // 根据 command type 找到对应 handler
  const handler = actions[type];

  // 执行 handler（如果存在）
  handler?.(payload, Game);
};

export default dispatchCommand;
