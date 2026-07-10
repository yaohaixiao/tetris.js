import Base from '@/lib/core';
import {
  AudioEvents,
  AIEvents,
  GameEvents,
  ReplayEvents,
  UIEvents,
} from '@/lib/events/event-catalog.js';

/*
 * ============================================================
 * # 模块：ReplayRouter 回放事件路由器
 * ============================================================
 *
 * ## 功能描述
 *
 * 负责处理所有与回放系统相关的事件路由。
 * 作为 ReplayController 和游戏事件系统之间的桥梁，将外部事件转换为对
 * ReplayController 的方法调用。
 *
 * ## 核心职责
 *
 * - **事件监听**：监听所有 `replay:*` 命名空间的事件
 * - **事件分发**：根据事件类型调用 ReplayController 的相应方法
 * - **流程协调**：在游戏结束、消行等关键时刻协调回放系统的行为
 *
 * ## 设计说明
 *
 * - **职责分离**：将事件路由逻辑从 ReplayController 中分离出来，保持控制器专注于核心业务逻辑
 * - **事件集中管理**：所有回放相关的事件处理逻辑都集中在此类中，便于维护和理解
 * - **状态感知**：根据回放状态和游戏状态智能决定是否响应某些事件
 *
 * ## 处理的事件类型
 *
 * | 事件类别 | 事件名称 | 处理方法 | 说明 |
 * | :--- | :--- | :--- | :--- |
 * | 录制操作 | START_RECORD | `_onStartRecord` | 开始录制游戏过程 |
 * | 录制操作 | STOP_RECORD | `_onStopRecord` | 停止录制游戏过程 |
 * | 录制操作 | ADD_RECORD | `_onAddRecord` | 添加一条操作记录 |
 * | 录制操作 | ADD_PIECE | `_onAddPiece` | 添加一个方块到序列 |
 * | 回放操作 | START_PLAY | `_onStartPlay` | 开始回放游戏过程 |
 * | 回放操作 | RESET | `_onReset` | 重置回放系统 |
 * | 流程控制 | GAME_OVER | `_onGameOver` | 游戏结束时的处理 |
 * | 流程控制 | STOP_CLEAR_LINES | `_onStopClearLines` | 消行结束时的处理 |
 *
 * @augments Base
 * @class ReplayRouter
 */
class ReplayRouter extends Base {
  /**
   * ## 构造函数
   *
   * 创建 ReplayRouter 实例。 注意：构造函数不会自动订阅事件，需要手动调用 `subscribe()`。
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.Replay - ReplayController 实例
   */
  constructor(options) {
    super(options);
    // 事件绑定在外部手动调用，保持初始化的灵活性
  }

  /**
   * ## subscribe：绑定所有事件监听
   *
   * 在游戏初始化时调用一次。 注册所有回放系统需要监听的游戏事件。
   *
   * ### 监听的事件分类
   *
   * 1. **录制操作事件**：开始录制、停止录制、添加记录、添加方块
   * 2. **回放操作事件**：开始回放、重置回放
   * 3. **流程控制事件**：游戏结束、消行完成
   *
   * @returns {void}
   */
  subscribe() {
    const { Game } = this;
    // 获取回放系统的事件名称（带游戏 ID 命名空间）
    const events = ReplayEvents(Game.id);

    /* ---------- 录制操作 ---------- */
    // 开始录制游戏过程
    this.on(events.START_RECORD, this._onStartRecord);
    // 停止录制游戏过程
    this.on(events.STOP_RECORD, this._onStopRecord);
    // 添加一条操作命令记录
    this.on(events.ADD_RECORD, this._onAddRecord);
    // 添加一个方块到序列
    this.on(events.ADD_PIECE, this._onAddPiece);

    /* ---------- 回放操作 ---------- */
    // 开始回放游戏过程
    this.on(events.START_PLAY, this._onStartPlay);
    // 重置回放系统（清除所有数据）
    this.on(events.RESET, this._onReset);

    /* ---------- 流程控制 ---------- */
    // 游戏结束时的处理（准备回放或进入结束界面）
    this.on(events.GAME_OVER, this._onGameOver);
    // 消行结束时的处理（处理升级音效和特效）
    this.on(events.STOP_CLEAR_LINES, this._onStopClearLines);
  }

  /**
   * ## unsubscribe：取消绑定所有事件监听
   *
   * 移除所有已注册的事件监听器。 在组件销毁或不需要响应回放事件时调用，避免内存泄漏。
   *
   * @returns {void}
   */
  unsubscribe() {
    const { Game } = this;
    // 获取回放系统的事件名称（带游戏 ID 命名空间）
    const events = ReplayEvents(Game.id);

    /* ---------- 录制操作 ---------- */
    this.off(events.START_RECORD, this._onStartRecord);
    this.off(events.STOP_RECORD, this._onStopRecord);
    this.off(events.ADD_RECORD, this._onAddRecord);
    this.off(events.ADD_PIECE, this._onAddPiece);

    /* ---------- 回放操作 ---------- */
    this.off(events.START_PLAY, this._onStartPlay);
    this.off(events.RESET, this._onReset);

    /* ---------- 流程控制 ---------- */
    this.off(events.GAME_OVER, this._onGameOver);
    this.off(events.STOP_CLEAR_LINES, this._onStopClearLines);
  }

  // ==================== 事件处理器（私有） ====================

  /**
   * ## _onStartRecord：开始录制
   *
   * 当接收到 `START_RECORD` 事件时触发。 调用 ReplayController 的 `startRecord()`
   * 方法开始录制游戏过程。
   *
   * @private
   * @returns {void}
   */
  _onStartRecord = () => {
    const { Replay } = this;
    Replay.startRecord();
  };

  /**
   * ## _onStopRecord：停止录制
   *
   * 当接收到 `STOP_RECORD` 事件时触发。 调用 ReplayController 的 `stopRecord()` 方法停止录制游戏过程。
   *
   * @private
   * @returns {void}
   */
  _onStopRecord = () => {
    const { Replay } = this;
    Replay.stopRecord();
  };

  /**
   * ## _onAddRecord：录制一条 command
   *
   * 当接收到 `ADD_RECORD` 事件时触发。 只在 recording 状态下写入，非录制状态自动忽略。
   *
   * @private
   * @param {object} record - 录制数据对象
   * @param {number} record.ms - 从录制开始到该命令的时间偏移（毫秒）
   * @param {object} record.cmd - Command 命令对象
   * @returns {void}
   */
  _onAddRecord = (record) => {
    const { Replay } = this;
    Replay.addRecord(record);
  };

  /**
   * ## _onAddPiece：录制一个方块
   *
   * 当接收到 `ADD_PIECE` 事件时触发。 只在 recording 状态下写入，使用深拷贝避免引用污染。
   *
   * @private
   * @param {object} piece - 方块数据对象（包含形状、颜色、位置等信息）
   * @returns {void}
   */
  _onAddPiece = (piece) => {
    const { Replay } = this;
    Replay.addPiece(piece);
  };

  /**
   * ## _onStartPlay：开始回放
   *
   * 当接收到 `START_PLAY` 事件时触发。 调用 ReplayController 的 `startPlay()` 方法开始回放游戏过程。
   *
   * @private
   * @returns {void}
   */
  _onStartPlay = () => {
    const { Replay } = this;
    Replay.startPlay();
  };

  /**
   * ## _onReset：重置回放系统
   *
   * 当接收到 `RESET` 事件时触发。 调用 ReplayController 的 `reset()` 方法停止录制/回放并清除所有数据。
   *
   * @private
   * @returns {void}
   */
  _onReset = () => {
    const { Replay } = this;
    Replay.reset();
  };

  /**
   * ## _onGameOver：游戏结束时的处理
   *
   * 当接收到 `GAME_OVER` 事件时触发。
   *
   * ### 处理逻辑
   *
   * - **有回放数据**：准备棋盘进入回放模式
   *
   *   - 停止 AI 控制
   *   - 触发 `REPLAY_PREPARE` 事件，传递下一个方块信息
   * - **无回放数据**：直接进入 game-over 状态
   *
   *   - 触发 UI 模式更新事件
   *   - 触发游戏模式更新事件
   *
   * @private
   * @returns {void}
   */
  _onGameOver = () => {
    const { Replay, Game } = this;
    const uuid = Game.id;
    const AE = AIEvents(uuid);
    const GE = GameEvents(uuid);
    const UE = UIEvents(uuid);

    // 检查是否有录制的回放数据
    if (Replay.hasData) {
      // 单人模式，游戏结束，更新游戏时长等统计数据。
      this.emit(GE.UPDATE_RECORDS, { mode: 'single' });
      // 有回放数据：停止 AI 控制
      this.emit(AE.STOP);
      // 准备回放棋盘，传递下一个方块信息
      this.emit(GE.REPLAY_PREPARE, {
        nextPiece: Replay.getNextPiece(),
      });
    } else {
      // 无回放数据：直接进入游戏结束界面
      this.emit(UE.UPDATE_MODE, { mode: 'game-over' });
      this.emit(GE.UPDATE_MODE, { mode: 'game-over' });
    }
  };

  /**
   * ## _onStopClearLines：消行结束时的处理
   *
   * 当接收到 `STOP_CLEAR_LINES` 事件时触发。
   *
   * ### 处理逻辑
   *
   * 回放中不触发升级提示音/动画；录制或正常游戏中升级时触发。
   *
   * @private
   * @param {object} param - 参数对象
   * @param {boolean} param.isLevelUp - 是否升级
   * @param {number} param.level - 当前等级（升级后的新等级）
   * @returns {void}
   */
  _onStopClearLines = ({ isLevelUp, level }) => {
    const { Game, Replay } = this;

    // 只在升级且非回放状态下触发升级效果
    if (!isLevelUp || Replay.playing) {
      return;
    }

    const AE = AudioEvents();
    const GE = GameEvents(Game.id);

    // 非对战模式才播放升级音效
    if (!Game.isVersus()) {
      // 暂停当前背景音乐，为升级音效让路
      this.emit(AE.STOP_BGM);
      // 播放升级音效
      this.emit(AE.PLAY_SOUND, { sound: 'LEVEL_UP' });
      // 触发升级特效动画
      this.emit(GE.START_LEVEL_UP, { level });
    }
  };
}

export default ReplayRouter;
