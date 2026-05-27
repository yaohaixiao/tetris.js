import MAIN_MENU_ACTIONS from '@/lib/game/actions/main-menu-actions.js';
import DIFFICULT_ACTIONS from '@/lib/game/actions/difficulty-actions.js';
import GAME_PLAYING_ACTIONS from '@/lib/game/actions/game-playing-actions.js';
import PAUSED_ACTIONS from '@/lib/game/actions/paused-actions.js';
import GAME_OVER_ACTIONS from '@/lib/game/actions/game-over-actions.js';
import REPLAY_ACTIONS from '@/lib/game/actions/replay-actions.js';

/**
 * # 状态 → Action 映射表
 *
 * 将游戏的每种模式（mode）映射到对应的 action handler 集合。 这是**状态机路由**的核心：根据当前游戏状态决定哪些操作是合法的。
 *
 * ## 设计模式
 *
 * - **State Machine Router**：mode 决定合法操作集
 * - **Command Dispatcher**：action 名称决定具体执行哪个 handler
 *
 * ## 模式与 Action 集合对应关系
 *
 * | mode         | Action 集合          | 说明                              |
 * | ------------ | -------------------- | --------------------------------- |
 * | `main-menu`  | MAIN_MENU_ACTIONS    | 主菜单：等级选择                  |
 * | `difficulty` | DIFFICULT_ACTIONS    | 难度选择：easy/normal/hard/expert |
 * | `playing`    | GAME_PLAYING_ACTIONS | 游戏中：移动、旋转、硬降等        |
 * | `paused`     | PAUSED_ACTIONS       | 暂停中：继续、重新开始、退出      |
 * | `replay`     | REPLAY_ACTIONS       | 回放中：观看、确认退出            |
 * | `game-over`  | GAME_OVER_ACTIONS    | 游戏结束：重新开始、退出          |
 *
 * @constant {object} ACTIONS_MAP
 */
const ACTIONS_MAP = {
  'main-menu': MAIN_MENU_ACTIONS,
  difficulty: DIFFICULT_ACTIONS,
  playing: GAME_PLAYING_ACTIONS,
  paused: PAUSED_ACTIONS,
  replay: REPLAY_ACTIONS,
  'game-over': GAME_OVER_ACTIONS,
};

/**
 * # Command 分发器（Dispatch Command）
 *
 * 将 Command 根据当前游戏状态（mode）路由到对应的 action handler 执行。
 *
 * ## 核心职责
 *
 * - **不执行业务逻辑**：dispatchCommand 自身不包含任何游戏操作逻辑
 * - **只负责路由 + 分发**：根据 mode 找到对应的 action 集合，再根据 action 名称找到 handler
 * - **状态隔离**：不同 mode 下同名 action 可以有不同的行为（如 main-menu 和 playing 下的方向键）
 *
 * ## 执行流程
 *
 * 1. 从 Command 中提取 `action` 和 `payload`
 * 2. 根据 `mode` 查找对应的 action handler 集合
 * 3. 如果当前 mode 没有定义 actions，忽略该命令
 * 4. 根据 `action` 名称找到对应的 handler
 * 5. 如果 handler 存在，调用并传入 `payload`
 *
 * @example
 *   // 在 playing 模式下执行左移命令
 *   const cmd = new Command('MOVE_LEFT', { Game: gameInstance });
 *   dispatchCommand(cmd, { mode: 'playing' });
 *   // 路由到 GAME_PLAYING_ACTIONS['MOVE_LEFT'](payload)
 *
 * @function dispatchCommand
 * @param {object} cmd - 要执行的命令
 * @param root0
 * @param root0.mode
 * @returns {void}
 */
const dispatchCommand = (cmd, { mode }) => {
  const { action, payload } = cmd;

  // 获取当前 mode 对应的 action 集合
  const actions = ACTIONS_MAP[mode];

  // 如果当前状态没有定义 actions，直接忽略
  if (!actions) {
    return;
  }

  // 根据 command action 找到对应 handler
  const handler = actions[action];

  // 执行 handler（如果存在）：使用可选链操作符，handler 为 undefined 时安全跳过
  handler?.(payload);
};

export default dispatchCommand;
