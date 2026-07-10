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

/*
 * ============================================================
 * # 模块：BattleController 对战控制器
 * ============================================================
 *
 * ## 功能描述
 *
 * 对战模式的核心控制器，负责协调对战的所有子系统，包括状态管理、
 * HUD 更新、UI 展示、事件路由和垃圾行系统。
 *
 * ## 核心职责
 *
 * | 职责 | 说明 |
 * | :--- | :--- |
 * | **子系统协调** | 创建并管理 BattleStore、BattleHUD、BattleUI、BattleRouter 实例 |
 * | **生命周期管理** | 控制对战的开始（start）、停止（stop）和重置（reset） |
 * | **单局胜负判定** | 处理单局游戏结束事件，更新胜者和分数 |
 * | **整场赛制判定** | 检查是否达到 victoryScore，触发整场结束或下一局 |
 * | **攻击处理** | 计算消行攻击力，抵消待处理垃圾行，转发攻击 |
 * | **垃圾行生成** | 将待处理垃圾行实际应用到对手棋盘 |
 * | **认输处理** | 处理玩家主动认输，对手直接获胜 |
 * | **事件管理** | 通过 BattleRouter 订阅/取消订阅对战事件 |
 *
 * ## 赛制说明
 *
 * ### 单局（Round）
 *
 * 一次游戏结束（某玩家方块堆满），胜者 +1 分
 *
 * ### 整场（Match）
 *
 * 先达到 `victoryScore` 的玩家获胜，整场对战结束
 *
 * ## 对战流程
 *
 * ```
 * ┌─────────────────────────────────────────────┐
 * │              整场对战开始                     │
 * │  store.setRunning(true)                      │
 * └─────────────────┬───────────────────────────┘
 *                   │
 *                   ▼
 * ┌─────────────────────────────────────────────┐
 * │              单局对战循环                     │
 * │  ┌─────────────────────────────────────┐    │
 * │  │  1. 双方游戏进行中                    │    │
 * │  │  2. 某玩家方块堆满 → update(loser)    │    │
 * │  │     - 胜者 +1 分                      │    │
 * │  │     - 检查 score >= victoryScore？     │    │
 * │  │       ├─ 是 → over(winner, loser)     │    │
 * │  │       └─ 否 → restart(loser)          │    │
 * │  └─────────────────────────────────────┘    │
 * └─────────────────┬───────────────────────────┘
 *                   │
 *                   ▼
 * ┌─────────────────────────────────────────────┐
 * │         有人达到 victoryScore → 整场结束      │
 * │  over(winner, loser)                         │
 * │    → 双方切到 battle-over 模式               │
 * │    → BattleUI.show(winnerName)               │
 * │    → 显示对战结果覆盖层                       │
 * └─────────────────────────────────────────────┘
 * ```
 *
 * ## 架构设计
 *
 * ```
 * BattleController（对战控制器）
 *   ├── BattleStore（状态管理）
 *   │   ├── running / winner / scores / pendingGarbage
 *   │   └── 垃圾行累加、抵消、查询
 *   ├── BattleHUD（实时分数更新）
 *   │   └── DOM 分数元素更新
 *   ├── BattleUI（对战结果展示 & fly canvas 管理）
 *   │   ├── 覆盖层显示胜者
 *   │   └── fly canvas 显示/隐藏
 *   ├── BattleRouter（事件路由）
 *   │   └── 8 个对战事件的订阅和分发
 *   └── Garbage System（垃圾行系统）
 *       ├── calculateGarbage（攻击力计算）
 *       └── applyGarbage（垃圾行生成）
 * ```
 *
 * ## 攻击处理流程
 *
 * ```
 * 玩家A消行
 *   → 触发 PROCESS_ATTACK 事件
 *     → processAttack(from, lines)
 *       → calculateGarbage(lines) 计算攻击力
 *       → offsetGarbage(from, attack) 抵消自己的待处理垃圾
 *         ├─ 有剩余攻击力 → addGarbage(to, remaining) 发送给对手
 *         │   └─ Scheduler.sequence 编排动画时序：
 *         │       1. 显示 fly canvas
 *         │       2. 触发 START_GARBAGE_FLY → FlyAnimation 400ms
 *         │       3. 400ms 后触发 START_GARBAGE_WARNING → WarningAnimation 600ms
 *         │       4. 600ms 后隐藏 fly canvas
 *         │       5. 120ms 后播放 GARBAGE_WARNING 音效
 *         └─ 无剩余 → 结束
 *   → 消行动画播放
 *   → 触发 FLUSH_GARBAGE 事件
 *     → flushGarbage(game)
 *       → getPendingGarbage(game) 获取待处理垃圾行
 *       → applyGarbage(board, amount, difficulty) 生成垃圾行棋盘
 *       → setState({ board: next }) 更新对手棋盘
 *       → clearGarbage(game) 清空待处理计数
 *       → 触发 START_GARBAGE_PUSH → PushAnimation 闪烁
 *       → 120ms 后播放 GARBAGE_RECEIVED 音效
 * ```
 *
 * ## 认输流程
 *
 * ```
 * 玩家按 ESC 认输
 *   → Game.surrender()
 *     → 发送 PLAYER_SURRENDER 事件
 *       → BattleRouter 路由到 surrender(loser)
 *         → 对手分数直接设为 victoryScore
 *         → over(winner, loser) 触发 BATTLE OVER
 * ```
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
   * ## initialize：初始化对战系统
   *
   * 创建对战所需的四个核心子系统，按依赖顺序初始化： BattleStore → BattleHUD → BattleRouter → BattleUI
   *
   * 初始化完成后自动调用 start() 开始对战。
   *
   * @returns {void}
   */
  initialize() {
    const { games, elements, players } = this;

    // 创建状态管理：存储 running / winner / scores / pendingGarbage
    const store = new BattleStore({ games });
    this.store = store;

    // 创建 HUD 更新器：将分数同步到 DOM 显示
    this.hud = new BattleHUD({ games, store });

    // 创建事件路由器：订阅 8 个对战事件并路由到对应处理方法
    this.router = new BattleRouter({ battle: this });

    // 创建 UI 控制器：显示/隐藏对战结果覆盖层和 fly canvas
    this.ui = new BattleUI({ elements, players });

    this.start();
  }

  /**
   * ## start：开始对战
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
   * ## stop：停止对战
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
   * ## update：更新对战结果（单局结束）
   *
   * 当有玩家游戏结束时调用，执行完整的单局结束处理流程：
   *
   * 1. 获取胜者和败者
   * 2. 停止对战
   * 3. 记录胜者并更新分数
   * 4. 同步 HUD 显示
   * 5. 判断是否达到整场胜利条件
   *
   *    - 是 → over(winner, loser) 整场结束
   *    - 否 → restart(loser) 开始下一局
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
   * ## over：整场对战结束
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

    // 触发记录更新事件，保存游戏时长等统计数据
    winner.emit(WE.UPDATE_RECORDS, { mode: 'versus' });

    // 通知双方切换模式
    winner.emit(WE.UPDATE_MODE, payload);
    loser.emit(LE.UPDATE_MODE, payload);

    // 停止胜者的背景音乐
    const { Player } = winner;
    winner.emit(AE.STOP_BGM);

    // 延迟 120ms 播放场景切换音效
    Scheduler.delay(() => {
      winner.emit(AE.PLAY_SOUND, { sound: 'SWITCH_SCENE' });
    }, 120);

    // 显示对战结果覆盖层
    this.ui.show({ winner: Player });

    // 停止计时
    winner.emit(WE.PAUSE_TIMER);
    loser.emit(LE.PAUSE_TIMER);
  }

  /**
   * ## restart：重新开始一局对战
   *
   * 单局结束但整场未结束时调用，清除动画并重启游戏。
   *
   * 只通知败者 RESTART（胜者未结束），胜者通过事件响应同步重置。
   *
   * @param {object} loser - 本局失败的玩家 Game 实例
   * @returns {void}
   */
  restart(loser) {
    const events = GameEvents(loser.id);
    const winner = this.getOpponent(loser);

    // 清除双方动画队列，避免残留动画干扰新对局
    winner.Animations?.clear?.();
    loser.Animations?.clear?.();

    // 增加回合计数器，用于区分不同回合的垃圾行动画
    this.store.increaseRound();

    // 通知败者重新开始
    loser.emit(events.RESTART);

    this.start();
  }

  /**
   * ## reset：重置整场对战
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
   * ## getOpponent：获取对手
   *
   * @param {object} yourself - 当前玩家 Game 实例
   * @returns {object} 对手的 Game 实例
   */
  getOpponent(yourself) {
    const { games } = this;
    return games.find((game) => game.id !== yourself.id);
  }

  /**
   * ## getRoundId：获取当前回合 ID
   *
   * @returns {number} 当前回合的唯一标识
   */
  getRoundId() {
    return this.store.getRoundId();
  }

  /**
   * ## getOverlayFly：获取指定玩家的 fly canvas
   *
   * @param {string} index - 玩家标识（如 "human-0"）
   * @returns {HTMLCanvasElement} 对应玩家的 fly canvas 元素
   */
  getOverlayFly(index) {
    return this.ui.$flies[index];
  }

  /**
   * ## processAttack：处理消行攻击
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

      // 编排垃圾行警告动画时序
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

      // 播放垃圾行警告音效
      Scheduler.delay(() => {
        const events = AudioEvents();
        this.emit(events.PLAY_SOUND, { sound: 'GARBAGE_WARNING' });
      }, 120);
    }

    return remaining;
  }

  /**
   * ## flushGarbage：刷新垃圾行到棋盘
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

    // 更新棋盘
    Store.setState({ board: next });
    this.store.clearGarbage(game);

    // 触发垃圾行推入动画
    const garbageRows = next.slice(-amount);
    const events = GameEvents(game.id);
    const roundId = this.getRoundId();

    game.emit(events.START_GARBAGE_PUSH, {
      rows: garbageRows,
      roundId,
      Battle: this,
    });

    // 播放垃圾行接收音效
    Scheduler.delay(() => {
      const events = AudioEvents();
      this.emit(events.PLAY_SOUND, { sound: 'GARBAGE_RECEIVED' });
    }, 120);
  }

  /**
   * ## surrender：处理玩家认输
   *
   * 将对手分数直接设为 VictoryScore，触发 BATTLE OVER。
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

    this.stop();

    // 将对手分数直接设为胜利分数
    store.setScore(winnerId, victoryScore);
    store.setWinner(winner);

    // 更新 HUD
    this.hud.updateScores(winner, loser);

    // 触发整场结束
    this.over(winner, loser);
  }

  /**
   * ## subscribe：订阅对战事件
   *
   * @returns {void}
   */
  subscribe() {
    this.router.subscribe();
  }

  /**
   * ## unsubscribe：取消订阅对战事件
   *
   * @returns {void}
   */
  unsubscribe() {
    this.router.unsubscribe();
  }
}

export default BattleController;
