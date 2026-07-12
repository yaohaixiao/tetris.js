/**
 * ============================================================
 *
 * # 动画系统事件常量
 *
 * ============================================================
 *
 * 每个 Game 实例独立的事件命名空间。
 *
 * @function AnimationsEvents
 * @param {string} uuid - Game 实例唯一标识
 * @returns {object} 动画事件名映射
 */
export const AnimationsEvents = (uuid) => ({
  CLEAR: `animations:${uuid}:clear`,
});

/**
 * ============================================================
 *
 * # 音频事件常量（全局）
 *
 * ============================================================
 *
 * 音频事件为全局事件，不区分 Game 实例。
 *
 * @function AudioEvents
 * @returns {object} 音频事件名映射
 */
export const AudioEvents = () => ({
  // 背景音乐
  RESUME_BGM: 'audio:resume:bgm',
  STOP_BGM: 'audio:stop:bgm',
  TOGGLE_BGM: 'audio:toggle:bgm',

  // 游戏音效
  PLAY_SOUND: 'audio:play:sound',
});

/**
 * ============================================================
 *
 * # AI 事件常量
 *
 * ============================================================
 *
 * @function AIEvents
 * @param {string} uuid - Game 实例唯一标识
 * @returns {object} AI 事件名映射
 */
export const AIEvents = (uuid) => ({
  START: `ai:${uuid}:start`,
  STOP: `ai:${uuid}:stop`,
});

/**
 * ============================================================
 *
 * # 对战事件常量（全局）
 *
 * ============================================================
 *
 * @function BattleEvents
 * @returns {object} 对战事件名映射
 */
export const BattleEvents = () => ({
  PROCESS_ATTACK: 'battle:process:attack',
  START_GARBAGE_FLY: 'battle:start:garbage:fly',
  FLUSH_GARBAGE: 'battle:flush:garbage',
  UPDATE_WINNER: 'battle:update:winner',
  SYNC_PAUSE: 'battle:sync:pause',
  SYNC_RESUME: 'battle:sync:resume',
  RESET: 'battle:reset',
  PLAYER_SURRENDER: 'battle:player:surrender',
});

/**
 * ============================================================
 *
 * # 命令队列事件常量
 *
 * ============================================================
 *
 * @function CommandEvents
 * @param {string} uuid - Game 实例唯一标识
 * @returns {object} 命令事件名映射
 */
export const CommandEvents = (uuid) => ({
  CLEAR: `command:queue:${uuid}:clear`,
  ENQUEUE: `command:queue:${uuid}:enqueue`,
});

/**
 * ============================================================
 *
 * # 引擎事件常量（全局）
 *
 * ============================================================
 *
 * @function EngineEvents
 * @returns {object} 引擎事件名映射
 */
export const EngineEvents = () => ({
  EXIT: 'engine:exit',
  UPDATE_MODE: 'engine:update:mode',
  UPDATE_PLAYERS: 'engine:update:players',
  START: 'engine:start',
});

/**
 * ============================================================
 *
 * # 游戏事件常量
 *
 * ============================================================
 *
 * 每个 Game 实例独立的事件命名空间。
 *
 * @function GameEvents
 * @param {string} uuid - Game 实例唯一标识
 * @returns {object} 游戏事件名映射
 */
export const GameEvents = (uuid) => ({
  // 状态更新
  UPDATE_STATE: `game:${uuid}:update:state`,
  UPDATE_MODE_INDEX: `game:${uuid}:update:mode:index`,
  UPDATE_BATTLE_INDEX: `game:${uuid}:update:battle:index`,
  UPDATE_MODE: `game:${uuid}:update:mode`,
  UPDATE_LEVEL: `game:${uuid}:update:level`,
  UPDATE_GAMEPAD_CONNECTED: `game:${uuid}:update:gamepad:connected`,

  // HUD 更新
  SWITCH_CONTROLLER: `game:${uuid}:swtich:controller`,
  UPDATE_HUD: `game:${uuid}:update:hud`,
  SAVE_HIGH_SCORE: `game:${uuid}:save:high:score`,

  // 场景切换
  SWITCH_TO_GAME_MODE: `game:${uuid}:switch:to:game:mode`,
  SWITCH_TO_BATTLE_MODE: `game:${uuid}:switch:to:battle:mode`,
  SWITCH_TO_MAIN_MENU: `game:${uuid}:switch:to:main:menu`,
  SELECT_LEVEL: `game:${uuid}:select:level`,
  SWITCH_TO_DIFFICULTY: `game:${uuid}:switch:difficulty`,
  SELECT_DIFFICULTY: `game:${uuid}:select:difficulty`,

  // 核心流程
  BEGIN: `game:${uuid}:begin`,
  START: `game:${uuid}:start`,
  TOGGLE_PAUSED: `game:${uuid}:toggle:paused`,
  RESET: `game:${uuid}:reset`,
  RESTART: `game:${uuid}:restart`,
  OVER: `game:${uuid}:over`,

  // Ghost 定位
  GET_GHOST_POSITION: `game:${uuid}:get:ghost:position`,

  // 方块操作
  BLOCK_MOVE: `game:${uuid}:block:move`,
  BLOCK_ROTATE: `game:${uuid}:block:rotate`,
  BLOCK_DROP: `game:${uuid}:block:drop`,
  BLOCK_TICK: `game:${uuid}:block:tick`,
  BLOCK_SPAWN: `game:${uuid}:block:spawn`,
  BLOCK_HOLD: `game:${uuid}:block:hold`,

  // 动画特效
  START_COUNTDOWN: `game:${uuid}:start:countdown`,
  START_PAUSED: `game:${uuid}:start:paused`,
  STOP_PAUSED: `game:${uuid}:stop:paused`,
  START_CLEAR_LINES: `game:${uuid}:start:clear:lines`,
  START_CLEAR_SCORE: `game:${uuid}:start:clear:score`,
  START_LEVEL_UP: `game:${uuid}:start:level:up`,
  START_LANDING_FLASH: `game:${uuid}:start:landing:flash`,
  START_GARBAGE_WARNING: `game:${uuid}:start:garbage:warning`,
  START_GARBAGE_PUSH: `game:${uuid}:start:garbage:push`,

  // 背景音乐
  TOGGLE_BGM: `game:${uuid}:toggle:bgm`,

  // 回放准备
  REPLAY_PREPARE: `game:${uuid}:replay:prepare`,

  // 对战认输
  SURRENDER: `game:${uuid}:surrender`,

  // 游戏计时
  START_TIMER: `game:${uuid}:start:timer`,
  PAUSE_TIMER: `game:${uuid}:pause:timer`,
  RESET_TIMER: `game:${uuid}:reset:timer`,

  // 更新游戏记录
  UPDATE_RECORDS: `game:${uuid}:update:records`,

  // 退出游戏
  EXIT: `game:${uuid}:exit`,
  UPDATE_EXIT_INDEX: `game:${uuid}:update:exit:index`,
  GIVE_UP: `game:${uuid}:give:up`,
  RESUME: `game:${uuid}:resume`,

  // Input 和 Command 映射
  DISPATCH_INPUT: `game:${uuid}:dispatch:input`,
  DISPATCH_COMMAND: `game:${uuid}:dispatch:command`,
});

/**
 * ============================================================
 *
 * # 回放事件常量
 *
 * ============================================================
 *
 * @function ReplayEvents
 * @param {string} uuid - Game 实例唯一标识
 * @returns {object} 回放事件名映射
 */
export const ReplayEvents = (uuid) => ({
  // 录制操作
  START_RECORD: `replay:${uuid}:start:record`,
  STOP_RECORD: `replay:${uuid}:stop:record`,
  ADD_RECORD: `replay:${uuid}:add:record`,
  ADD_PIECE: `replay:${uuid}:add:piece`,

  // 回放操作
  START_PLAY: `replay:${uuid}:start:play`,
  RESET: `replay:${uuid}:reset`,

  // 流程控制
  GAME_OVER: `replay:${uuid}:game:over`,
  STOP_CLEAR_LINES: `replay:${uuid}:stop:clear:lines`,
});

/**
 * ============================================================
 *
 * # UI 事件常量
 *
 * ============================================================
 *
 * 每个 Game 实例独立的事件命名空间。
 *
 * @function UIEvents
 * @param {string} uuid - Game 实例唯一标识
 * @returns {object} UI 事件名映射
 */
export const UIEvents = (uuid) => ({
  // HUD 绘制
  UPDATE_MODE: `ui:${uuid}:update:mode`,
  UPDATE_CONTROLLER: `ui:${uuid}:update:controller`,
  UPDATE_HUD: `ui:${uuid}:update:hud`,

  // 画布绘制
  RESIZE: `ui:${uuid}:resize`,
  RENDER_NEXT_PIECE: `ui:${uuid}:render:next:piece`,
  RENDER_HOLD_PIECE: `ui:${uuid}:render:hold:piece`,
  CLEAR_NEXT_PIECE: `ui:${uuid}:clear:next:piece`,
  CLEAR_HOLD_PIECE: `ui:${uuid}:clear:hold:piece`,
  RENDER_GHOST_PIECE: `ui:${uuid}:render:ghost:piece`,

  // 动画特效
  RENDER_COUNTDOWN: `ui:${uuid}:render:countdown`,
  RENDER_CLEAR_LINES: `ui:${uuid}:render:clear:lines`,
  RENDER_CLEAR_SCORE: `ui:${uuid}:render:clear:score`,
  RENDER_LEVEL_UP: `ui:${uuid}:render:level:up`,
  RENDER_LANDING_FLASH: `ui:${uuid}:render:landing:flash`,
  RENDER_GARBAGE_WARNING: `ui:${uuid}:render:garbage:warning`,
  RENDER_GARBAGE_PUSH: `ui:${uuid}:render:garbage:push`,
  RENDER_GAMEPAD_NOTIFICATION: `ui:${uuid}:render:gamepad:notification`,
});
