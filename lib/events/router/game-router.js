import Base from '@/lib/core';
import {
  AudioEvents,
  AIEvents,
  GameEvents,
  UIEvents,
  ReplayEvents,
  EngineEvents,
} from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：GameRouter 游戏事件路由器
 *
 * ============================================================
 *
 * ## 功能描述
 *
 * 负责监听所有 `game:*` 命名空间的事件，并将它们路由到 `Game` 实例的对应方法或 Store 操作。
 * 同时管理所有子模块（AI、Animations、CommandQueue、Replay、UI）的订阅和取消订阅。
 *
 * ## 架构定位
 *
 *     EventBus → GameRouter（本模块）→ Game 方法 / Store 操作
 *       → 子模块 subscribe / unsubscribe
 *       → 跨领域事件转发（AI / UI / Audio / Replay）
 *
 * - **纯路由层**：不包含任何业务逻辑，只做事件到方法的映射
 * - **子模块管理**：统一管理所有子模块的生命周期（subscribe / unsubscribe）
 * - **跨领域协调**：在需要时转发事件到其他领域（如 AI 启停、UI 更新、音频控制）
 *
 * ## 职责边界
 *
 * | 组件       | 职责                |
 * | :--------- | :------------------ |
 * | GameRouter | 事件监听 → 方法调用 |
 * | Game       | 业务逻辑执行        |
 * | Store      | 状态管理            |
 *
 * ## Battle 模式事件隔离
 *
 * 所有事件名通过 `GameEvents(Game.id)` 生成，包含 Game 的 UUID：
 *
 * - 格式：`game:<uuid>:<event>`
 * - 确保 Battle 模式下两个 Game 实例的事件完全隔离
 * - 每个 GameRouter 实例只处理自己 Game 的事件
 *
 * ## 退出菜单相关事件（Single 模式）
 *
 * Single 模式下按 ESC 键触发退出菜单，相关事件：
 *
 * | 事件              | 处理方法             | 说明                          |
 * | :---------------- | :------------------- | :---------------------------- |
 * | EXIT              | `_onExit`            | 进入退出菜单界面（exit-game） |
 * | UPDATE_EXIT_INDEX | `_onUpdateExitIndex` | ↑↓ 移动退出菜单光标           |
 * | RESUME            | `_onResume`          | 继续游戏，返回 playing 模式   |
 * | GIVE_UP           | `_onGiveUp`          | 退出游戏，返回模式选择界面    |
 *
 * ### 退出菜单流程
 *
 *     playing 模式 → 按 ESC → EXIT 事件 → _onExit → Game.exit()
 *       → Store.setMode('exit-game') → 显示退出菜单
 *         → ↑↓ 移动光标 → UPDATE_EXIT_INDEX → _onUpdateExitIndex
 *         → 选择 RESUME → RESUME 事件 → _onResume → 恢复 playing
 *         → 选择 EXIT GAME → GIVE_UP 事件 → _onGiveUp → engine:exit
 *
 * @augments Base
 * @class GameRouter
 */
class GameRouter extends Base {
  /**
   * ## 构造函数
   *
   * 依赖由父类 `Base` 通过 `inject()` 注入。 Router 需要的依赖包括 Game、Store、各子模块等。
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.Store - 游戏状态存储
   * @param {object} options.Animations - 动画系统
   * @param {object} options.AI - AI 控制器
   * @param {object} options.CommandQueue - 命令队列
   * @param {object} options.Replay - 回放系统
   * @param {object} options.UI - UI 渲染器
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## subscribe：订阅所有游戏事件
   *
   * 绑定核心流程、方块操作、动画特效等所有 `game:*` 事件。 同时触发各子模块的 subscribe。
   *
   * ### 事件命名空间
   *
   * 所有事件名通过 `GameEvents(Game.id)` 生成，格式为 `game:<uuid>:<event>`。 Battle 模式下两个
   * Game 实例的 UUID 不同，事件完全隔离。
   *
   * @returns {void}
   */
  subscribe() {
    const { Animations, AI, CommandQueue, Game, Replay, UI } = this;
    const events = GameEvents(Game.id);

    /* ---------- 状态更新 ---------- */
    this.on(events.UPDATE_STATE, this._onUpdateState);
    this.on(events.UPDATE_MODE_INDEX, this._onUpdateModeIndex);
    this.on(events.UPDATE_BATTLE_INDEX, this._onUpdateBattleIndex);
    this.on(events.UPDATE_MODE, this._onUpdateMode);
    this.on(events.UPDATE_LEVEL, this._onUpdateLevel);
    this.on(events.UPDATE_GAMEPAD_CONNECTED, this._onUpdateGamepadConnected);

    /* ---------- HUD 更新 ---------- */
    this.on(events.SWITCH_CONTROLLER, this._onSwitchController);
    this.on(events.UPDATE_HUD, this._onUpdateHud);
    this.on(events.SAVE_HIGH_SCORE, this._onSaveHighScore);

    /* ---------- 场景更新 ---------- */
    this.on(events.SWITCH_TO_GAME_MODE, this._onSwitchToGameMode);
    this.on(events.SWITCH_TO_BATTLE_MODE, this._onSwitchToBattleMode);
    this.on(events.SWITCH_TO_MAIN_MENU, this._onSwitchToMainMenu);
    this.on(events.SELECT_LEVEL, this._onSelectLevel);
    this.on(events.SWITCH_TO_DIFFICULTY, this._onSwitchToDifficulty);
    this.on(events.SELECT_DIFFICULTY, this._onSelectDifficulty);

    /* ---------- 核心流程 ---------- */
    this.on(events.BEGIN, this._onGameBegin);
    this.on(events.START, this._onGameStart);
    this.on(events.TOGGLE_PAUSED, this._onTogglePaused);
    this.on(events.RESTART, this._onGameRestart);
    this.on(events.RESET, this._onGameReset);
    this.on(events.OVER, this._onGameOver);

    /* ---------- 获取 ghost 定位 ---------- */
    this.on(events.GET_GHOST_POSITION, this._onGetGhostPosition);

    /* ---------- 方块操作 ---------- */
    this.on(events.BLOCK_MOVE, this._onBlockMove);
    this.on(events.BLOCK_ROTATE, this._onBlockRotate);
    this.on(events.BLOCK_DROP, this._onBlockDrop);
    this.on(events.BLOCK_TICK, this._onBlockTick);
    this.on(events.BLOCK_SPAWN, this._onBlockSpawn);
    this.on(events.BLOCK_HOLD, this._onBlockHold);

    /* ---------- 动画特效 ---------- */
    this.on(events.START_COUNTDOWN, this._onStartCountdown);
    this.on(events.START_PAUSED, this._onStartPaused);
    this.on(events.STOP_PAUSED, this._onStopPaused);
    this.on(events.START_CLEAR_LINES, this._onStartClearLines);
    this.on(events.START_CLEAR_SCORE, this._onStartClearScore);
    this.on(events.START_LEVEL_UP, this._onStartLevelUp);
    this.on(events.START_LANDING_FLASH, this._onStartLandingFlash);
    this.on(events.START_GARBAGE_WARNING, this._onStartGarbageWarning);
    this.on(events.START_GARBAGE_PUSH, this._onStartGarbagePush);

    /* ---------- 背景音乐 ---------- */
    this.on(events.TOGGLE_BGM, this._onToggleBGM);

    /* ---------- 游戏回放 ---------- */
    this.on(events.REPLAY_PREPARE, this._onReplayPrepare);

    /* ---------- 对战认输 ---------- */
    this.on(events.SURRENDER, this._onSurrender);

    /* ---------- 游戏计时 ---------- */
    this.on(events.START_TIMER, this._onStartTimer);
    this.on(events.PAUSE_TIMER, this._onPauseTimer);
    this.on(events.RESET_TIMER, this._onResetTimer);

    /* ---------- 更新游戏统计数据 ---------- */
    this.on(events.UPDATE_RECORDS, this._onUpdateRecords);

    /* ---------- 退出游戏菜单（Single 模式） ---------- */
    this.on(events.EXIT, this._onExit);
    this.on(events.UPDATE_EXIT_INDEX, this._onUpdateExitIndex);
    this.on(events.RESUME, this._onResume);
    this.on(events.GIVE_UP, this._onGiveUp);

    /*
     * ==================== 子模块订阅 ====================
     *
     * 在 Router 订阅事件后，触发各子模块的 subscribe。
     * AI 使用可选链，因为 Battle 模式下 Human 玩家可能没有 AI 实例。
     * Animations、CommandQueue、Replay、UI 每个 Game 实例都有。
     */
    AI?.subscribe?.();
    Animations.subscribe();
    CommandQueue.subscribe();
    Replay.subscribe();
    UI.subscribe();
  }

  /**
   * ## unsubscribe：取消订阅所有游戏事件
   *
   * 移除所有已注册的 `game:*` 事件监听器。 同时触发各子模块的 unsubscribe。
   *
   * @returns {void}
   */
  unsubscribe() {
    const { Animations, AI, CommandQueue, Game, Replay, UI } = this;
    const events = GameEvents(Game.id);

    /* ---------- 状态更新 ---------- */
    this.off(events.UPDATE_STATE, this._onUpdateState);
    this.off(events.UPDATE_MODE_INDEX, this._onUpdateModeIndex);
    this.off(events.UPDATE_BATTLE_INDEX, this._onUpdateBattleIndex);
    this.off(events.UPDATE_MODE, this._onUpdateMode);
    this.off(events.UPDATE_LEVEL, this._onUpdateLevel);
    this.off(events.UPDATE_GAMEPAD_CONNECTED, this._onUpdateGamepadConnected);

    /* ---------- HUD 更新 ---------- */
    this.off(events.SWITCH_CONTROLLER, this._onSwitchController);
    this.off(events.UPDATE_HUD, this._onUpdateHud);
    this.off(events.SAVE_HIGH_SCORE, this._onSaveHighScore);

    /* ---------- 场景更新 ---------- */
    this.off(events.SWITCH_TO_GAME_MODE, this._onSwitchToGameMode);
    this.off(events.SWITCH_TO_BATTLE_MODE, this._onSwitchToBattleMode);
    this.off(events.SWITCH_TO_MAIN_MENU, this._onSwitchToMainMenu);
    this.off(events.SELECT_LEVEL, this._onSelectLevel);
    this.off(events.SWITCH_TO_DIFFICULTY, this._onSwitchToDifficulty);
    this.off(events.SELECT_DIFFICULTY, this._onSelectDifficulty);

    /* ---------- 核心流程 ---------- */
    this.off(events.START, this._onGameStart);
    this.off(events.BEGIN, this._onGameBegin);
    this.off(events.TOGGLE_PAUSED, this._onTogglePaused);
    this.off(events.RESTART, this._onGameRestart);
    this.off(events.RESET, this._onGameReset);
    this.off(events.OVER, this._onGameOver);

    /* ---------- 获取 ghost 定位 ---------- */
    this.off(events.GET_GHOST_POSITION, this._onGetGhostPosition);

    /* ---------- 方块操作 ---------- */
    this.off(events.BLOCK_MOVE, this._onBlockMove);
    this.off(events.BLOCK_ROTATE, this._onBlockRotate);
    this.off(events.BLOCK_DROP, this._onBlockDrop);
    this.off(events.BLOCK_TICK, this._onBlockTick);
    this.off(events.BLOCK_SPAWN, this._onBlockSpawn);
    this.off(events.BLOCK_HOLD, this._onBlockHold);

    /* ---------- 动画特效 ---------- */
    this.off(events.START_COUNTDOWN, this._onStartCountdown);
    this.off(events.START_PAUSED, this._onStartPaused);
    this.off(events.STOP_PAUSED, this._onStopPaused);
    this.off(events.START_CLEAR_LINES, this._onStartClearLines);
    this.off(events.START_CLEAR_SCORE, this._onStartClearScore);
    this.off(events.START_LEVEL_UP, this._onStartLevelUp);
    this.off(events.START_LANDING_FLASH, this._onStartLandingFlash);
    this.off(events.START_GARBAGE_WARNING, this._onStartGarbageWarning);
    this.off(events.START_GARBAGE_PUSH, this._onStartGarbagePush);

    /* ---------- 背景音乐 ---------- */
    this.off(events.TOGGLE_BGM, this._onToggleBGM);

    /* ---------- 游戏回放 ---------- */
    this.off(events.REPLAY_PREPARE, this._onReplayPrepare);

    /* ---------- 对战认输 ---------- */
    this.off(events.SURRENDER, this._onSurrender);

    /* ---------- 游戏计时 ---------- */
    this.off(events.START_TIMER, this._onStartTimer);
    this.off(events.PAUSE_TIMER, this._onPauseTimer);
    this.off(events.RESET_TIMER, this._onResetTimer);

    /* ---------- 更新游戏统计数据 ---------- */
    this.off(events.UPDATE_RECORDS, this._onUpdateRecords);

    /* ---------- 退出游戏菜单（Single 模式） ---------- */
    this.off(events.EXIT, this._onExit);
    this.off(events.UPDATE_EXIT_INDEX, this._onUpdateExitIndex);
    this.off(events.RESUME, this._onResume);
    this.off(events.GIVE_UP, this._onGiveUp);

    /*
     * ==================== 子模块取消订阅 ====================
     *
     * 在 Router 取消订阅后，触发各子模块的 unsubscribe。
     * 顺序与 subscribe 保持一致。
     */
    AI?.unsubscribe?.();
    Animations.unsubscribe();
    CommandQueue.unsubscribe();
    Replay.unsubscribe();
    UI.unsubscribe();
  }

  // ==================== 事件处理器（私有） ====================

  /**
   * ## _onSwitchController：切换控制者（human ↔ ai）
   *
   * 读取当前控制者身份，取反后更新 Store， 并发送相应的 AI 启停事件和 UI 更新事件。
   *
   * ### 触发方式
   *
   * - 键盘：S 键
   * - 手柄：RB 键
   *
   * ### AI 防重入
   *
   * AIController.start() 已包含 `if (this.enabled) return;` 检查， 即使此处多次发送
   * AIEvents.START 事件也不会导致重复启动。
   *
   * @private
   * @returns {void}
   */
  _onSwitchController = () => {
    const { Store, Game } = this;
    const uuid = Game.id;
    const controller = Store.getController() === 'human' ? 'ai' : 'human';
    const AE = AIEvents(uuid);
    const UE = UIEvents(uuid);

    Store.setController(controller);

    if (controller === 'ai') {
      this.emit(AE.START);
    } else {
      this.emit(AE.STOP);
    }

    this.emit(UE.UPDATE_CONTROLLER, { controller });
  };

  /**
   * ## _onUpdateState：更新 Store 状态
   *
   * 接收 stateHandler 函数，通过 Store.setState 执行状态更新。 stateHandler
   * 可以是对象（浅合并）或函数（基于前值计算新值）。
   *
   * @private
   * @param {object} options - 参数对象
   * @param {Function} options.stateHandler - 状态更新函数（接收 prev state，返回 new state）
   * @returns {void}
   */
  _onUpdateState = (options) => {
    const { Store } = this;
    const { stateHandler } = options;
    Store.setState(stateHandler);
  };

  /**
   * ## _onUpdateModeIndex：更新游戏模式选择索引
   *
   * 在游戏模式选择界面（game-mode）中，响应 ↑↓ 方向键移动光标。 只有两个选项（0=单人模式, 1=对战模式），直接切换为另一个值。
   * 每次移动播放切换音效。
   *
   * @private
   * @param {object} payload - 参数对象
   * @param {string} payload.action - 移动方向（'UP' | 'DOWN'）
   * @returns {void}
   */
  _onUpdateModeIndex = (payload) => {
    const { Store } = this;
    const { action } = payload;
    const index = action === 'UP' ? 0 : 1;

    Store.setModeIndex(index);

    const events = AudioEvents();
    this.emit(events.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
    this.emit('UPDATE_MODE_INDEX', { index });
  };

  /**
   * ## _onUpdateBattleIndex：更新对战模式选择索引
   *
   * 在对战模式选择界面（battle-mode）中，响应 ↑↓ 方向键移动光标。 只有两个选项（0=HUMAN vs AI, 1=HUMAN vs
   * HUMAN），直接切换为另一个值。 每次移动播放切换音效。
   *
   * @private
   * @param {object} payload - 参数对象
   * @param {string} payload.action - 移动方向（'UP' | 'DOWN'）
   * @returns {void}
   */
  _onUpdateBattleIndex = (payload) => {
    const { Store } = this;
    const { action } = payload;
    const index = action === 'UP' ? 0 : 1;

    Store.setBattleIndex(index);

    const events = AudioEvents();
    this.emit(events.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  };

  /**
   * ## _onUpdateMode：更新游戏模式
   *
   * 先通知 UI 层更新模式显示（用于切换界面布局），再更新 Store 中的模式。
   *
   * ### 调用时机
   *
   * - 游戏模式切换时（如从 playing 切换到 paused、切换到 exit-game）
   * - Battle 模式结束时（切换到 battle-over）
   *
   * @private
   * @param {object} options - 参数对象
   * @param {string} options.mode - 游戏模式
   * @returns {void}
   */
  _onUpdateMode = (options) => {
    const { Store, Game } = this;
    const { mode } = options;
    const events = UIEvents(Game.id);

    this.emit(events.UPDATE_MODE, { mode });
    Store.setMode(mode);
  };

  /**
   * ## _onUpdateLevel：更新等级
   *
   * @private
   * @param {object} options - 参数对象
   * @param {number} options.level - 等级值（1-10）
   * @returns {void}
   */
  _onUpdateLevel = (options) => {
    const { Store } = this;
    const { level } = options;
    Store.setLevel(level);
  };

  /**
   * ## _onUpdateGamepadConnected：更新手柄连接状态
   *
   * 更新 Store 中的手柄连接状态，并在游戏进行中时触发通知动画。 主菜单等界面不显示通知，避免遮挡选择界面。
   *
   * @private
   * @param {object} options - 参数对象
   * @param {boolean} options.connected - 手柄是否已连接（true=连接，false=断开）
   * @returns {void}
   */
  _onUpdateGamepadConnected = (options) => {
    const { Game, Store } = this;
    const { connected } = options;

    Store.setGamepadConnected(connected);

    if (Store.getMode() === 'playing') {
      Game.startGamepadConnectedNotify(connected);
    }
  };

  /**
   * ## _onUpdateHud：刷新 HUD 显示
   *
   * 读取当前 Store 状态，通知 UI 层更新分数、等级、行数、连击数等 HUD 信息。
   *
   * @private
   * @returns {void}
   */
  _onUpdateHud = () => {
    const { Store, Game } = this;
    const events = UIEvents(Game.id);
    this.emit(events.UPDATE_HUD, { state: Store.getState() });
  };

  /**
   * ## _onSaveHighScore：保存最高分
   *
   * 将当前分数与历史最高分比较，如果更高则持久化存储到 localStorage。
   *
   * @private
   * @returns {void}
   */
  _onSaveHighScore = () => {
    const { Store, Game } = this;
    Game.saveHighScore(Store.getScore());
  };

  /**
   * ## _onSelectLevel：选择等级
   *
   * 更新游戏等级，同时刷新 HUD 显示。
   *
   * @private
   * @param {object} options - 参数对象
   * @param {number} options.level - 等级值（1-10）
   * @returns {void}
   */
  _onSelectLevel = (options) => {
    const { Store, Game } = this;
    const { level } = options;
    const events = UIEvents(Game.id);

    Game.selectLevel(level);
    this.emit(events.UPDATE_HUD, { state: Store.getState() });
  };

  /**
   * ## _onSwitchToDifficulty：切换到难度选择界面
   *
   * @private
   * @returns {void}
   */
  _onSwitchToDifficulty = () => {
    const { Game } = this;
    const events = UIEvents(Game.id);

    this.emit(events.UPDATE_MODE, { mode: 'difficulty' });
    Game.switchToDifficulty();
  };

  /**
   * ## _onSelectDifficulty：选择难度
   *
   * @private
   * @param {object} options - 参数对象
   * @param {string} options.difficulty - 难度等级（easy / normal / hard / expert）
   * @returns {void}
   */
  _onSelectDifficulty = (options) => {
    const { Game } = this;
    const { difficulty } = options;
    Game.selectDifficulty(difficulty);
  };

  /**
   * ## _onSwitchToGameMode：切换到游戏模式选择界面
   *
   * 从对战模式选择界面（battle-mode）按 B 键返回。 将 Store 模式设为 game-mode，Scene Manager
   * 检测后渲染选择界面。
   *
   * @private
   * @returns {void}
   */
  _onSwitchToGameMode = () => {
    const { Store } = this;
    Store.setMode('game-mode');
  };

  /**
   * ## _onSwitchToBattleMode：切换到对战模式选择界面
   *
   * 从游戏模式选择界面（game-mode）选择对战模式后进入。 将 Store 模式设为 battle-mode，Scene Manager
   * 检测后渲染选择界面。
   *
   * @private
   * @returns {void}
   */
  _onSwitchToBattleMode = () => {
    const { Store } = this;
    Store.setMode('battle-mode');
  };

  /**
   * ## _onSwitchToMainMenu：切换到主菜单
   *
   * @private
   * @returns {void}
   */
  _onSwitchToMainMenu = () => {
    const { Game } = this;
    Game.switchToMainMenu();
  };

  /**
   * ## _onGameStart：进入倒计时
   *
   * 从等级选择界面进入 3-2-1 倒计时。 如果当前是 AI 控制，发送 AI 启动事件。
   *
   * ### AI 启动说明
   *
   * AIController.start() 已包含防重入检查。 Battle 模式下 AI 的 controller 在
   * Game.initialize() 中已设为 'ai'。
   *
   * @private
   * @returns {void}
   */
  _onGameStart = () => {
    const { Store, Game } = this;
    const events = AIEvents(Game.id);

    Game.start();

    if (Store.getController() === 'ai') {
      this.emit(events.START);
    }
  };

  /**
   * ## _onGameBegin：开始游戏流程
   *
   * 从主菜单/难度选择进入游戏。 初始化棋盘、生成方块、播放音效和背景音乐。
   *
   * @private
   * @returns {void}
   */
  _onGameBegin = () => {
    const { Game } = this;
    Game.begin();
  };

  /**
   * ## _onTogglePaused：暂停/继续切换
   *
   * 根据切换后的模式自动管理 AI 的启停。
   *
   * @private
   * @returns {void}
   */
  _onTogglePaused = () => {
    const { Store, Game } = this;
    const events = AIEvents(Game.id);

    Game.togglePause();

    if (Store.getController() === 'ai') {
      const { mode } = Store.getState();

      if (mode === 'paused') {
        this.emit(events.STOP);
      } else if (mode === 'playing') {
        this.emit(events.START);
      }
    }
  };

  /**
   * ## _onGameReset：重置游戏
   *
   * @private
   * @returns {void}
   */
  _onGameReset = () => {
    const { Game } = this;
    Game.reset();
  };

  /**
   * ## _onGameRestart：重新开始游戏
   *
   * @private
   * @returns {void}
   */
  _onGameRestart = () => {
    const { Game } = this;
    Game.restart();
  };

  /**
   * ## _onGameOver：游戏结束
   *
   * @private
   * @returns {void}
   */
  _onGameOver = () => {
    const { Game } = this;
    Game.over();
  };

  /**
   * ## _onGetGhostPosition：获取 Ghost 定位
   *
   * 计算当前方块硬降后的落点位置，用于绘制幽灵方块预览。
   *
   * @private
   * @param {object} payload - 参数对象（含当前方块信息）
   * @returns {void}
   */
  _onGetGhostPosition = (payload) => {
    const { Game } = this;
    Game.getGhostPosition(payload);
  };

  /**
   * ## _onBlockSpawn：生成新方块
   *
   * 从预览队列中取出下一个方块放置到棋盘顶部。 如果出生点碰撞（棋盘已满），触发 Game Over。
   *
   * @private
   * @returns {void}
   */
  _onBlockSpawn = () => {
    const { Game } = this;
    Game.spawn();
  };

  /**
   * ## _onBlockHold：缓存方块（Hold）
   *
   * 将当前活动方块存入 Hold 区，或与 Hold 区方块交换。 每个方块在一局游戏中只能被 Hold 一次。
   *
   * @private
   * @returns {void}
   */
  _onBlockHold = () => {
    const { Game } = this;
    Game.hold();
  };

  /**
   * ## _onBlockMove：移动方块
   *
   * @private
   * @param {object} options - 参数对象
   * @param {number} options.ox - X 轴偏移（负值左移，正值右移）
   * @param {number} options.oy - Y 轴偏移（正值下移/软降）
   * @returns {void}
   */
  _onBlockMove = (options) => {
    const { Game } = this;
    const { ox, oy } = options;
    Game.move(ox, oy);
  };

  /**
   * ## _onBlockRotate：旋转方块
   *
   * 尝试顺时针旋转当前方块，包含 SRS 墙踢检测。 O 块（正方形）旋转后形状不变，跳过旋转。
   *
   * @private
   * @returns {void}
   */
  _onBlockRotate = () => {
    const { Game } = this;
    Game.rotate();
  };

  /**
   * ## _onBlockDrop：硬降方块（Hard Drop）
   *
   * 将方块瞬间落到底部，触发落地锁定、消行检测和新方块生成。
   *
   * @private
   * @returns {void}
   */
  _onBlockDrop = () => {
    const { Game } = this;
    Game.drop();
  };

  /**
   * ## _onBlockTick：游戏逻辑帧
   *
   * 处理自动下落、锁定延迟、消行等每帧逻辑。
   *
   * @private
   * @param {object} options - 参数对象
   * @param {boolean} options.isBlocked - 是否被动画阻塞（消行动画等期间暂停下落）
   * @returns {void}
   */
  _onBlockTick = (options) => {
    const { Game } = this;
    const { isBlocked } = options;
    Game.tick(isBlocked);
  };

  /**
   * ## _onToggleBGM：背景音乐切换
   *
   * 发送切换 BGM 事件，Audio 系统处理实际的播放/停止逻辑。
   *
   * @private
   * @returns {void}
   */
  _onToggleBGM = () => {
    const { Store } = this;
    const events = AudioEvents();
    this.emit(events.TOGGLE_BGM, {
      level: Store.getLevel(),
    });
  };

  /**
   * ## _onReplayPrepare：回放准备棋盘
   *
   * 重置棋盘为初始状态，设置回放模式，开始回放。 对战模式下保留当前等级，单人模式重置等级为 1。
   *
   * @private
   * @returns {void}
   */
  _onReplayPrepare = () => {
    const { Store, Game } = this;
    const uuid = Game.id;
    const UE = UIEvents(uuid);
    const RE = ReplayEvents(uuid);
    const GE = GameEvents(uuid);

    Store.resetBoard();

    Store.setState({
      board: Store.getBeginningBoard(),
      score: 0,
      lines: 0,
      level: Game.isVersus() ? Store.getLevel() : 1,
      next: null,
      hold: null,
    });

    this.emit(UE.UPDATE_MODE, { mode: 'replay' });
    this.emit(UE.CLEAR_NEXT_PIECE);
    this.emit(UE.CLEAR_HOLD_PIECE);
    Store.setMode('replay');
    this.emit(UE.UPDATE_HUD, { state: Store.getState() });

    this.emit(RE.START_PLAY);
    this.emit(GE.BLOCK_SPAWN);
  };

  // ==================== 动画特效处理器 ====================

  /**
   * ## _onStartCountdown：开始倒计时动画
   *
   * 注册 3-2-1 倒计时缩放动画到 AnimationSystem。 动画结束时自动触发游戏开始流程。
   *
   * @private
   * @returns {void}
   */
  _onStartCountdown = () => {
    const { Game } = this;
    Game.startCountdown();
  };

  /**
   * ## _onStartPaused：开始暂停动画
   *
   * 注册暂停呼吸灯动画到 AnimationSystem。
   *
   * @private
   * @returns {void}
   */
  _onStartPaused = () => {
    const { Game } = this;
    Game.startPaused();
  };

  /**
   * ## _onStopPaused：停止暂停动画
   *
   * 从 AnimationSystem 中移除暂停动画，恢复游戏。
   *
   * @private
   * @returns {void}
   */
  _onStopPaused = () => {
    const { Game } = this;
    Game.stopPaused();
  };

  /**
   * ## _onStartClearLines：开始消行动画
   *
   * 注册消行闪烁动画到 AnimationSystem。 对战模式下先处理攻击逻辑（PROCESS_ATTACK），再播放消行动画。
   *
   * @private
   * @param {object} options - 参数对象
   * @param {number[]} options.linesToClear - 待消除的行号数组
   * @returns {void}
   */
  _onStartClearLines = (options) => {
    const { Game } = this;
    const { linesToClear } = options;
    Game.startClearLines(linesToClear);
  };

  /**
   * ## _onStartClearScore：开始消除得分动画
   *
   * 在消除行的位置显示上浮渐隐的得分数字和 Combo 提示。
   *
   * @private
   * @param {object} options - 参数对象
   * @param {number} options.score - 本次消除得分
   * @param {number[]} options.lines - 消除的行号数组
   * @returns {void}
   */
  _onStartClearScore = (options) => {
    const { Game } = this;
    Game.startClearScore(options);
  };

  /**
   * ## _onStartLevelUp：开始升级动画
   *
   * 播放烟花粒子特效庆祝升级，显示 "LEVEL UP" 文字。
   *
   * @private
   * @param {object} options - 参数对象
   * @param {number} options.level - 新等级
   * @returns {void}
   */
  _onStartLevelUp = (options) => {
    const { Game } = this;
    const { level } = options;
    Game.startLevelUp(level);
  };

  /**
   * ## _onStartLandingFlash：开始落地高亮动画
   *
   * 方块落地的瞬间在落地格子上显示半透明白色闪烁。 持续约 200ms 后自动消失。
   *
   * @private
   * @param {object} options - 参数对象
   * @param {object} options.piece - 刚落地的方块信息
   * @param {number[][]} options.piece.shape - 方块形状矩阵
   * @param {number} options.piece.cx - 方块 X 坐标
   * @param {number} options.piece.cy - 方块 Y 坐标
   * @returns {void}
   */
  _onStartLandingFlash = (options) => {
    const { Game } = this;
    const { piece } = options;
    Game.startLandingFlash(piece);
  };

  /**
   * ## _onStartGarbageWarning：开始垃圾行预警动画
   *
   * 注册垃圾行预警动画（橙色网格 + "INCOMING ATTACK" 文字闪烁）到 AnimationSystem。 动画层
   * 150，blocking=true，5 次闪烁共 600ms。
   *
   * @private
   * @param {object} payload - 参数对象
   * @param {number} payload.roundId - 当前对局编号
   * @param {number} payload.amount - 即将到来的垃圾行数量
   * @param {object} payload.Battle - BattleController 实例引用
   * @returns {void}
   */
  _onStartGarbageWarning = (payload) => {
    const { Game } = this;
    const { roundId, amount, Battle } = payload;
    Game.startGarbageWarning(roundId, amount, Battle);
  };

  /**
   * ## _onStartGarbagePush：开始垃圾行闪烁动画
   *
   * 注册垃圾行闪烁动画（垃圾方块灰/白交替闪烁）到 AnimationSystem。 动画层 100，blocking=true，5 次闪烁共
   * 600ms。
   *
   * @private
   * @param {object} payload - 参数对象
   * @param {number[][]} payload.rows - 垃圾行数据
   * @param {number} payload.roundId - 当前对局编号
   * @param {object} payload.Battle - BattleController 实例引用
   * @returns {void}
   */
  _onStartGarbagePush = (payload) => {
    const { Game } = this;
    const { rows, roundId, Battle } = payload;
    Game.startGarbagePush(rows, roundId, Battle);
  };

  /**
   * ## _onSurrender：处理对战认输事件
   *
   * 当玩家在对战中按 ESC 认输时触发。 委托给 Game.surrender() 方法，发送 PLAYER_SURRENDER 事件给
   * BattleController。 BattleController 将对手分数直接设为 victoryScore 并触发 BATTLE OVER。
   *
   * @private
   * @returns {void}
   */
  _onSurrender = () => {
    const { Game } = this;
    Game.surrender();
  };

  /**
   * ## _onStartTimer：开始计时
   *
   * @private
   * @returns {void}
   */
  _onStartTimer = () => {
    const { Game } = this;
    Game.startTimer();
  };

  /**
   * ## _onPauseTimer：暂停计时
   *
   * @private
   * @returns {void}
   */
  _onPauseTimer = () => {
    const { Game } = this;
    Game.pauseTimer();
  };

  /**
   * ## _onResetTimer：重置计时器
   *
   * @private
   * @returns {void}
   */
  _onResetTimer = () => {
    const { Game } = this;
    Game.resetTimer();
  };

  /**
   * ## _onUpdateRecords：更新游戏统计数据
   *
   * @private
   * @param {object} payload - 参数对象
   * @param {string} payload.mode - 游戏模式（single / versus）
   * @returns {void}
   */
  _onUpdateRecords = (payload) => {
    const { Game } = this;
    const { mode } = payload;
    Game.updateRecords(mode);
  };

  // ==================== 退出游戏菜单处理器（Single 模式） ====================

  /**
   * ## _onExit：处理退出游戏事件（Single 模式）
   *
   * 当玩家在 Single 模式的 playing 状态下按 ESC 键时触发。 委托给 Game.exit() 方法，将游戏模式切换为
   * exit-game， 显示退出菜单覆盖层（Resume Game / Exit Game）。
   *
   * ### 触发方式
   *
   * - 键盘：ESC（在 playing 模式下）
   * - 由 GAME_PLAYING_ACTIONS.EXIT 调用
   *
   * ### 与 Battle 模式的区别
   *
   * Battle 模式下 ESC 键触发的是认输（surrender）， Single 模式下 ESC 键触发的是退出菜单（exit-game）。
   *
   * @private
   * @returns {void}
   */
  _onExit = () => {
    const { Game } = this;
    Game.exit();
  };

  /**
   * ## _onUpdateExitIndex：更新退出菜单选择索引
   *
   * 在退出游戏菜单界面（exit-game）中，响应 ↑↓ 方向键移动光标。 只有两个选项（0=RESUME GAME, 1=EXIT
   * GAME），直接切换为另一个值。 每次移动播放切换音效。
   *
   * @private
   * @param {object} payload - 参数对象
   * @param {string} payload.action - 移动方向（'UP' | 'DOWN'）
   * @returns {void}
   */
  _onUpdateExitIndex = (payload) => {
    const { Store } = this;
    const { action } = payload;
    const index = action === 'UP' ? 0 : 1;

    Store.setExitIndex(index);

    const events = AudioEvents();
    this.emit(events.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  };

  /**
   * ## _onResume：继续游戏（退出菜单中选择 RESUME GAME）
   *
   * 将游戏模式恢复为 playing，关闭退出菜单覆盖层。 同时恢复背景音乐播放。
   *
   * @private
   * @returns {void}
   */
  _onResume = () => {
    const { Store, Game } = this;

    Store.setMode('playing');

    const AE = AudioEvents();
    const UE = UIEvents(Game.id);
    const level = Store.getLevel();

    this.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
    this.emit(AE.RESUME_BGM, { level });
    this.emit(UE.START_TIMER);
  };

  /**
   * ## _onGiveUp：退出游戏（退出菜单中选择 EXIT GAME）
   *
   * 发送 engine:exit 事件，Engine 收到后销毁当前实例， 以单人模式重新 launch，回到游戏模式选择界面（game-mode）。
   *
   * @private
   * @returns {void}
   */
  _onGiveUp = () => {
    const { id, Store } = this;
    const AE = AudioEvents();
    const EE = EngineEvents();
    const GE = GameEvents(id);

    this.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
    this.emit(EE.EXIT);

    // 重置计时器
    Store.setElapsedTime(0);
    this.emit(GE.RESET_TIMER);
  };
}

export default GameRouter;
