import Base from '@/lib/core';
import ReplayRouter from '@/lib/events/router/replay-router.js';
import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 模块：ReplayController 回放控制器
 *
 * ============================================================
 *
 * 回放 / 录制控制器。 负责录制玩家的操作指令和方块序列， 并在游戏结束后按时间线回放整个游戏过程。
 *
 * ## 核心功能
 *
 * - 录制：记录每帧的 Command 和时间戳、方块序列
 * - 回放：按录制的时间线重放 Command，驱动游戏重现
 * - 快进：标签页切后台后回来时限制跳跃上限
 * - 方块序列：录制时保存方块顺序，确保回放时一致
 *
 * ## 设计说明
 *
 * - 事件路由分离：所有事件订阅委托给 ReplayRouter
 * - 多实例支持：设计为 Class，每个实例维护独立状态
 *
 * ## 核心字段
 *
 * | 字段          | 类型    | 说明                   |
 * | :------------ | :------ | :--------------------- |
 * | recording     | boolean | 是否正在录制           |
 * | playing       | boolean | 是否正在回放           |
 * | data          | Array   | 录制数据 [{ ms, cmd }] |
 * | cursor        | number  | 回放读取位置           |
 * | pieceSequence | Array   | 方块序列               |
 * | pieceIndex    | number  | 方块序列读取位置       |
 * | playElapsed   | number  | 回放逻辑时间           |
 * | startTime     | number  | 录制/回放起始时间戳    |
 * | timestamp     | number  | 当前帧时间戳           |
 *
 * @augments Base
 * @class ReplayController
 */
class ReplayController extends Base {
  /**
   * ## hasData：是否有录制的回放数据
   *
   * @returns {boolean} 有回放数据返回 true
   */
  get hasData() {
    return this.data.length > 0;
  }

  /**
   * ## 构造函数
   *
   * @param {object} options - 配置对象
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## initialize：初始化所有内部状态
   *
   * 重置录制/回放相关的所有标志和数据， 创建 ReplayRouter 实例处理事件路由。
   *
   * @returns {void}
   */
  initialize() {
    /**
     * 是否正在录制。
     *
     * @default false
     * @type {boolean}
     */
    this.recording = false;

    /**
     * 是否正在回放。
     *
     * @default false
     * @type {boolean}
     */
    this.playing = false;

    /**
     * 录制数据。
     *
     * 数组结构：[{ ms: number, cmd: Command }]
     *
     * @type {{ ms: number; cmd: object }[]}
     */
    this.data = [];

    /**
     * 回放时当前读取到的 data 索引。
     *
     * @default 0
     * @type {number}
     */
    this.cursor = 0;

    /**
     * 录制的方块序列。
     *
     * @type {object[]}
     */
    this.pieceSequence = [];

    /**
     * 回放时当前读取到的方块序列索引。
     *
     * @default 0
     * @type {number}
     */
    this.pieceIndex = 0;

    /**
     * 回放逻辑时间（毫秒）。
     *
     * @default 0
     * @type {number}
     */
    this.playElapsed = 0;

    /**
     * 录制或回放的起始时间戳。
     *
     * @default 0
     * @type {number}
     */
    this.startTime = 0;

    /**
     * 当前帧的时间戳。
     *
     * @default 0
     * @type {number}
     */
    this.timestamp = 0;

    const { Game } = this;

    /**
     * 事件路由器。
     *
     * @type {ReplayRouter}
     */
    this.Router = new ReplayRouter({
      Replay: this,
      Game,
    });
  }

  /**
   * ## getNextPiece：获取下一个方块
   *
   * 在回放模式下，从录制的方块序列中按顺序读取。
   *
   * @returns {{ curr: object | null; next: object | null }} 当前方块和下一个预览方块
   */
  getNextPiece() {
    if (!this.playing) {
      return { curr: null, next: null };
    }

    const piece = this.pieceSequence[this.pieceIndex++];

    if (!piece) {
      return { curr: null, next: null };
    }

    const next = this.pieceSequence[this.pieceIndex] || null;

    return { curr: piece, next };
  }

  /**
   * ## syncPlayElapsed：同步回放逻辑时钟
   *
   * 计算当前 wall-clock 时间与 startTime 的差值作为回放进度。 时间跳跃超过 1 秒时限制为最多快进 1 秒。
   *
   * @param {object} ctx - 执行上下文对象
   * @param {number} ctx.timestamp - 当前时间戳
   * @param {boolean} ctx.isBlocked - 是否处于暂停/阻塞状态
   * @returns {void}
   */
  syncPlayElapsed({ timestamp, isBlocked }) {
    if (!this.playing || isBlocked) return;

    const prev = this.playElapsed;
    const now = timestamp - this.startTime;
    const delta = now - prev;

    if (delta > 1000) {
      this.startTime += delta - 1000;
      this.playElapsed = prev + 1000;
    } else {
      this.playElapsed = now;
    }
  }

  /**
   * ## update：每帧调用，驱动回放逻辑
   *
   * 执行流程：
   *
   * 1. 更新当前 timestamp
   * 2. 检查回放是否完毕
   * 3. 快进跳过长时间等待
   * 4. 将所有逻辑时间已到的 command 逐条注入
   *
   * @param {object} ctx - 执行上下文对象
   * @param {number} ctx.speed - 当前下落间隔（毫秒）
   * @param {number} ctx.timestamp - 当前时间戳
   * @returns {void}
   */
  update({ speed, timestamp }) {
    const { Store, Game, data } = this;
    const mode = Store.getMode();

    this.timestamp = timestamp;

    if (!this.playing || mode !== 'replay') {
      return;
    }

    const events = GameEvents(Game.id);

    // 回放完毕：所有 command 都已执行
    if (data.length > 0 && this.cursor >= data.length) {
      this.stopPlay();
      this.emit(events.UPDATE_MODE, { mode: 'game-over' });
      return;
    }

    // 快进逻辑：跳过长时间等待
    const next = data[this.cursor];

    if (next) {
      const interval = speed ?? 1000;
      const gap = next.ms - this.playElapsed;

      if (gap > interval * 2) {
        const skip = Math.min(gap - interval, 1000);
        this.playElapsed += skip;
        this.startTime = timestamp - this.playElapsed;
      }
    }

    // 核心回放循环
    while (
      this.playing &&
      this.cursor < data.length &&
      data[this.cursor].ms <= this.playElapsed
    ) {
      const { cmd } = data[this.cursor];

      if (cmd.action === 'HOLD_SYNC') {
        return;
      }

      this.emit(events.DISPATCH_COMMAND, cmd);
      this.cursor++;
    }
  }

  /**
   * ## startRecord：开始录制
   *
   * @returns {void}
   */
  startRecord() {
    this.recording = true;
    this.data = [];
    this.pieceSequence = [];
    this.pieceIndex = 0;
    this.playElapsed = 0;
    this.startTime = this.timestamp;
  }

  /**
   * ## stopRecord：停止录制
   *
   * @returns {void}
   */
  stopRecord() {
    this.recording = false;
  }

  /**
   * ## startPlay：开始回放
   *
   * @returns {void}
   */
  startPlay() {
    this.playing = true;
    this.cursor = 0;
    this.pieceIndex = 0;
    this.startTime = this.timestamp;
  }

  /**
   * ## stopPlay：停止回放
   *
   * @returns {void}
   */
  stopPlay() {
    this.playing = false;
  }

  /**
   * ## addRecord：添加一条录制记录
   *
   * 只在 recording 状态下写入。
   *
   * @param {object} record - 录制数据 { ms, cmd }
   * @returns {void}
   */
  addRecord(record) {
    if (!this.recording) {
      return;
    }

    this.data.push(record);
  }

  /**
   * ## addPiece：添加一个方块到序列
   *
   * 只在 recording 状态下写入，使用深拷贝。
   *
   * @param {object} piece - 方块数据
   * @returns {void}
   */
  addPiece(piece) {
    if (!this.recording) {
      return;
    }

    this.pieceSequence.push(structuredClone(piece));
  }

  /**
   * ## clear：清除所有数据，重置标志位
   *
   * 注意：不清除事件绑定。
   *
   * @returns {void}
   */
  clear() {
    this.recording = false;
    this.playing = false;
    this.cursor = 0;
    this.data = [];
    this.pieceSequence = [];
    this.pieceIndex = 0;
    this.startTime = 0;
  }

  /**
   * ## reset：停止录制/回放并清除所有数据
   *
   * @returns {void}
   */
  reset() {
    this.stopRecord();
    this.stopPlay();
    this.clear();
  }

  /**
   * ## subscribe：绑定所有事件监听
   *
   * 委托给 ReplayRouter 处理。
   *
   * @returns {void}
   */
  subscribe() {
    this.Router.subscribe();
  }

  /**
   * ## unsubscribe：取消绑定所有事件监听
   *
   * 委托给 ReplayRouter 处理。
   *
   * @returns {void}
   */
  unsubscribe() {
    this.Router.unsubscribe();
  }

  /**
   * ## destroy：销毁实例
   *
   * 停止所有录制/回放、清除数据、解绑所有事件。
   *
   * @returns {void}
   */
  destroy() {
    this.reset();
    this.unsubscribe();
  }
}

export default ReplayController;
