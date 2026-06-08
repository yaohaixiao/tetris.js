export const AnimationsEvents = (uuid) => ({
  CLEAR: `animations:${uuid}:clear`,
});

export const AudioEvents = () => ({
  /* ---------- 背景音乐 ---------- */
  RESUME_BGM: 'audio:resume:bgm',
  STOP_BGM: 'audio:stop:bgm',
  TOGGLE_BGM: 'audio:toggle:bgm',

  /* ---------- 游戏音效 ---------- */
  PLAY_SOUND: 'audio:play:sound',
});

export const AIEvents = (uuid) => ({
  START: `ai:${uuid}:start`,
  STOP: `ai:${uuid}:stop`,
});

export const BattleEvents = () => ({
  PROCESS_ATTACK: 'battle:process:attack',
  FLUSH_GARBAGE: 'battle:flush:garbage',
  UPDATE_WINNER: 'battle:update:winner',
  SYNC_PAUSE: 'battle:sync:pause',
  SYNC_RESUME: 'battle:sync:resume',
});

export const CommandEvents = (uuid) => ({
  CLEAR: `command:queue:${uuid}:clear`,
  ENQUEUE: `command:queue:${uuid}:enqueue`,
});

export const GameEvents = (uuid) => ({
  /* ---------- 状态更新 ---------- */
  UPDATE_STATE: `game:${uuid}:update:state`,
  UPDATE_MODE: `game:${uuid}:update:mode`,
  UPDATE_LEVEL: `game:${uuid}:update:level`,
  UPDATE_GAMEPAD_CONNECTED: `game:${uuid}:update:gamepad:connected`,

  /* ---------- HUD 更新 ---------- */
  SWITCH_CONTROLLER: `game:${uuid}:swtich:controller`,
  UPDATE_HUD: `game:${uuid}:update:hud`,
  SAVE_HIGH_SCORE: `game:${uuid}:save:high:score`,

  /* ---------- 场景更新 ---------- */
  SELECT_LEVEL: `game:${uuid}:select:level`,
  SWITCH_TO_DIFFICULTY: `game:${uuid}:switch:difficulty`,
  SELECT_DIFFICULTY: `game:${uuid}:select:difficulty`,
  SWITCH_TO_MAIN_MENU: `game:${uuid}:switch:to:main:menu`,

  /* ---------- 核心流程 ---------- */
  BEGIN: `game:${uuid}:begin`,
  START: `game:${uuid}:start`,
  TOGGLE_PAUSED: `game:${uuid}:toggle:paused`,
  RESET: `game:${uuid}:reset`,
  RESTART: `game:${uuid}:restart`,
  OVER: `game:${uuid}:over`,

  /* ---------- 获取 ghost 定位 ---------- */
  GET_GHOST_POSITION: `game:${uuid}:get:ghost:position`,

  /* ---------- 方块操作 ---------- */
  BLOCK_MOVE: `game:${uuid}:block:move`,
  BLOCK_ROTATE: `game:${uuid}:block:rotate`,
  BLOCK_DROP: `game:${uuid}:block:drop`,
  BLOCK_TICK: `game:${uuid}:block:tick`,
  BLOCK_SPAWN: `game:${uuid}:block:spawn`,
  BLOCK_HOLD: `game:${uuid}:block:hold`,

  /* ---------- 动画特效 ---------- */
  START_COUNTDOWN: `game:${uuid}:start:countdown`,
  START_PAUSED: `game:${uuid}:start:paused`,
  STOP_PAUSED: `game:${uuid}:stop:paused`,
  START_CLEAR_LINES: `game:${uuid}:start:clear:lines`,
  START_CLEAR_SCORE: `game:${uuid}:start:clear:score`,
  START_LEVEL_UP: `game:${uuid}:start:level:up`,
  START_LANDING_FLASH: `game:${uuid}:start:landing:flash`,

  /* ---------- 背景音乐 ---------- */
  TOGGLE_BGM: `game:${uuid}:toggle:bgm`,

  /* ---------- 回放准备 ---------- */
  REPLAY_PREPARE: `game:${uuid}:replay:prepare`,
});

export const ReplayEvents = (uuid) => ({
  /* ---------- 记录操作 ---------- */
  START_RECORD: `replay:${uuid}:start:record`,
  STOP_RECORD: `replay:${uuid}:stop:record`,
  ADD_RECORD: `replay:${uuid}:add:record`,
  ADD_PIECE: `replay:${uuid}:add:piece`,

  /* ---------- 回放操作 ---------- */
  START_PLAY: `replay:${uuid}:start:play`,
  RESET: `replay:${uuid}:reset`,

  /* ---------- 流程控制 ---------- */
  GAME_OVER: `replay:${uuid}:game:over`,
  STOP_CLEAR_LINES: `replay:${uuid}:stop:clear:lines`,
});

export const UIEvents = (uuid) => ({
  /* ---------- HUD 绘制 ---------- */
  UPDATE_MODE: `ui:${uuid}:update:mode`,
  UPDATE_CONTROLLER: `ui:${uuid}:update:controller`,
  UPDATE_HUD: `ui:${uuid}:update:hud`,

  /* ---------- 画布绘制 ---------- */
  RESIZE: `ui:${uuid}:resize`,
  RENDER_NEXT_PIECE: `ui:${uuid}:render:next:piece`,
  RENDER_HOLD_PIECE: `ui:${uuid}:render:hold:piece`,
  CLEAR_NEXT_PIECE: `ui:${uuid}:clear:next:piece`,
  CLEAR_HOLD_PIECE: `ui:${uuid}:clear:hold:piece`,
  RENDER_GHOST_PIECE: `ui:${uuid}:render:ghost:piece`,

  /* ---------- 动画特效 ---------- */
  RENDER_COUNTDOWN: `ui:${uuid}:render:countdown`,
  RENDER_CLEAR_LINES: `ui:${uuid}:render:clear:lines`,
  RENDER_CLEAR_SCORE: `ui:${uuid}:render:clear:score`,
  RENDER_LEVEL_UP: `ui:${uuid}:render:level:up`,
  RENDER_LANDING_FLASH: `ui:${uuid}:render:landing:flash`,
});
