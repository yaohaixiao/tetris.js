# Battle

简体中文 | [English](./06-battle.en.md)

> Battle 并不是另一套游戏，而是多个 Runtime 在同一场比赛中协同运行。

## Battle 不是另一套游戏

对于俄罗斯方块来说多人对战并不仅仅意味着：**同时显示两个棋盘**。真正复杂的是：

- 双方需要同时运行
- 双方拥有独立状态
- 双方需要交换 Garbage
- 双方仍然保持确定性

很多项目会为了多人模式重新实现一套新的游戏逻辑，这样虽然能够实现功能，但单人与多人会逐渐演变成两套不同的系统。随着项目不断扩展，维护成本也会越来越高。

因此，tetris.js 并没有设计成两套不同的系统。Battle 并不会修改 Gameplay，也不会修改 Runtime，真正发生变化的只是 Runtime 的数量。

**单人模式：**

```text
Runtime
```

**多人模式：**

```text
Runtime A
↓
Battle Controller
↑
Runtime B
```

<p align="center">
    <img src="assets/img/battle-runtime.png" alt="Battle Runtime">
</p>

双方依然运行各自完整的游戏，Battle
Controller 只负责协调双方之间需要交换的信息。因此，Battle 并没有创造新的游戏规则，它只是组织多个 Runtime 共同运行。

## Battle Controller

<p align="center">
    <img src="assets/img/battle-controller.png" alt="Battle Controller">
</p>

Battle Controller 模块真正负责的是：

- 管理多个 Runtime
- 转发 Battle 事件
- 同步 Garbage
- 判断胜负
- 控制比赛生命周期

它不会：

- 控制玩家
- 控制 AI
- 修改棋盘
- 绘制画面

```js
import Base from '@/lib/core';
import BattleStore from '@/lib/battle/state/battle-store.js';
import BattleHUD from '@/lib/battle/ui/battle-hud.js';
import BattleUI from '@/lib/battle/ui/battle-ui.js';
import BattleRouter from '@/lib/events/router/battle-router.js';
import {
  calculateGarbage,
  applyGarbage,
} from '@/lib/battle/rules/garbage-system.js';
import {
  GameEvents,
  AudioEvents,
  BattleEvents,
} from '@/lib/events/event-catalog.js';

/**
 * # 对战控制器
 *
 * 对战模式的核心控制器，负责协调对战的所有子系统， 包括状态管理、HUD 更新、UI 展示、事件路由和垃圾行系统。
 *
 * ## 核心职责
 *
 * | 职责             | 说明                                                           |
 * | ---------------- | -------------------------------------------------------------- |
 * | **子系统协调**   | 创建并管理 BattleStore、BattleHUD、BattleUI、BattleRouter 实例 |
 * | **生命周期管理** | 控制对战的开始（start）、暂停（stop）和重置（reset）           |
 * | **单局胜负判定** | 处理单局游戏结束事件，更新胜者和分数                           |
 * | **整场赛制判定** | 检查是否达到 victoryScore，触发整场结束或下一局                |
 * | **攻击处理**     | 计算消行攻击力，抵消待处理垃圾行，转发攻击                     |
 * | **垃圾行生成**   | 将待处理垃圾行实际应用到对手棋盘                               |
 * | **认输处理**     | 处理玩家主动认输，对手直接获胜                                 |
 * | **事件管理**     | 通过 BattleRouter 订阅/取消订阅对战事件                        |
 *
 * ## 赛制说明
 *
 * ### 单局 vs 整场
 *
 * - **单局（Round）**：一次游戏结束（某玩家方块堆满），胜者 +1 分
 * - **整场（Match）**：先达到 `victoryScore` 的玩家获胜，整场对战结束
 *
 * ### 对战流程
 *
 *     ┌─────────────────────────────────────────────┐
 *     │              整场对战开始                     │
 *     │  store.setRunning(true)                      │
 *     └─────────────────┬───────────────────────────┘
 *                       │
 *                       ▼
 *     ┌─────────────────────────────────────────────┐
 *     │              单局对战循环                     │
 *     │  ┌─────────────────────────────────────┐    │
 *     │  │  1. 双方游戏进行中                    │    │
 *     │  │  2. 某玩家方块堆满 → update(loser)    │    │
 *     │  │     - 胜者 +1 分                      │    │
 *     │  │     - 检查 score >= victoryScore？     │    │
 *     │  │       ├─ 是 → over(winner, loser)     │    │
 *     │  │       └─ 否 → restart(loser)          │    │
 *     │  └─────────────────────────────────────┘    │
 *     └─────────────────┬───────────────────────────┘
 *                       │
 *                       ▼
 *     ┌─────────────────────────────────────────────┐
 *     │         有人达到 victoryScore → 整场结束      │
 *     │  over(winner, loser)                         │
 *     │    → 双方切到 battle-over 模式               │
 *     │    → BattleUI.show(winnerName)               │
 *     │    → 显示对战结果覆盖层                       │
 *     └─────────────────────────────────────────────┘
 *
 * ## 架构设计
 *
 *     BattleController（对战控制器）
 *       ├── BattleStore（状态管理）
 *       │   ├── running / winner / scores / pendingGarbage
 *       │   └── 垃圾行累加、抵消、查询
 *       ├── BattleHUD（实时分数更新）
 *       │   └── DOM 分数元素更新
 *       ├── BattleUI（对战结果展示 & fly canvas 管理）
 *       │   ├── 覆盖层显示胜者
 *       │   └── fly canvas 显示/隐藏
 *       ├── BattleRouter（事件路由）
 *       │   └── 8 个对战事件的订阅和分发
 *       └── Garbage System（垃圾行系统）
 *           ├── calculateGarbage（攻击力计算）
 *           └── applyGarbage（垃圾行生成）
 *
 * ## 攻击处理流程（含动画时序）
 *
 *     玩家A消行
 *       → 触发 PROCESS_ATTACK 事件
 *         → processAttack(from, lines)
 *           → calculateGarbage(lines) 计算攻击力
 *           → offsetGarbage(from, attack) 抵消自己的待处理垃圾
 *             ├─ 有剩余攻击力 → addGarbage(to, remaining) 发送给对手
 *             │   └─ Scheduler.sequence 编排动画时序：
 *             │       1. 显示 fly canvas
 *             │       2. 触发 START_GARBAGE_FLY → FlyAnimation 400ms
 *             │       3. 400ms 后触发 START_GARBAGE_WARNING → WarningAnimation 600ms
 *             │       4. 600ms 后隐藏 fly canvas
 *             │       5. 120ms 后播放 GARBAGE_WARNING 音效
 *             └─ 无剩余 → 结束
 *       → 消行动画播放
 *       → 触发 FLUSH_GARBAGE 事件
 *         → flushGarbage(game)
 *           → getPendingGarbage(game) 获取待处理垃圾行
 *           → applyGarbage(board, amount, difficulty) 生成垃圾行棋盘
 *           → setState({ board: next }) 更新对手棋盘
 *           → clearGarbage(game) 清空待处理计数
 *           → 触发 START_GARBAGE_PUSH → PushAnimation 闪烁
 *           → 120ms 后播放 GARBAGE_RECEIVED 音效
 *
 * ## 认输流程
 *
 *     玩家按 ESC 认输
 *       → Game.surrender()
 *         → 发送 PLAYER_SURRENDER 事件
 *           → BattleRouter 路由到 surrender(loser)
 *             → 对手分数直接设为 victoryScore
 *             → over(winner, loser) 触发 BATTLE OVER
 *
 * @augments Base
 * @class BattleController
 */
class BattleController extends Base {
  /**
   * ## 构造函数
   *
   * 初始化对战控制器及其所有子系统，完成后自动开始对战。
   *
   * @param {object} options - 配置选项
   * @param {object[]} options.games - Game 实例数组（长度为 2）
   * @param {number} [options.victoryScore=20] - 目标分数，先达到者赢得整场对战. Default is
   *   `20`
   * @param {object} options.elements - BattleUI 所需的 DOM 元素 ID 配置
   * @param {string[]} options.players - 玩家名称数组
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## 初始化对战系统
   *
   * 创建对战所需的四个核心子系统： BattleStore → BattleHUD → BattleRouter → BattleUI。 完成后自动调用
   * start() 开始对战。
   *
   * @returns {void}
   */
  initialize() {
    const { games, elements, players } = this;
    const store = new BattleStore({ games });

    this.store = store;
    this.hud = new BattleHUD({ games, store });
    this.router = new BattleRouter({ battle: this });
    this.ui = new BattleUI({ elements, players });

    this.start();
  }

  /**
   * ## 开始对战
   *
   * 将对战状态设置为运行中。幂等操作。
   *
   * @returns {void}
   */
  start() {
    const { store } = this;
    if (store.isRunning()) return;
    store.setRunning(true);
  }

  /**
   * ## 停止对战
   *
   * 将对战状态设置为已停止。幂等操作。
   *
   * @returns {void}
   */
  stop() {
    const { store } = this;
    if (!store.isRunning()) return;
    store.setRunning(false);
  }

  /**
   * ## 更新对战结果（单局结束）
   *
   * 当有玩家游戏结束时调用，执行完整的单局结束处理流程。
   *
   * @param {object} loser - 失败的玩家 Game 实例
   * @returns {void}
   */
  update(loser) {
    const { store } = this;
    const winner = this.getOpponent(loser);
    const difficulty = winner.Store.getDifficulty();
    const victoryScore = store.getVictoryScore(difficulty);

    this.stop();
    store.setWinner(winner);
    store.updateScores({ winner, loser });
    this.hud.updateScores(winner, loser);

    const winnerId = store.getPlayerId(winner);
    const winnerScore = store.getScore(winnerId);

    if (winnerScore >= victoryScore) {
      this.over(winner, loser);
    } else {
      this.restart(loser);
    }
  }

  /**
   * ## 整场对战结束
   *
   * 通知双方切换到 battle-over 模式，显示胜者名称。
   *
   * @param {object} winner - 胜者 Game 实例
   * @param {object} loser - 败者 Game 实例
   * @returns {void}
   */
  over(winner, loser) {
    const WE = GameEvents(winner.id);
    const LE = GameEvents(loser.id);
    const AE = AudioEvents();
    const payload = { mode: 'battle-over' };
    const { Scheduler } = winner;

    winner.emit(WE.UPDATE_MODE, payload);
    loser.emit(LE.UPDATE_MODE, payload);

    const { Player } = winner;
    winner.emit(AE.STOP_BGM);

    Scheduler.delay(() => {
      winner.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
    }, 120);

    this.ui.show({ winner: Player });
  }

  /**
   * ## 重新开始一局对战
   *
   * 单局结束但整场未结束时调用。
   *
   * @param {object} loser - 本局失败的玩家 Game 实例
   * @returns {void}
   */
  restart(loser) {
    const events = GameEvents(loser.id);
    const winner = this.getOpponent(loser);

    winner.Animations?.clear?.();
    loser.Animations?.clear?.();

    this.store.increaseRound();
    loser.emit(events.RESTART);
    this.start();
  }

  /**
   * ## 重置整场对战
   *
   * 清空所有分数和状态，重新开始一场全新的对战。
   *
   * @param {object} from - 发起重置的玩家 Game 实例
   * @returns {void}
   */
  reset(from) {
    const opponent = this.getOpponent(from);

    this.store.reset();
    this.hud.updateScores(from, opponent);
    this.ui.hide({ over: true });

    const FE = GameEvents(from.id);
    const OE = GameEvents(opponent.id);

    from.emit(FE.RESET);
    opponent.emit(OE.RESET);
  }

  /**
   * ## 获取对手
   *
   * @param {object} yourself - 当前玩家 Game 实例
   * @returns {object} 对手的 Game 实例
   */
  getOpponent(yourself) {
    const { games } = this;
    return games.find((game) => game.id !== yourself.id);
  }

  /**
   * ## 获取当前回合 ID
   *
   * @returns {number} 当前回合的唯一标识
   */
  getRoundId() {
    return this.store.getRoundId();
  }

  /**
   * ## 获取指定玩家的 fly canvas
   *
   * @param {string} index - 玩家标识（如 "human-0"）
   * @returns {HTMLCanvasElement} 对应玩家的 fly canvas 元素
   */
  getOverlayFly(index) {
    return this.ui.$flies[index];
  }

  /**
   * ## 处理消行攻击
   *
   * 计算攻击力，抵消待处理垃圾行，转发攻击。
   *
   * @param {object} from - 发起攻击的玩家 Game 实例
   * @param {Array} lines - 消除的行数组
   * @returns {number} 实际发送给对手的垃圾行数
   */
  processAttack(from, lines) {
    const to = this.getOpponent(from);
    const attack = calculateGarbage(lines.length);

    if (attack <= 0) return 0;

    const { store } = this;
    const remaining = store.offsetGarbage(from, attack);

    if (remaining > 0) {
      store.addGarbage(to, remaining);

      const { Scheduler } = to;
      const roundId = this.getRoundId();
      const playerId = store.getPlayerId(to);

      Scheduler.sequence([
        {
          fn: () => {
            this.ui.show({ fly: playerId });
          },
        },
        {
          fn: () => {
            const events = BattleEvents();
            to.emit(events.START_GARBAGE_FLY, {
              from,
              to,
              roundId,
              amount: attack,
              fly: playerId,
              Battle: this,
            });
          },
        },
        {
          fn: () => {
            const events = GameEvents(to.id);
            to.emit(events.START_GARBAGE_WARNING, {
              roundId,
              amount: attack,
              Battle: this,
            });
          },
          delay: 400,
        },
        {
          fn: () => {
            this.ui.hide({ fly: playerId });
          },
          delay: 600,
        },
      ]);

      Scheduler.delay(() => {
        const events = AudioEvents();
        this.emit(events.PLAY_SOUND, { sound: 'GARBAGE_WARNING' });
      }, 120);
    }

    return remaining;
  }

  /**
   * ## 刷新垃圾行到棋盘
   *
   * 将累积的待处理垃圾行实际应用到指定玩家的棋盘上。
   *
   * @param {object} game - 要应用垃圾行的玩家 Game 实例
   * @returns {void}
   */
  flushGarbage(game) {
    const { Scheduler } = game;
    const amount = this.store.getPendingGarbage(game);

    if (amount <= 0) return;

    const { Store } = game;
    const { board, difficulty } = Store.getState();
    const next = applyGarbage(board, amount, difficulty);

    Store.setState({ board: next });
    this.store.clearGarbage(game);

    const garbageRows = next.slice(-amount);
    const events = GameEvents(game.id);
    const roundId = this.getRoundId();

    game.emit(events.START_GARBAGE_PUSH, {
      rows: garbageRows,
      roundId,
      Battle: this,
    });

    Scheduler.delay(() => {
      const events = AudioEvents();
      this.emit(events.PLAY_SOUND, { sound: 'GARBAGE_RECEIVED' });
    }, 120);
  }

  /**
   * ## 处理玩家认输
   *
   * 将对手分数直接设为 VictoryScore，触发 BATTLE OVER。 由
   * BattleRouter._onBattlePlayerSurrender 调用。
   *
   * @param {object} loser - 认输的玩家 Game 实例
   * @returns {void}
   */
  surrender(loser) {
    const { store } = this;
    const winner = this.getOpponent(loser);
    const winnerId = store.getPlayerId(winner);
    const difficulty = winner.Store.getDifficulty();
    const victoryScore = store.getVictoryScore(difficulty);

    // 停止对战
    this.stop();

    // 直接将对手分数设为 VictoryScore
    store.setScore(winnerId, victoryScore);
    store.setWinner(winner);

    // 更新 HUD
    this.hud.updateScores(winner, loser);

    // 触发整场结束
    this.over(winner, loser);
  }

  /**
   * ## 订阅对战事件
   *
   * @returns {void}
   */
  subscribe() {
    this.router.subscribe();
  }

  /**
   * ## 取消订阅对战事件
   *
   * @returns {void}
   */
  unsubscribe() {
    this.router.unsubscribe();
  }
}

export default BattleController;
```

Battle Controller 更像比赛裁判，而不是另一套游戏引擎。

## 每位玩家都是独立的 Runtime

Battle 中每一位玩家都拥有自己独立的：

- Board
- Store
- Scheduler
- Renderer
- Audio
- Replay
- AI（可选）

```js
const Engine = {
  // 省略其他逻辑...
  /**
   * ## 初始化引擎
   *
   * 创建 EngineStore、EngineRenderer、Scheduler、Audio、Game 等核心实例，
   * 并注入相互依赖关系。这是游戏启动的第一步——在所有子系统创建完成后， Game 实例在构造函数中自动完成游戏状态的初始化。
   *
   * ### 初始化顺序
   *
   * | 步骤 | 操作                            | 说明                                       |
   * | ---- | ------------------------------- | ------------------------------------------ |
   * | 1    | `new EngineStore(options)`      | 创建全局状态管理器，合并默认配置和传入选项 |
   * | 2    | `new EngineRenderer({ Store })` | 创建 DOM 界面渲染器                        |
   * | 3    | `EngineRenderer.render()`       | 绘制游戏的所有 DOM 界面                    |
   * | 4    | `new Scheduler()`               | 创建全局任务调度器                         |
   * | 5    | `new Audio(normalizedOptions)`  | 创建音频系统                               |
   * | 6    | 处理 Players 列表               | Single 模式只保留第一个玩家                |
   * | 7    | `new Game(...)` × N             | 为每位玩家创建 Game 实例                   |
   * | 8    | `new BattleController(...)`     | 对战模式下创建对战控制器                   |
   *
   * ### Game 实例的自主启动
   *
   * 每个 Game 实例在构造函数中自动完成全部启动流程： `constructor → initialize() → launch()`， 无需
   * Engine 额外调用。这确保了 Game 实例创建完毕即可用。
   *
   * @param {object} [options={}] - 配置参数对象，用于覆盖默认的 EngineState。默认 `{}`. Default
   *   is `{}`
   * @param {boolean} [options.isRelaunch] - 是否为模式切换后的重新启动
   * @returns {void}
   */
  initialize: (options = {}) => {
    const { isRelaunch = false } = options;

    /*
     * ==================== 步骤 1：创建引擎全局状态管理器 ====================
     *
     * EngineStore 合并默认 EngineState 和传入的 options，
     * 通过 structuredClone 深拷贝确保状态独立性。
     * 后续所有模块通过 Engine.Store 访问全局配置。
     */
    const Store = new EngineStore(options);

    // 挂载 Store 到 Engine 静态属性
    Engine.Store = Store;

    /*
     * ==================== 步骤 2：创建界面渲染器并渲染 DOM ====================
     *
     * EngineRenderer 根据 Store 中的 Mode 和 Players 配置
     * 生成对应数量和结构的 HTML 模板，一次性注入根容器。
     *
     * Single 模式：渲染 1 套棋盘 + HUD + 控制按钮
     * Versus 模式：渲染 2 套棋盘 + HUD + Battle 覆盖层
     */
    Engine.Renderer = new EngineRenderer({
      Store,
    });

    // 绘制游戏的所有 DOM 界面（棋盘、HUD、按钮等）
    Engine.Renderer.render();

    // 从 Store 获取完整状态
    const state = Store.getState();

    // 解构核心配置，用于后续创建 Game 和 BattleController
    const { Players, Mode, Elements } = state;

    /*
     * ==================== 步骤 3：创建全局调度器 ====================
     *
     * Scheduler 是所有时间驱动逻辑的核心，包括：
     * - AI 的决策循环（AIController.loop）
     * - 音效序列
     * - 动画时序（delay / sequence）
     *
     * 挂载在 Engine 上，供所有子模块共享引用。
     */
    Engine.Scheduler = new Scheduler();

    /*
     * ==================== 步骤 4：标准化配置 ====================
     *
     * 将 Scheduler 注入配置，并标记默认启用 AI 模式。
     * 扩展运算符确保原始 state 不被修改。
     *
     * isAIPlayer = true 表示在 Single 模式下默认创建 AI 控制器，
     * 玩家可通过 S 键切换 human ↔ ai。
     */
    const normalizedOptions = {
      ...state,
      isRelaunch,
      Scheduler: Engine.Scheduler,
      isAIPlayer: true,
    };

    /*
     * ==================== 步骤 5：创建音频系统 ====================
     *
     * Audio 管理背景音乐和音效。
     * 注入完整的标准化配置（包含 Scheduler 引用）。
     */
    Engine.Audio = new Audio(normalizedOptions);

    /*
     * ==================== 步骤 6：处理玩家列表 ====================
     *
     * 创建 Players 数组的副本（避免修改原始 state）。
     * Single 模式移除最后一个玩家，只保留第一个。
     * Versus 模式保留全部两个玩家。
     */
    const finalPlayers = [...Players];

    if (Mode === 'single') {
      // 单人模式只保留第一个玩家（如 ['human', 'ai'] → ['human']）
      finalPlayers.pop();
    }

    /*
     * ==================== 步骤 7：创建 Game 实例 ====================
     *
     * 遍历 finalPlayers，为每位玩家创建独立的 Game 实例。
     *
     * 每个 Game 实例在构造函数中自动完成：
     * 1. Base.inject() — 将所有配置注入 this
     * 2. Game.initialize() — 创建 Store、UI、Keyboard、AI 等子系统
     * 3. Game.launch() — 初始化棋盘、HUD、事件绑定
     *
     * 每个 Game 实例包含：
     * - Player 信息（name + index）
     * - 完整的子系统（Store、UI、Keyboard、AI 等）
     * - 对 Scheduler 和 Audio 的引用
     * - 独立的 7-bag（this.bag = []）
     */
    for (const [index, player] of finalPlayers.entries()) {
      Engine.Games.push(
        new Game({
          Player: {
            index,
            name: player,
          },
          ...normalizedOptions,
        }),
      );
    }

    /*
     * ==================== 步骤 8：创建对战控制器 ====================
     *
     * 仅在对战模式下创建 BattleController。
     * 注入双方 Game 实例、Battle UI 元素配置和玩家列表。
     *
     * BattleController 在构造函数中自动完成：
     * 1. 创建 BattleStore（对战状态管理）
     * 2. 创建 BattleHUD（记分牌）
     * 3. 创建 BattleRouter（事件路由）
     * 4. 创建 BattleUI（结果面板 + fly canvas）
     * 5. 调用 start() 开始对战
     */
    if (Engine.Store.isVersus()) {
      Engine.Battle = new BattleController({
        games: Engine.Games,
        elements: Elements.Battle,
        players: finalPlayers,
      });
    }
  },
}
```

也就是说 Battle 并不存在："**共享棋盘**"，双方始终拥有完全独立的游戏状态。这种设计让：

- 玩家 vs 玩家
- 玩家 vs AI
- AI vs AI

都能够建立在同一套架构之上。

## Garbage 如何同步？

Battle 真正需要协调的只有双方交互的数据。例如：

- 消行数量
- 连击（Combo）
- Back-to-Back
- Garbage

当一方完成攻击，Battle
Controller 会根据游戏规则计算对应的 Garbage。然后将这一事件发送给另一方 Runtime。

### 处理消行攻击

Battle Controller 在接受到 Battle 对战中一方的攻击消息消息时处理行攻击：

```js
/**
 * ## 处理攻击事件
 *
 * 在**消行动画开始前**被调用，负责计算攻击力并抵消对方的待处理垃圾行。
 *
 * @private
 * @param {object} payload - 事件负载
 * @param {object} payload.from - 发起攻击的玩家 Game 实例
 * @param {Array} payload.lines - 消除的行数数据，用于计算攻击力
 */
_onBattleProcessAttack = (payload) => {
  const { battle } = this;
  const { from, lines } = payload;
  battle.processAttack(from, lines);
};
```

### processAttack

```js
class BattleController extends Base {
  // 省略其他逻辑...
  /**
   * ## 处理消行攻击
   *
   * 计算攻击力，抵消待处理垃圾行，转发攻击。
   *
   * @param {object} from - 发起攻击的玩家 Game 实例
   * @param {Array} lines - 消除的行数组
   * @returns {number} 实际发送给对手的垃圾行数
   */
  processAttack(from, lines) {
    const to = this.getOpponent(from);
    const attack = calculateGarbage(lines.length);

    if (attack <= 0) return 0;

    const { store } = this;
    const remaining = store.offsetGarbage(from, attack);

    if (remaining > 0) {
      store.addGarbage(to, remaining);

      const { Scheduler } = to;
      const roundId = this.getRoundId();
      const playerId = store.getPlayerId(to);

      Scheduler.sequence([
        {
          fn: () => {
            this.ui.show({ fly: playerId });
          },
        },
        {
          fn: () => {
            const events = BattleEvents();
            to.emit(events.START_GARBAGE_FLY, {
              from,
              to,
              roundId,
              amount: attack,
              fly: playerId,
              Battle: this,
            });
          },
        },
        {
          fn: () => {
            const events = GameEvents(to.id);
            to.emit(events.START_GARBAGE_WARNING, {
              roundId,
              amount: attack,
              Battle: this,
            });
          },
          delay: 400,
        },
        {
          fn: () => {
            this.ui.hide({ fly: playerId });
          },
          delay: 600,
        },
      ]);

      Scheduler.delay(() => {
        const events = AudioEvents();
        this.emit(events.PLAY_SOUND, { sound: 'GARBAGE_WARNING' });
      }, 120);
    }

    return remaining;
  }
}
```

真正修改棋盘的依然是接收方自己的 Runtime，Battle
Controller 从不会直接修改任何玩家的游戏状态。

### 刷新垃圾行到棋盘

受到攻击的一方在方块锁定的时候才会新垃圾行到棋盘：

```js
import detectTSpin from '@/lib/game/logic/rotate/t-spin.js';
import { BattleEvents } from '@/lib/events/event-catalog.js';

/**
 * # 方块落地锁定
 *
 * 将当前活动方块固化到游戏棋盘上，使其成为棋盘的一部分。 锁定后方块无法再移动或旋转。
 *
 * ## 处理流程
 *
 * 1. 深拷贝当前棋盘（避免直接修改原状态）
 * 2. 遍历活动方块的形状矩阵
 * 3. 将每个实心格子的**颜色值**写入棋盘对应位置
 * 4. 检测 T-Spin（T 块旋转后锁定）
 * 5. 更新 Store 中的棋盘状态和 T-Spin 结果
 *
 * ## 为什么用颜色值而不是数字？
 *
 * 棋盘存储的是颜色字符串（如 `"#00c8ff"`），而非简单的 0/1。 这样做是为了在渲染时可以直接读取颜色值绘制不同颜色的方块。
 *
 * ## T-Spin 检测
 *
 * 在写入棋盘后调用 `detectTSpin`， 检测 T 块最后一次操作是否为旋转、4 个对角是否满足条件。 检测结果写入
 * `state.tSpin`，供后续消行计分使用。
 *
 * ## 调用时机
 *
 * - **硬降（drop）**：方块落到底部后
 * - **自动下落（tick）**：方块无法继续下落时
 * - **消行前**：锁定后才检测满行
 *
 * ## 后续流程
 *
 * 锁定后通常会执行：
 *
 * 1. T-Spin 检测（本函数内完成）
 * 2. 落地高亮动画（LandingFlashAnimation）
 * 3. 播放落地音效（FALL）
 * 4. 检测并消除满行（clearLines）
 * 5. 生成新方块（spawn）
 *
 * @function lock
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const lock = (runtime) => {
  const { Store } = runtime;
  const state = Store.getState();
  const { curr } = state;

  if (!curr) {
    return;
  }

  // 获取当前方块的形状矩阵
  const s = curr.shape;

  /**
   * ======== 深拷贝棋盘 ========
   *
   * 使用 structuredClone 深拷贝当前棋盘， 避免直接修改 Store 中的原状态。
   */
  const board = structuredClone(state.board);

  /**
   * ======== 写入方块颜色 ========
   *
   * 遍历方块的每个格子，将实心格子的颜色值写入棋盘对应位置。
   *
   * 棋盘坐标 = 方块左上角坐标 (cx, cy) + 形状内的偏移 (x, y)
   */
  for (let y = 0; y < s.length; y++) {
    for (let x = 0; x < s[y].length; x++) {
      // 只处理实心格子（值非 0 的格子）
      if (s[y][x]) {
        const boardY = state.cy + y;
        const boardX = state.cx + x;

        // 边界保护：跳过棋盘外的格子
        if (
          boardY < 0 ||
          boardY >= board.length ||
          boardX < 0 ||
          boardX >= board[0].length
        ) {
          continue;
        }

        board[boardY][boardX] = curr.color;
      }
    }
  }

  /**
   * ======== T-Spin 检测 ========
   *
   * 在棋盘更新前检测 T-Spin（需要读取锁定前的棋盘状态）。 检测 T 块最后一次操作是否为旋转，以及 4 个对角是否满足条件。
   */
  const tSpinResult = detectTSpin(runtime);

  /**
   * ======== 更新 Store ========
   *
   * 将新棋盘和 T-Spin 检测结果写入状态。 将 _lastAction 清空，为下一块准备。
   */
  Store.setState({
    board,
    tSpin: tSpinResult,
  });

  // 清空操作标记（方块已锁定，标记不再需要）
  curr._lastAction = null;

  // 对战模式，方块锁定后刷新垃圾行到棋盘
  if (runtime.isVersus()) {
    const events = BattleEvents();
    // 刷新 HUD 显示（分数、等级等）
    runtime.emit(events.FLUSH_GARBAGE, { from: runtime });
  }
};

export default lock;
```

接收方自己的 Runtime 会触发 `FLUSH_GARBAGE` 事件给 BattleController，最终执行刷新垃圾行到棋盘：

```js
class BattleController extends Base {
  // 省略其他逻辑...
  /**
   * ## 刷新垃圾行到棋盘
   *
   * 将累积的待处理垃圾行实际应用到指定玩家的棋盘上。
   *
   * @param {object} game - 要应用垃圾行的玩家 Game 实例
   * @returns {void}
   */
  flushGarbage(game) {
    const { Scheduler } = game;
    const amount = this.store.getPendingGarbage(game);

    if (amount <= 0) return;

    const { Store } = game;
    const {
      board,
      difficulty
    } = Store.getState();
    const next = applyGarbage(board, amount, difficulty);

    Store.setState({ board: next });
    this.store.clearGarbage(game);

    const garbageRows = next.slice(-amount);
    const events = GameEvents(game.id);
    const roundId = this.getRoundId();

    game.emit(events.START_GARBAGE_PUSH, {
      rows: garbageRows,
      roundId,
      Battle: this,
    });

    Scheduler.delay(() => {
      const events = AudioEvents();
      this.emit(events.PLAY_SOUND, { sound: 'GARBAGE_RECEIVED' });
    }, 120);
  }
}
```

此时会触发 `START_GARBAGE_WARNING` 事件，绘制受到攻击的一个警告特效。

## GarbageSystem

Battle 模块除了 BattleController 以外，另外需要重点介绍一下就是 `GarbageSystem`。实际上它只有两个职责：


- calculateGarbage()：根据消行数计算攻击力；
- applyGarbage()：对目标棋盘应用垃圾行；

### calculateGarbage

```js
/**
 * # 难度等级对应的垃圾行空洞数
 *
 * 控制垃圾行中随机空洞的数量，空洞越多越难处理。
 *
 * ## 空洞说明
 *
 * 垃圾行是填满的颜色块，但会随机留出几个**空洞**（值为 0 的格子）。 玩家需要利用当前方块填补这些空洞才能消除该行。
 *
 * ## 难度对应
 *
 * | 难度   | 空洞数 | 说明                    |
 * | ------ | ------ | ----------------------- |
 * | easy   | 1      | 每行 1 个空洞，容易填补 |
 * | normal | 2      | 每行 2 个空洞，需要规划 |
 * | hard   | 3      | 每行 3 个空洞，较难处理 |
 * | expert | 4      | 每行 4 个空洞，极难填补 |
 *
 * @constant {Object<string, number>}
 */
const DIFFICULTY_HOLES = {
    easy: 1, // 简单：1 个空洞
    normal: 2, // 普通：2 个空洞
    hard: 3, // 困难：3 个空洞
    expert: 4, // 专家：4 个空洞
  };

/**
 * # 根据消行数计算攻击力
 *
 * 将玩家的消行数量转换为对对手的垃圾行攻击数量。这是对战系统中**攻击计算**的核心函数。
 *
 * ## 计算规则
 *
 * - 查询 `GARBAGE_MAP` 映射表
 * - 如果消行数不在映射表中（如 0 行或 6+ 行），返回 0
 *
 * @param {number} lines - 玩家消除的行数
 * @returns {number} 返回对对手造成的垃圾行数，0 表示无攻击
 */
export const calculateGarbage = (lines) => GARBAGE_MAP[lines] || 0;
```

`calculateGarbage` 方法将玩家的消行数量转换为对对手的垃圾行攻击数量，这是对战系统中**攻击计算**的核心函数。

#### 难度对应

`calculateGarbage` 方法根据难度等级对应的生成垃圾行空的洞数：

| 难度   | 空洞数 | 说明                    |
| ------ | ------ | ----------------------- |
| easy   | 1      | 每行 1 个空洞，容易填补 |
| normal | 2      | 每行 2 个空洞，需要规划 |
| hard   | 3      | 每行 3 个空洞，较难处理 |
| expert | 4      | 每行 4 个空洞，极难填补 |

### applyGarbage

```js
/**
 * # 对目标棋盘应用垃圾行
 *
 * 在对手棋盘底部添加指定数量的垃圾行，模拟受到攻击的效果。 这是对战系统中**垃圾行生成**的核心函数。
 *
 * ## 处理流程
 *
 *     输入: board, amount, difficulty
 *       ↓
 *     1. 检查 amount 是否有效（> 0）
 *       ↓
 *     2. 从棋盘顶部移除 amount 行（模拟棋盘上升）
 *       ↓
 *     3. 在棋盘底部添加 amount 行新垃圾行
 *       ↓
 *     4. 每行随机生成 holeCount 个空洞
 *       ↓
 *     输出: 新的棋盘数组
 *
 * ## 垃圾行结构
 *
 * 每个垃圾行是一个长度为 `board[0].length`（棋盘宽度）的数组：
 *
 * - **实心格子**：填充颜色值（`lighten(COLORS.BLACK, 0.6)`）- 灰色块
 * - **空洞格子**：值为 `0` - 空白，可被方块填充
 *
 * 例如（宽度 10，空洞数 2）：
 *
 *     [1, 1, 0, 1, 1, 1, 0, 1, 1, 1]
 *           ↑           ↑
 *        空洞1        空洞2
 *
 * ## 设计考量
 *
 * ### 为什么从顶部移除行？
 *
 * 当垃圾行从底部插入时，棋盘整体会**向上移动**。 如果不移除顶部的行，棋盘会超出边界。 这模拟了真实俄罗斯方块中受到攻击时方块被推高的效果。
 *
 * ### 为什么使用 `lighten(COLORS.BLACK, 0.6)`？
 *
 * - 使用灰色而非纯黑色，视觉上更有层次感
 * - `lighten()` 函数让颜色稍微变亮，与背景区分
 * - 表示这是"垃圾"而非玩家自己放置的方块
 *
 * ### 空洞的随机性
 *
 * - 空洞位置完全随机，不可预测
 * - 通过 `Set` 确保每行的空洞位置不重复
 * - 不同难度对应不同的空洞数量
 *
 * @example
 *   // 创建一个 10x20 的空棋盘
 *   const board = Array.from({ length: 20 }, () => Array(10).fill(0));
 *
 *   // 应用 3 行垃圾，难度 normal（每行 2 个空洞）
 *   const newBoard = applyGarbage(board, 3, 'normal');
 *   // newBoard 仍然是 20 行，底部 3 行是带空洞的垃圾行
 *
 * @param {number[][]} board - 目标棋盘，二维数组
 *
 *   - 外层数组：棋盘的行（从上到下）
 *   - 内层数组：每行的格子（从左到右）
 *   - 值为颜色代码，`0` 表示空格
 *
 * @param {number} amount - 要添加的垃圾行数量
 *
 *   - 必须为正整数
 *   - 如果 ≤ 0，直接返回原棋盘（无操作）
 *
 * @param {string} difficulty - 难度等级
 *
 *   - 可选值：`'easy'` | `'normal'` | `'hard'` | `'expert'`
 *   - 影响每行垃圾的空洞数量
 *   - 未匹配的值默认使用 1 个空洞
 *
 * @returns {number[][]} 应用垃圾行后的新棋盘（不修改原棋盘）
 */
export const applyGarbage = (board, amount, difficulty) => {
    /** 边界条件检查： 如果垃圾行数无效（≤ 0），不进行任何操作，直接返回原棋盘。 这避免了不必要的数组操作和性能浪费。 */
    if (amount <= 0) {
      return board;
    }

    // 获取棋盘宽度（每行的格子数）
    const width = board[0].length;

    /**
     * 根据难度获取空洞数量：
     *
     * - 从 DIFFICULTY_HOLES 映射表查询
     * - 如果难度未定义，默认使用 1 个空洞（最宽容的难度）
     */
    const holeCount = DIFFICULTY_HOLES[difficulty] || 1;

    /** 创建棋盘副本： 使用扩展运算符创建浅拷贝，避免修改原棋盘数组。 注意：内层数组（行）会在后续操作中被替换。 */
    const next = [...board];

    /**
     * ======== 步骤 1：从顶部移除行 ========
     *
     * 模拟垃圾行从底部推入时棋盘整体上移的效果。 splice(0, amount) 从数组开头删除 amount 个元素。
     *
     * 例如：
     *
     * - 原棋盘 20 行，amount = 3
     * - 删除顶部 3 行后，剩余 17 行
     * - 之后添加 3 行垃圾行，恢复为 20 行
     */
    next.splice(0, amount);

    /**
     * ======== 步骤 2：在底部添加垃圾行 ========
     *
     * 循环 amount 次，每次在棋盘底部 push 一行新的垃圾行。
     */
    for (let i = 0; i < amount; i += 1) {
      /**
       * 创建垃圾行：
       *
       * - 使用 Array.from 生成长度为 width 的数组
       * - 初始填充颜色：使用 lighten 函数处理 COLORS.BLACK
       *
       *   - COLORS.BLACK：基础黑色
       *   - Lighten(..., 0.6)：将颜色提亮 60%，得到深灰色
       *   - 视觉效果：垃圾块是灰黑色，与玩家方块区分
       */
      const row = Array.from({ length: width }).fill(lighten(COLORS.BLACK, 0.6));

      /**
       * 随机生成空洞位置：
       *
       * 使用 Set 数据结构确保空洞位置不重复。
       *
       * 生成过程：
       *
       * 1. 创建空 Set
       * 2. 当 Set 大小小于 holeCount 时循环
       * 3. 每次生成 0 到 width-1 的随机整数
       * 4. Set 自动去重，所以不会有两个空洞在同一位置
       *
       * 例如 holeCount = 2, width = 10： 可能生成 Set { 3, 7 } → 第 3 列和第 7 列是空洞
       */
      const holes = new Set();

      while (holes.size < holeCount) {
        /*
         * Math.random() * width → 0 到 width 之间的浮点数
         * Math.floor() → 向下取整，得到 0 到 width-1 的整数
         */
        holes.add(Math.floor(Math.random() * width));
      }

      /**
       * 将空洞位置的值设为 0（空格）：
       *
       * 遍历 Set 中的所有空洞位置，将对应格子设为 0。
       *
       * - 0 在游戏逻辑中表示"空格"
       * - 方块可以落入空洞进行填补
       * - 填补所有空洞后该行才能被消除
       */
      for (const h of holes) {
        row[h] = 0;
      }

      // 将构建好的垃圾行添加到棋盘底部
      next.push(row);
    }

    // 返回处理后的新棋盘
    return next;
  };
```

`applyGarbage` 方法在对手棋盘底部添加指定数量的垃圾行，模拟受到攻击的效果。这是对战系统中**垃圾行生成**的核心函数。

处理流程：

1. 检查 amount 是否有效（> 0）
2. 从棋盘顶部移除 amount 行（模拟棋盘上升）
3. 在棋盘底部添加 amount 行新垃圾行
4. 每行随机生成 holeCount 个空洞
5. 输出: 新的棋盘数组

## Battle 与 AI

AI 并不知道自己正在进行 Battle 它仍然只是思考输出 Command，真正参与 Battle 的依然是 Runtime。

因此：

- 玩家 vs 玩家
- 玩家 vs AI
- AI vs AI

整个执行流程完全一致，Battle 并不会因为 AI 的加入而产生新的游戏逻辑。

## 为什么 Battle 能够自然加入？

Battle 看起来是整个项目增加的新玩法，实际上它只是 Runtime 架构自然演进后的结果。

<p align="center">
    <img src="assets/img/battle-diagram.png" alt="Battle Diagram">
</p>

因为：

- Runtime 已经负责组织游戏
- Command 已经统一输入
- Store 已经集中管理状态
- Replay 已经保证确定性



Battle 几乎不需要重新设计这些系统，它只是让多个 Runtime 同时运行。这也是整个架构可扩展性的体现。

## 小结

Battle 并没有重新实现俄罗斯方块，它只是让多个 Runtime 在同一场比赛中协同工作。每位玩家，无论是真人还是 AI，都拥有属于自己的 Runtime。Battle
Controller 则负责协调它们之间的交互。

因此，Battle 并不是架构之外的新功能，它只是 Runtime 能力自然延伸出来的一种应用。

## 下一步阅读

到这里 Runtime、AI、Replay 与 Battle 已经介绍完成，接下来将进入开发指南。了解整个项目的目录组织、模块划分以及如何参与开发。

**下一章：[07-development.md](./07-development.md)**
