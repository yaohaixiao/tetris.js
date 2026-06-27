import Base from '@/lib/core';

/* ---------- 事件路由 ---------- */
import GameRouter from '@/lib/events/router/game-router.js';

/* ---------- 事件日志 ---------- */
import {
  AudioEvents,
  BattleEvents,
  UIEvents,
} from '@/lib/events/event-catalog.js';

/* ---------- 子模块 ---------- */
// GameState 模块 - 游戏状态的初始数据模板
import GameState from '@/lib/state/game-state.js';
// Store 模块 - 全局状态存储，管理所有游戏状态数据
import GameStore from '@/lib/state/game-store.js';
// CommandQueue 模块 - 命令队列，处理和分发玩家操作
import CommandQueue from '@/lib/core/command/command-queue.js';
// AnimationSystem 模块 - 动画系统，管理所有特效动画的生命周期
import AnimationSystem from '@/lib/runtime/animation-system.js';
// UI 模块 - 界面渲染，负责游戏画面的绘制和更新
import UI from '@/lib/services/ui';
// Input 模块 - 输入设备控制器
import KeyboardController from '@/lib/services/input/keyboard-controller.js';
import GamepadController from '@/lib/services/input/gamepad-controller.js';
import AIController from '@/lib/ai/ai-controller.js';
import TouchController from '@/lib/services/input/touch-controller.js';
// ReplayController 模块 - 回放系统，录制和回放游戏过程
import ReplayController from '@/lib/runtime/replay-controller.js';

/* ---------- 动画特效模块 ---------- */
import CountdownAnimation from '@/lib/services/animations/countdown-animation.js';
import PausedAnimation from '@/lib/services/animations/paused-animation.js';
import ClearLinesAnimation from '@/lib/services/animations/clear-lines-animation.js';
import ClearScoreAnimation from '@/lib/services/animations/clear-score-animation.js';
import LevelUpAnimation from '@/lib/services/animations/level-up-animation.js';
import LandingFlashAnimation from '@/lib/services/animations/landing-flash-animation.js';
import GarbageWarningAnimation from '@/lib/services/animations/garbage-warning-animation.js';
import GarbagePushAnimation from '@/lib/services/animations/garbage-push-animation.js';
import GamepadNotificationAnimation from '@/lib/services/animations/gamepad-notification-animation.js';

/* ---------- 核心流程控制逻辑功能函数 ---------- */
import begin from '@/lib/game/core/begin.js';
import start from '@/lib/game/core/start.js';
import pause from '@/lib/game/core/pause.js';
import resume from '@/lib/game/core/resume.js';
import togglePause from '@/lib/game/core/toggle-pause.js';
import reset from '@/lib/game/core/reset.js';
import restart from '@/lib/game/core/restart.js';
import over from '@/lib/game/core/over.js';

/* ---------- 获取 ghost 定位 ---------- */
import getGhostPosition from '@/lib/game/selector/get-ghost-position.js';

/* ---------- 游戏方块控制逻辑功能函数 ---------- */
import move from '@/lib/game/logic/move.js';
import rotate from '@/lib/game/logic/rotate/rotate.js';
import tick from '@/lib/game/logic/tick.js';
import drop from '@/lib/game/logic/drop.js';
import spawn from '@/lib/game/logic/spawn.js';
import hold from '@/lib/game/logic/hold.js';

/* ---------- 游戏指令功能函数 ---------- */
import applyClearLines from '@/lib/game/actions/apply-clear-lines.js';
import setBeginningState from '@/lib/game/actions/set-beginning-state.js';

/* ---------- 游戏规则功能函数 ---------- */
import getSpeed from '@/lib/game/rules/get-speed.js';

/* ---------- 通用功能函数 ---------- */
import getStorage from '@/lib/utils/storage/get-storage.js';
import setStorage from '@/lib/utils/storage/set-storage.js';

/**
 * # Game（游戏主控类）
 *
 * 游戏的核心协调器，负责创建和管理所有子系统， 并通过事件驱动的方式协调各模块之间的交互。
 *
 * ## 核心职责
 *
 * - **模块组装**：在 `initialize()` 中创建所有子系统并注入依赖
 * - **流程协调**：监听游戏事件，调用对应的流程控制函数
 * - **操作代理**：提供 `move()`、`rotate()` 等简短的公共方法，委托给具体逻辑函数
 * - **生命周期管理**：管理 AI 的启动/停止、回放的录制/播放
 *
 * ## 架构设计
 *
 * Game 类采用**依赖注入**和**组合模式**，将所有具体功能委托给专门的子模块：
 *
 * - 状态管理委托给 `GameStore`
 * - 动画系统委托给 `AnimationSystem`
 * - 输入处理委托给 `KeyboardController` 和 `GamepadController`
 * - AI 逻辑委托给 `AIController`
 * - 回放功能委托给 `ReplayController`
 *
 * ## 依赖的子模块
 *
 * | 模块         | 说明         | 主要职责                   |
 * | ------------ | ------------ | -------------------------- |
 * | Store        | 全局状态存储 | 管理游戏状态、分数、等级等 |
 * | Animations   | 动画系统     | 管理所有游戏特效动画       |
 * | CommandQueue | 命令队列     | 处理和分发玩家操作命令     |
 * | UI           | 界面渲染     | 负责游戏画面的绘制和更新   |
 * | Keyboard     | 键盘输入     | 处理键盘按键输入           |
 * | Gamepad      | 手柄输入     | 处理游戏手柄输入           |
 * | AI           | AI 控制器    | AI 玩家的决策和执行        |
 * | Replay       | 回放系统     | 录制和回放游戏过程         |
 * | Router       | 事件路由器   | 管理所有事件的订阅和分发   |
 *
 * ## 事件驱动架构
 *
 * Game 类本身不包含具体业务逻辑，而是通过 GameRouter 订阅事件， 将所有操作委托给
 * `/lib/game/core/`、`/lib/game/logic/` 等目录中的
 * 纯函数处理。这种设计确保了核心逻辑可单独测试、模块间松耦合、易于扩展。
 *
 * ## Battle 模式 AI 启动流程（修复后）
 *
 * Battle 模式下 AI 的启动路径：
 *
 * 1. `Game.initialize()` — 创建 AI 实例，设置 `Store.setController('ai')`，但不启动
 * 2. 用户选择等级 + 难度 → 进入倒计时 → `_onGameStart` → `Game.start()`
 * 3. 倒计时结束 → `CountdownAnimation.dispose()` → `emit(BEGIN)` → `Game.begin()`
 * 4. `Game.begin()` — 检测 Battle + AI 玩家 → `AI.start()` 启动决策循环
 * 5. `_onGameStart` → `emit(AIEvents.START)` → `AIController.start()` — 防重入跳过
 *
 * 修复前 `Game.initialize()` 和 `Game.begin()` 各调用一次 `AI.start()`， 导致两个 `loop()` 在
 * Scheduler 中交替运行，动作序列被打乱。
 *
 * ## 7-bag 独立修复
 *
 * 每个 Game 实例维护独立的 `this.bag = []`（在 `initialize()` 中初始化）。 `getBagSnapshot()` 返回
 * `structuredClone(this.bag)` 的深拷贝。 `randomShape()` 直接读写 `runtime.bag`（即
 * `Game.bag`），不再使用模块级全局变量。 Battle 模式下两个 Game 实例的 bag 完全隔离。
 *
 * ## 事件隔离修复
 *
 * 所有 `game:*` 事件名通过 `GameEvents(Game.id)` 生成，包含 Game 的 UUID。 Battle 模式下两个 Game
 * 实例的事件完全隔离，不会互相干扰。
 *
 * @augments Base
 * @class Game
 */
class Game extends Base {
  /**
   * ## 构造函数
   *
   * 接收依赖配置，通过 Base.inject() 将所有配置属性注入实例， 然后调用 `initialize()` 创建所有子系统。
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Elements - DOM 元素引用集合
   * @param {object} options.Block - 方块渲染配置（style + pattern）
   * @param {object} options.Scheduler - 全局调度器实例
   * @param {object} options.Player - 玩家信息对象 { name, index }
   * @param {string} options.Mode - 游戏模式（"single" | "versus"）
   */
  constructor(options) {
    // 调用父类 Base 的构造函数，将配置对象中的所有属性注入实例
    super(options);

    // 所有配置就绪后，立即初始化所有子系统
    this.initialize();
  }

  /**
   * ## 初始化所有子系统
   *
   * 创建 Store、Animations、UI、输入设备、AI、回放等模块， 并注入它们之间的依赖关系。这是整个游戏系统的"组装工厂"。
   *
   * ### 初始化顺序（严格依赖关系）
   *
   * 1. 创建 Store（状态存储）— 最基础的模块
   * 2. 生成游戏 ID（UUID）— 用于事件命名空间隔离
   * 3. 初始化 7-bag — 每个 Game 实例独立的方块袋子
   * 4. 创建 Animations（动画系统）
   * 5. 创建 CommandQueue（命令队列）
   * 6. 创建 UI（界面渲染）
   * 7. 条件创建 AI（AI 控制器）
   * 8. 创建 Keyboard（键盘输入）
   * 9. 创建 Gamepad（手柄输入）
   * 10. 条件创建 Touch（触屏控制器）
   * 11. 创建 Replay（回放系统）
   * 12. 创建 Router（事件路由器）
   *
   * ### Battle 模式 AI 处理
   *
   * 在 `initialize()` 中只设置 `Store.setController('ai')`，不调用 `AI.start()`。 AI
   * 的实际启动在 `begin()` 中进行，与 Single 模式的启动路径保持一致。
   *
   * @returns {void}
   */
  initialize() {
    const { Elements, Block, Scheduler, Player } = this;
    const { Controls } = Elements;

    /*
     * ==================== 步骤 1：创建全局状态存储 ====================
     *
     * GameStore 负责管理所有游戏状态数据：
     * 棋盘状态、当前方块、分数、等级、行数、游戏模式等。
     * 注入 Canvas 尺寸信息、Player 信息、GameState 初始模板。
     */
    const Store = new GameStore({
      ...Elements.Canvas,
      Player,
      GameState,
    });

    /*
     * ==================== 步骤 2：生成游戏实例唯一标识 ====================
     *
     * 使用 UUID 作为游戏实例的唯一标识符。
     * 优先使用 crypto.randomUUID()，降级方案为时间戳+随机字符串。
     * 用于构建命名空间事件名（game:<uuid>:*），支持 Battle 模式下多实例事件隔离。
     *
     * @type {string}
     */
    this.id =
      crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    /*
     * 当前暂停特效实例引用。
     * 存储 PausedAnimation 实例，为 null 时表示无暂停特效。
     *
     * @type {PausedAnimation | null}
     */
    this.effect = null;

    /*
     * ==================== 步骤 3：初始化 7-bag ====================
     *
     * 每个 Game 实例维护独立的 7-bag 方块袋子。
     * randomShape() 直接读写 runtime.bag（即 this.bag），
     * 不再使用模块级全局变量。Battle 模式下两个 Game 实例的 bag 完全隔离，
     * AI 的前瞻搜索基于正确的方块序列。
     *
     * @type {object[]}
     */
    this.bag = [];

    /** @type {GameStore} 游戏状态存储 — 管理所有游戏状态数据 */
    this.Store = Store;

    /*
     * ==================== 步骤 4：创建动画系统 ====================
     *
     * AnimationSystem 负责管理所有特效动画的生命周期：
     * 注册/移除动画实例、按 layer 排序渲染、
     * 检测阻塞动画（blocking=true）、自动清理已完成的动画。
     */
    /** @type {AnimationSystem} 动画系统 — 管理特效动画的生命周期 */
    this.Animations = new AnimationSystem({ Game: this, Player });

    /*
     * ==================== 步骤 5：创建命令队列 ====================
     *
     * CommandQueue 负责处理和分发玩家操作命令：
     * 键盘/手柄/AI 输入转换为 Command、命令排队和按序执行。
     * 使用带 UUID 的事件名（command:queue:<uuid>:enqueue），
     * Battle 模式下两个 Game 实例的命令队列完全隔离。
     */
    /** @type {CommandQueue} 命令队列 — 处理和分发玩家操作命令 */
    this.CommandQueue = new CommandQueue({ Game: this, Player });

    /*
     * ==================== 步骤 6：创建 UI 渲染模块 ====================
     *
     * UI 负责游戏画面的绘制和更新：
     * Canvas 渲染（棋盘、方块、ghost、特效）、
     * DOM 元素更新（分数、等级、行数）、响应 UI 事件。
     */
    /** @type {UI} 界面渲染 — 负责游戏画面的绘制和更新 */
    this.UI = new UI({ Game: this, Store, Elements, Block, Player });

    // 判断当前是否为对战模式
    const isVersus = this.isVersus();

    /*
     * ==================== 步骤 7：创建 AI 控制器（条件创建） ====================
     *
     * 仅在以下情况创建 AI：
     * 1. 对战模式中的 AI 玩家（Player.name === 'ai'）
     * 2. 单人模式（始终创建，用户可通过 S 键切换 human ↔ ai）
     *
     * 注意：此处只创建 AI 实例，不调用 AI.start()。
     * Battle 模式下 AI 的启动在 begin() 中进行。
     * Battle 模式下设置 Store.setController('ai')，确保后续
     * _onGameStart 中的 controller 检查正确。
     */
    if ((isVersus && Player.name === 'ai') || !isVersus) {
      /** @type {AIController} AI 控制器 — AI 玩家的决策和执行逻辑 */
      this.AI = new AIController({
        Game: this,
        Store,
        Scheduler,
        Animations: this.Animations,
        Player,
      });
    }

    /*
     * ==================== 步骤 8：创建键盘输入控制器 ====================
     *
     * 处理键盘按键输入：方向键移动旋转方块、空格硬降、ESC/P 暂停、Enter 确认。
     * Battle 模式下 P2（index=1）在 playing 状态时键盘输入被禁用，
     * 只能使用手柄操作。AI 玩家在 playing 状态时键盘输入被跳过。
     */
    /** @type {KeyboardController} 键盘输入控制器 — 处理键盘按键输入 */
    this.Keyboard = new KeyboardController({ Game: this, Store, Player });

    // ==================== 步骤 9：创建 Gamepad 游戏手柄控制器 ====================
    this._initializeGamepadController();

    /*
     * ==================== 步骤 10：创建触屏控制器（条件创建） ====================
     *
     * 仅在非对战模式下创建，因为对战模式目前不支持 GAME BOY 布局的模拟按钮控制器。
     * 触屏控制器绑定 DOM 按钮的 click 事件，模拟 GAME BOY 的十字键和 ABXY 按键。
     */
    if (!isVersus) {
      /** @type {TouchController} 移动设备触屏控制器 — 处理 GAME BOY 布局的模拟按键输入 */
      this.Touch = new TouchController({
        Game: this,
        Store,
        Controls,
        Player,
      });
    }

    /*
     * ==================== 步骤 11：创建回放控制器 ====================
     *
     * 负责录制和回放游戏过程：
     * 录制每一帧的输入和状态、按时间轴重新执行录制的输入。
     */
    /** @type {ReplayController} 回放控制器 — 录制和回放游戏过程 */
    this.Replay = new ReplayController({
      Game: this,
      Store,
      Scheduler,
      Player,
    });

    /*
     * ==================== 步骤 12：创建事件路由器（最后创建） ====================
     *
     * 负责监听所有游戏事件并分发到对应的处理方法。
     * 必须在所有子系统就绪后创建，因为需要引用所有子系统实例。
     * 使用带 UUID 的事件名订阅，Battle 模式下两个 Game 实例的事件完全隔离。
     */
    /** @type {GameRouter} 事件路由器 — 管理所有游戏事件的订阅和分发 */
    this.Router = new GameRouter({
      Animations: this.Animations,
      AI: this.AI,
      CommandQueue: this.CommandQueue,
      Game: this,
      Replay: this.Replay,
      Store,
      UI: this.UI,
      Player,
    });
  }

  /**
   * ## 初始化 Gamepad 游戏手柄控制器
   *
   * 根据游戏模式和连接的设备数量，智能分配手柄设备。
   *
   * ### 分配策略
   *
   * - **单人模式**：直接创建 GamepadController，自动检测第一个可用手柄
   * - **对战模式 P1（index 0）**：键盘为主，有 2 个手柄时也接入手柄 0
   * - **对战模式 P2（index 1）**：有 2 个手柄时用手柄 1，否则用手柄 0
   * - **AI 玩家**：不创建手柄控制器（AI 不需要手柄输入）
   *
   * @private
   * @returns {Game} 返回 this 以支持链式调用
   */
  _initializeGamepadController() {
    const { Store, Player } = this;
    const isHumanPlayer = Player.name !== 'ai';

    // 检测已连接的手柄数量，filter(Boolean) 过滤掉 null 值
    const gamepadCount = (navigator.getGamepads?.() || []).filter(
      Boolean,
    ).length;

    // AI 玩家不使用手柄
    if (!isHumanPlayer) {
      return this;
    }

    // 对战模式的手柄分配
    if (this.isVersus()) {
      const playerIndex = Player.index;

      // P1：有 2 个手柄时接入手柄 0
      if (playerIndex === 0) {
        if (gamepadCount >= 2) {
          /** @type {GamepadController} 手柄输入控制器 — 处理游戏手柄输入 */
          this.Gamepad = new GamepadController({
            Game: this,
            Store,
            Player,
          });
          // 绑定手柄索引 0（第一个手柄）
          this.Gamepad.setBoundIndex(0);
        }
      } else {
        // P2：有 2 个手柄时用手柄 1，否则用手柄 0
        this.Gamepad = new GamepadController({ Game: this, Store, Player });
        this.Gamepad.setBoundIndex(gamepadCount >= 2 ? 1 : 0);
      }
    } else {
      // 单人模式：直接创建手柄控制器，自动选择第一个可用的手柄
      this.Gamepad = new GamepadController({ Game: this, Store, Player });
    }
  }

  /**
   * ## 判断是否为对战模式
   *
   * 检查当前游戏模式是否为 "versus"（对战模式）。
   *
   * @returns {boolean} True 表示对战模式
   */
  isVersus() {
    const { Mode } = this;
    return Mode === 'versus';
  }

  /**
   * ## 获取 Canvas 画布元素
   *
   * 供外部模块（如 FlyAnimation）获取棋盘的 DOM 元素引用。
   *
   * @param {boolean} [isNext=false] - 是否获取预览方块 Canvas。默认 `false`. Default is
   *   `false`
   * @returns {HTMLCanvasElement} Canvas DOM 元素
   */
  getCanvas(isNext = false) {
    return this.UI.getCanvas(isNext);
  }

  // ==================== 场景控制 ====================

  /**
   * ## 选择等级
   *
   * 设置游戏等级并重置相关状态（baseLines、lines 归零）， 等级越高方块下落速度越快。播放等级变更音效。
   *
   * @param {number} level - 等级数值（1-10）
   * @returns {void}
   */
  selectLevel(level) {
    const { Store } = this;
    const AE = AudioEvents();
    const state = Store.getState();

    // 更新状态：重置基础行数、设置新等级、重置当前行数
    this.Store.setState({
      ...state,
      baseLines: 0,
      level,
      lines: 0,
    });

    // 播放等级变更音效
    this.emit(AE.PLAY_SOUND, { sound: 'LEVEL_CHANGED' });
  }

  /**
   * ## 切换到难度选择界面
   *
   * 将游戏模式切换为 difficulty，播放场景切换音效。
   *
   * @returns {void}
   */
  switchToDifficulty() {
    const AE = AudioEvents();
    this.Store.setMode('difficulty');
    this.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  }

  /**
   * ## 选择难度
   *
   * 设置游戏难度等级（easy / normal / hard / expert）， 难度影响初始棋盘垃圾行数量和 AI 行为。播放难度变更音效。
   *
   * @param {string} difficulty - 难度等级（easy / normal / hard / expert）
   * @returns {void}
   */
  selectDifficulty(difficulty) {
    const AE = AudioEvents();
    this.Store.setDifficulty(difficulty);
    this.emit(AE.PLAY_SOUND, { sound: 'DIFFICULTY_CHANGED' });
  }

  /**
   * ## 更新 7-bag 数据
   *
   * 供 randomShape 在 refill 时同步 bag 状态。 当前 randomShape 直接读写 runtime.bag，此方法保留备用。
   *
   * @param {object[]} bag - 新的 7-bag 方块数据数组
   * @returns {void}
   */
  updateBag(bag) {
    this.bag = bag;
  }

  /**
   * ## 获取当前袋子快照
   *
   * 返回当前袋子中剩余方块的深拷贝，供 AI 决策使用。 AI 需要知道袋子里还剩哪些方块来做更精准的前瞻搜索。
   *
   * ### Battle 模式修复
   *
   * 之前使用模块级全局变量 getBagSnapshot()，两个 Game 实例共享同一个 bag。 现在每个 Game 实例维护独立的
   * this.bag，通过 structuredClone 深拷贝返回。
   *
   * @returns {object[]} 当前袋子中剩余方块的深拷贝数组
   */
  getBagSnapshot() {
    return structuredClone(this.bag);
  }

  /**
   * ## 切换到主菜单
   *
   * 发送 UI 模式更新事件、设置 Store 模式为 main-menu、播放场景切换音效。
   *
   * @returns {void}
   */
  switchToMainMenu() {
    const AE = AudioEvents();
    const UE = UIEvents(this.id);

    // 通知 UI 层切换到主菜单渲染
    this.emit(UE.UPDATE_MODE, { mode: 'main-menu' });
    this.Store.setMode('main-menu');
    this.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
  }

  // ==================== 存档管理 ====================

  /**
   * ## 加载最高分
   *
   * 从 localStorage 读取键名为 `tetris-high-score` 的历史最高分， 解析失败或不存在时默认为 0，写入 Store。
   *
   * @returns {void}
   */
  loadHighScore() {
    const highScore = Number.parseInt(getStorage('tetris-high-score'), 10) || 0;
    this.Store.setHighScore(highScore);
  }

  /**
   * ## 保存最高分
   *
   * 仅当当前得分超过历史最高分时才更新 Store 并持久化到 localStorage。
   *
   * @param {number} score - 当前得分
   * @returns {void}
   */
  saveHighScore(score) {
    const { Store } = this;

    if (score > Store.getHighScore()) {
      Store.setHighScore(score);
      setStorage('tetris-high-score', score.toString());
    }
  }

  // ==================== 核心流程代理方法 ====================

  /**
   * ## 开始游戏准备
   *
   * 委托给 begin() 纯函数，设置游戏初始准备状态。
   *
   * ### Battle 模式 AI 启动
   *
   * 在对战模式中，如果当前玩家是 AI（Player.name === 'ai'）， 在 begin 流程中启动 AI 决策循环。
   *
   * 这是 AI 唯一的启动入口：
   *
   * - Game.initialize() 只创建 AI 实例，不启动
   * - Begin() 中启动 AI
   * - _onGameStart → AIEvents.START → start() 因防重入跳过
   *
   * 修复前 Game.initialize() 和 begin() 各调用一次 AI.start()， 导致两个 loop() 在 Scheduler
   * 中交替运行。
   *
   * @returns {void}
   */
  begin() {
    const { AI, Store, Player } = this;

    // 委托给纯函数 begin()，执行：重置棋盘、设置 playing 模式、生成方块、播放音效
    begin(this);

    // 对战模式中的 AI 玩家默认自动启动
    if (this.isVersus() && Player.name === 'ai') {
      Store.setController('ai');
      AI.start();
    }
  }

  /**
   * ## 启动游戏（进入倒计时）
   *
   * 委托给 start() 纯函数，启动倒计时后开始游戏循环。
   *
   * @returns {void}
   */
  start() {
    start(this);
  }

  /**
   * ## 暂停游戏
   *
   * 委托给 pause() 纯函数，停止游戏计时器并显示暂停动画。
   *
   * @returns {void}
   */
  pause() {
    pause(this);
  }

  /**
   * ## 恢复游戏
   *
   * 委托给 resume() 纯函数，从暂停状态恢复游戏。
   *
   * @returns {void}
   */
  resume() {
    resume(this);
  }

  /**
   * ## 切换暂停状态
   *
   * 委托给 togglePause() 纯函数，在暂停/运行之间切换。
   *
   * @returns {void}
   */
  togglePause() {
    togglePause(this);
  }

  /**
   * ## 重置游戏
   *
   * 委托给 reset() 纯函数，完全重置游戏状态回到主菜单。
   *
   * @returns {void}
   */
  reset() {
    reset(this);
  }

  /**
   * ## 重新开始游戏
   *
   * 委托给 restart() 纯函数，重新开始当前模式的游戏。
   *
   * @returns {void}
   */
  restart() {
    restart(this);
  }

  /**
   * ## 游戏结束
   *
   * 委托给 over() 纯函数，处理游戏结束流程。
   *
   * @returns {void}
   */
  over() {
    over(this);
  }

  /**
   * ## 获取 Ghost Piece 位置
   *
   * 计算当前方块的预览落点位置，如果 Y 坐标有变化则发送渲染事件。 Ghost piece 帮助玩家判断方块硬降后的最终落点。
   *
   * @param {object} payload - 当前方块的位置信息
   * @param {number} payload.cx - 当前方块 X 坐标
   * @param {number} payload.cy - 当前方块 Y 坐标
   */
  getGhostPosition(payload) {
    const position = getGhostPosition(this);
    const events = UIEvents(this.id);

    // 仅当 ghost Y 坐标与当前方块 Y 坐标不同时才发送渲染事件
    if (position && position.cy !== payload.cy) {
      this.emit(events.RENDER_GHOST_PIECE, {
        ghost: {
          ...payload,
          ...position,
        },
      });
    }
  }

  /**
   * ## 生成新方块
   *
   * 委托给 spawn() 纯函数，在棋盘顶部生成下一个方块。 从 7-bag 中取出方块，检测出生点碰撞（碰撞则 Game Over）。
   *
   * @returns {void}
   */
  spawn() {
    spawn(this);
  }

  /**
   * ## 缓存方块（Hold）
   *
   * 委托给 hold() 纯函数，将当前方块存入 hold 槽， 如果 hold 槽已有方块则取出使用。每个方块只能 Hold 一次。
   *
   * @returns {void}
   */
  hold() {
    hold(this);
  }

  // ==================== 方块操作代理方法 ====================

  /**
   * ## 移动当前方块
   *
   * 委托给 move() 纯函数，在指定方向移动方块，移动前进行碰撞检测。
   *
   * @param {number} x - X 轴偏移（负数左移，正数右移）
   * @param {number} y - Y 轴偏移（负数上移，正数下移/软降）
   * @returns {boolean} 是否移动成功
   */
  move(x, y) {
    return move(this, x, y);
  }

  /**
   * ## 旋转当前方块
   *
   * 委托给 rotate() 纯函数，使用 SRS 墙踢标准尝试旋转。 O 块（正方形）旋转后形状不变，跳过旋转。
   *
   * @returns {void}
   */
  rotate() {
    rotate(this);
  }

  /**
   * ## 游戏逻辑帧（Tick）
   *
   * 委托给 tick() 纯函数，处理重力下落。 如果 isBlocked 为 true（动画阻塞中），跳过重力下落。
   *
   * @param {boolean} isBlocked - 是否被动画阻塞
   * @returns {void}
   */
  tick(isBlocked) {
    tick(this, isBlocked);
  }

  /**
   * ## 方块快速落底（硬降 / Hard Drop）
   *
   * 委托给 drop() 纯函数，将方块瞬间移动到 ghost piece 位置并锁定。 执行流程：循环下移 → 锁定 → 落地高亮 → 消行检测 →
   * 生成新方块。
   *
   * @returns {void}
   */
  drop() {
    drop(this);
  }

  // ==================== 游戏指令代理方法 ====================

  /**
   * ## 执行消行逻辑
   *
   * 委托给 applyClearLines() 纯函数，检查填满的行并消除，返回消行数据供后续处理。
   *
   * @returns {object} 消行后的更新数据
   */
  applyClearLines() {
    return applyClearLines(this);
  }

  /**
   * ## 设置游戏初始状态
   *
   * 委托给 setBeginningState() 纯函数，根据模式和等级初始化棋盘、方块队列等。
   *
   * @param {string} mode - 游戏模式
   * @param {number} [level=1] - 初始等级，默认 1. Default is `1`
   * @returns {void}
   */
  setBeginningState(mode, level = 1) {
    setBeginningState(this, mode, level);
  }

  /**
   * ## 获取当前等级的下落速度
   *
   * 委托给 getSpeed() 纯函数，根据当前等级计算下落间隔（毫秒）。 等级越高间隔越小，最高 256 级时最低 120ms。
   *
   * @returns {number} 下落间隔（毫秒）
   */
  getSpeed() {
    return getSpeed(this);
  }

  // ==================== 动画特效控制 ====================

  /**
   * ## 开始倒计时动画
   *
   * 注册 CountdownAnimation 到 AnimationSystem，显示 3、2、1 倒计时数字。
   * 动画结束时自动触发游戏开始流程（BEGIN 事件 → begin()）。
   *
   * @returns {void}
   */
  startCountdown() {
    const { Scheduler } = this;
    this.Animations.register(new CountdownAnimation({ Scheduler, Game: this }));
  }

  /**
   * ## 开始暂停动画
   *
   * 注册 PausedAnimation 到 AnimationSystem，显示暂停呼吸灯效果。 保存引用到 this.effect 用于后续停止。
   *
   * @returns {void}
   */
  startPaused() {
    const { Scheduler } = this;
    this.effect = new PausedAnimation({ Scheduler });
    this.Animations.register(this.effect);
    this.effect.resume();
  }

  /**
   * ## 停止暂停动画
   *
   * 停止当前暂停动画并清空引用。
   *
   * @returns {void}
   */
  stopPaused() {
    if (!this.effect) {
      return;
    }
    this.effect.stop();
    this.effect = null;
  }

  /**
   * ## 开始消行闪烁动画
   *
   * 注册 ClearLinesAnimation 到 AnimationSystem。 对战模式下会先发送 PROCESS_ATTACK
   * 事件触发攻击处理， 计算消行产生的垃圾行并发送给对手。
   *
   * @param {number[]} linesToClear - 待消除的行号数组
   * @returns {void}
   */
  startClearLines(linesToClear) {
    const { Scheduler, Store } = this;

    // 对战模式：消行动画开始前处理攻击逻辑
    if (this.isVersus()) {
      const events = BattleEvents();
      this.emit(events.PROCESS_ATTACK, { from: this, lines: linesToClear });
    }

    this.Animations.register(
      new ClearLinesAnimation({
        Game: this,
        Store,
        Scheduler,
        lines: linesToClear,
      }),
    );
  }

  /**
   * ## 开始消除得分动画
   *
   * 注册 ClearScoreAnimation 到 AnimationSystem， 在消行位置显示得分数字上浮渐隐动画和 Combo 提示。
   *
   * @param {object} scoreData - 得分数据
   * @param {number} scoreData.score - 本次消除得分
   * @param {number[]} scoreData.lines - 消除的行号数组
   * @returns {void}
   */
  startClearScore(scoreData) {
    const { Scheduler } = this;
    this.Animations.register(
      new ClearScoreAnimation({
        Game: this,
        scoreData,
        Scheduler,
      }),
    );
  }

  /**
   * ## 开始升级烟花动画
   *
   * 注册 LevelUpAnimation 到 AnimationSystem， 升级时在棋盘上显示烟花/粒子特效和 "LEVEL UP" 文字。
   *
   * @param {number} level - 新等级
   * @returns {void}
   */
  startLevelUp(level) {
    const { Scheduler, UI } = this;

    this.Animations.register(
      new LevelUpAnimation({
        Game: this,
        UI,
        level,
        Scheduler,
      }),
    );
  }

  /**
   * ## 开始落地高亮动画
   *
   * 注册 LandingFlashAnimation 到 AnimationSystem， 方块落地时在落点位置显示短暂白色高亮闪烁（约 150ms）。
   *
   * @param {object} piece - 刚落地的方块信息
   * @param {number[][]} piece.shape - 方块形状矩阵
   * @param {number} piece.cx - 方块 X 坐标
   * @param {number} piece.cy - 方块 Y 坐标
   * @returns {void}
   */
  startLandingFlash(piece) {
    const { Scheduler } = this;
    this.Animations.register(
      new LandingFlashAnimation({
        Game: this,
        piece,
        Scheduler,
      }),
    );
  }

  /**
   * ## 开始垃圾行预警动画
   *
   * 注册 GarbageWarningAnimation 到 AnimationSystem。 棋盘红色/橙色网格闪烁 + "INCOMING
   * ATTACK" 文字，5 次闪烁共 600ms。 由 GameRouter._onStartGarbageWarning 调用。
   *
   * @param {number} roundId - 当前对局编号（用于动画过期检测）
   * @param {number} amount - 即将到来的垃圾行数量
   * @param {object} Battle - BattleController 实例引用
   * @returns {void}
   */
  startGarbageWarning(roundId, amount, Battle) {
    const { Scheduler } = this;

    this.Animations.register(
      new GarbageWarningAnimation({
        Game: this,
        Scheduler,
        Battle,
        roundId,
        amount,
      }),
    );
  }

  /**
   * ## 开始垃圾行闪烁动画
   *
   * 注册 GarbagePushAnimation 到 AnimationSystem。 垃圾方块灰色/白色交替闪烁，5 次闪烁共 600ms。 由
   * GameRouter._onStartGarbagePush 调用。
   *
   * @param {number[][]} rows - 垃圾行数据（0=空洞，非0=垃圾方块）
   * @param {number} roundId - 当前对局编号
   * @param {object} Battle - BattleController 实例引用
   * @returns {void}
   */
  startGarbagePush(rows, roundId, Battle) {
    const { Scheduler } = this;

    this.Animations.register(
      new GarbagePushAnimation({
        Game: this,
        Scheduler,
        rows,
        roundId,
        Battle,
      }),
    );
  }

  /**
   * ## 开始手柄连接通知动画
   *
   * 注册 GamepadNotificationAnimation 到 AnimationSystem。 显示手柄图标 + "CONNECTED" /
   * "DISCONNECTED" 文字闪烁，6 次闪烁共 1200ms。 由 GameRouter._onUpdateGamepadConnected
   * 调用。
   *
   * @param {boolean} connected - 手柄是否已连接（true=连接，false=断开）
   * @returns {void}
   */
  startGamepadConnectedNotify(connected) {
    const { Scheduler } = this;

    this.Animations.register(
      new GamepadNotificationAnimation({
        Game: this,
        Scheduler,
        connected,
      }),
    );
  }

  /**
   * ## 认输（对战模式专用）
   *
   * 仅在对战模式下有效。发送 PLAYER_SURRENDER 事件， BattleController 收到后将对手分数直接设为
   * victoryScore（15 分）， 触发 BATTLE OVER 界面。
   *
   * ### 使用场景
   *
   * - 玩家在对战中按 ESC 键主动认输
   * - E2E 测试中快速触发 battle-over 流程
   *
   * @returns {void}
   */
  surrender() {
    if (!this.isVersus()) {
      return;
    }

    const events = BattleEvents();

    // 发送玩家认输事件，BattleRouter 路由到 BattleController.surrender(loser)
    this.emit(events.PLAYER_SURRENDER, { loser: this });
  }

  // ==================== 事件订阅 / 取消订阅 ====================

  /**
   * ## 添加输入设备事件监听
   *
   * 启动键盘、手柄、触屏和 AI 的输入事件监听。 使用可选链安全调用，设备不存在时跳过。
   *
   * @returns {void}
   */
  addEventListeners() {
    this.AI?.addEventListeners?.();
    this.Keyboard?.addEventListeners?.();
    this.Gamepad?.addEventListeners?.();
    this.Touch?.addEventsListeners?.();
  }

  /**
   * ## 移除输入设备事件监听
   *
   * 停止键盘、手柄、触屏和 AI 的输入事件监听。 在游戏暂停、结束或销毁时调用，防止内存泄漏。
   *
   * @returns {void}
   */
  removeEventListeners() {
    this.AI?.removeEventListeners?.();
    this.Keyboard?.removeEventListeners?.();
    this.Gamepad?.removeEventListeners?.();
    this.Touch?.removeEventListeners?.();
  }

  /**
   * ## 订阅所有游戏事件
   *
   * 委托给 GameRouter 绑定所有事件的监听器。 使用带 UUID 的事件名，Battle 模式下事件隔离。
   *
   * @returns {void}
   */
  subscribe() {
    this.Router.subscribe();
  }

  /**
   * ## 取消订阅所有游戏事件
   *
   * 委托给 GameRouter 移除所有事件监听器，防止内存泄漏和误触发。
   *
   * @returns {void}
   */
  unsubscribe() {
    this.Router.unsubscribe();
  }
}

export default Game;
