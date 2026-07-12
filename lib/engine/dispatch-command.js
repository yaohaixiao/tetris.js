import GAME_MODE_ACTIONS from '@/lib/game/actions/game-mode-actions.js';
import BATTLE_MODE_ACTIONS from '@/lib/game/actions/battle-mode-actions.js';
import MAIN_MENU_ACTIONS from '@/lib/game/actions/main-menu-actions.js';
import DIFFICULT_ACTIONS from '@/lib/game/actions/difficulty-actions.js';
import GAME_PLAYING_ACTIONS from '@/lib/game/actions/game-playing-actions.js';
import PAUSED_ACTIONS from '@/lib/game/actions/paused-actions.js';
import GAME_OVER_ACTIONS from '@/lib/game/actions/game-over-actions.js';
import REPLAY_ACTIONS from '@/lib/game/actions/replay-actions.js';
import BATTLE_OVER_ACTIONS from '@/lib/game/actions/battle-over-actions.js';
import EXIT_GAME_ACTIONS from '@/lib/game/actions/exit-game-actions.js';

/**
 * ============================================================
 *
 * # 状态 → Action 映射表
 *
 * ============================================================
 *
 * 将游戏的每种模式（mode）映射到对应的 action handler 集合。 这是状态机路由的核心：根据当前游戏状态决定哪些操作是合法的。
 *
 * ## 模式与 Action 集合对应关系
 *
 * | mode        | Action 集合          | 说明                              |
 * | :---------- | :------------------- | :-------------------------------- |
 * | game-mode   | GAME_MODE_ACTIONS    | 游戏模式选择：单人/对战           |
 * | battle-mode | BATTLE_MODE_ACTIONS  | 对战类型选择：VS AI / VS HUMAN    |
 * | main-menu   | MAIN_MENU_ACTIONS    | 主菜单：等级选择                  |
 * | difficulty  | DIFFICULT_ACTIONS    | 难度选择：easy/normal/hard/expert |
 * | playing     | GAME_PLAYING_ACTIONS | 游戏中：移动、旋转、硬降等        |
 * | paused      | PAUSED_ACTIONS       | 暂停中：继续、重新开始、退出      |
 * | exit-game   | EXIT_GAME_ACTIONS    | 退出菜单：继续游戏、退出游戏      |
 * | game-over   | GAME_OVER_ACTIONS    | 游戏结束：重新开始、退出          |
 * | replay      | REPLAY_ACTIONS       | 回放中：观看、确认退出            |
 * | battle-over | BATTLE_OVER_ACTIONS  | 对战结束：对战重新开始            |
 *
 * @constant {object} ACTIONS_MAP
 */
const ACTIONS_MAP = {
  'game-mode': GAME_MODE_ACTIONS,
  'battle-mode': BATTLE_MODE_ACTIONS,
  'main-menu': MAIN_MENU_ACTIONS,
  difficulty: DIFFICULT_ACTIONS,
  playing: GAME_PLAYING_ACTIONS,
  paused: PAUSED_ACTIONS,
  replay: REPLAY_ACTIONS,
  'game-over': GAME_OVER_ACTIONS,
  'battle-over': BATTLE_OVER_ACTIONS,
  'exit-game': EXIT_GAME_ACTIONS,
};

/**
 * ============================================================
 *
 * # Command 分发器
 *
 * ============================================================
 *
 * 将 Command 根据当前游戏状态（mode）路由到对应的 action handler 执行。
 *
 * ## 核心职责
 *
 * - 不执行业务逻辑：只负责路由 + 分发
 * - 状态隔离：不同 mode 下同名 action 可以有不同的行为
 *
 * ## 执行流程
 *
 * 1. 从 Command 中提取 action 和 payload
 * 2. 根据 mode 查找对应的 action handler 集合
 * 3. 根据 action 名称找到对应的 handler 并调用
 *
 * @function dispatchCommand
 * @param {object} cmd - 要执行的命令
 * @param {string} cmd.action - 动作名称
 * @param {object} cmd.payload - 命令负载
 * @param {object} options - 扩展参数对象
 * @param {string} options.mode - 当前游戏模式，用于路由
 * @returns {void}
 */
const dispatchCommand = (cmd, options) => {
  const { mode } = options;
  const { action, payload } = cmd;

  // 获取当前 mode 对应的 action 集合
  const actions = ACTIONS_MAP[mode];

  if (!actions) {
    return;
  }

  // 根据 action 名称找到 handler 并执行
  const handler = actions[action];
  handler?.(payload);
};

export default dispatchCommand;
