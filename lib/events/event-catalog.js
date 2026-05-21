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

  /* ---------- 方块操作 ---------- */
  BLOCK_MOVE: `game:${uuid}:block:move`,
  BLOCK_ROTATE: `game:${uuid}:block:rotate`,
  BLOCK_DROP: `game:${uuid}:block:drop`,
  BLOCK_TICK: `game:${uuid}:block:tick`,

  /* ---------- 动画特效 ---------- */
  START_COUNTDOWN: `game:${uuid}:start:countdown`,
  START_PAUSED: `game:${uuid}:start:paused`,
  STOP_PAUSED: `game:${uuid}:stop:paused`,
  START_CLEAR_LINES: `game:${uuid}:start:clear:lines`,
  START_LEVEL_UP: `game:${uuid}:start:level:up`,

  /* ---------- 背景音乐 ---------- */
  TOGGLE_BGM: `game:${uuid}:toggle:bgm`,

  /* ---------- 回放准备 ---------- */
  REPLAY_PREPARE: `game:${uuid}:replay:prepare`,
});
