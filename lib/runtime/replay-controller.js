import Base from '@/lib/core';
import ReplayRouter from '@/lib/events/router/replay-router.js';
import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * # ReplayController（回放控制器）
 *
 * 回放 / 录制控制器。负责录制玩家的操作指令和方块序列， 并在游戏结束后按时间线回放整个游戏过程。
 *
 * ## 核心功能
 *
 * - **录制**：记录每帧的 Command 和时间戳、方块序列
 * - **回放**：按录制的时间线重放 Command，驱动游戏重现
 * - **快进**：标签页切后台后回来时限制跳跃上限，防止爆帧
 * - **方块序列**：录制时保存方块顺序，确保回放时方块一致
 *
 * ## 设计说明
 *
 * - **事件路由分离**：所有事件订阅/取消订阅委托给 `ReplayRouter`， `ReplayController` 只负责录制/回放的核心业务逻辑
 * - **多实例支持**：设计为 Class，未来 AI 对战可创建多个独立实例， 每个实例维护自己的录制/回放状态与事件绑定
 *
 * ## 核心字段
 *
 * | 字段          | 类型    | 说明                   |
 * | ------------- | ------- | ---------------------- |
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
   * ## 是否有录制的回放数据
   *
   * @returns {boolean} 有回放数据返回 true，否则返回 false
   */
  get hasData() {
    return this.data.length > 0;
  }

  /**
   * ## 构造函数
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   * @param {object} options.Game - 游戏主实例
   * @param {object} options.Store - 游戏状态存储
   * @param {object} options.Scheduler - 任务调度器
   */
  constructor(options) {
    super(options);

    this.initialize();
  }

  /**
   * ## 初始化所有内部状态
   *
   * 重置录制/回放相关的所有标志和数据， 并创建 ReplayRouter 实例处理事件路由。
   *
   * @returns {void}
   */
  initialize() {
    /**
     * ## 是否正在录制
     *
     * @default false
     * @type {boolean}
     */
    this.recording = false;

    /**
     * ## 是否正在回放
     *
     * @default false
     * @type {boolean}
     */
    this.playing = false;

    /**
     * ## 录制数据
     *
     * 数组结构：`[{ ms: number, cmd: Command }]`
     *
     * - `ms`：从录制开始到该命令发生的时间偏移（毫秒）
     * - `cmd`：Command 实例
     *
     * @type {{ ms: number; cmd: object }[]}
     */
    this.data = [];

    /**
     * ## 回放时当前读取到的 data 索引
     *
     * @default 0
     * @type {number}
     */
    this.cursor = 0;

    /**
     * ## 录制的方块序列
     *
     * 用于保证回放时方块顺序与录制时完全一致。
     *
     * @type {object[]}
     */
    this.pieceSequence = [];

    /**
     * ## 回放时当前读取到的方块序列索引
     *
     * @default 0
     * @type {number}
     */
    this.pieceIndex = 0;

    /**
     * ## 回放逻辑时间（毫秒）
     *
     * 独立于 wall-clock 的"回放钟"， 用于按录制时的节奏推进 command。
     *
     * @default 0
     * @type {number}
     */
    this.playElapsed = 0;

    /**
     * ## 录制或回放的起始时间戳
     *
     * 录制时记录第一帧的时间戳， 回放时记录开始回放的时间戳。
     *
     * @default 0
     * @type {number}
     */
    this.startTime = 0;

    /**
     * ## 当前帧的时间戳
     *
     * 由 `update()` 方法每帧更新。
     *
     * @default 0
     * @type {number}
     */
    this.timestamp = 0;

    const { Game } = this;

    /**
     * ## 事件路由器
     *
     * 负责监听所有 `replay:*` 事件并分发到对应方法。
     *
     * @type {ReplayRouter}
     */
    this.Router = new ReplayRouter({
      Replay: this,
      Game,
    });
  }

  /**
   * ## 获取下一个方块
   *
   * 在回放模式下，从录制的方块序列中按顺序读取。 确保回放时的方块顺序与录制时完全一致。
   *
   * @returns {{ curr: object | null; next: object | null }} 当前方块和下一个预览方块
   */
  getNextPiece() {
    // 非回放模式不读取序列
    if (!this.playing) {
      return { curr: null, next: null };
    }

    // 按顺序取出一个方块
    const piece = this.pieceSequence[this.pieceIndex++];

    // 防止索引越界
    if (!piece) {
      return { curr: null, next: null };
    }

    // 预读下一个方块（可能为 null）
    const next = this.pieceSequence[this.pieceIndex] || null;

    return { curr: piece, next };
  }

  /**
   * ## 同步回放逻辑时钟
   *
   * 计算当前 wall-clock 时间与 startTime 的差值作为回放进度。 如果检测到时间跳跃过大（标签页切后台），限制单次跳跃上限为 1 秒，
   * 防止切回后瞬间执行大量 command 导致爆帧。
   *
   * @param {object} ctx - 执行上下文对象
   * @param {number} ctx.timestamp - 当前 requestAnimationFrame 时间戳
   * @param {boolean} ctx.isBlocked - 是否处于暂停/阻塞状态
   * @returns {void}
   */
  syncPlayElapsed({ timestamp, isBlocked }) {
    // 非播放状态或阻塞中跳过
    if (!this.playing || isBlocked) return;

    const prev = this.playElapsed;
    const now = timestamp - this.startTime;
    const delta = now - prev;

    // 时间跳跃超过 1 秒（标签页切后台），限制为最多快进 1 秒
    if (delta > 1000) {
      this.startTime += delta - 1000;
      this.playElapsed = prev + 1000;
    } else {
      this.playElapsed = now;
    }
  }

  /**
   * ## 每帧调用，驱动回放逻辑
   *
   * 执行流程：
   *
   * 1. 更新当前 timestamp
   * 2. 检查是否处于回放状态
   * 3. 检查回放是否完毕（所有 command 已执行）
   * 4. 如有需要，快进跳过长时间等待（标签页切回后）
   * 5. 将所有逻辑时间已到的 command 逐条注入 EventBus
   *
   * @param {object} ctx - 执行上下文对象
   * @param {number} ctx.speed - 当前下落间隔（毫秒），用于快进阈值计算
   * @param {number} ctx.timestamp - 当前 requestAnimationFrame 时间戳
   * @returns {void}
   */
  update({ speed, timestamp }) {
    const { Store, Game, data } = this;
    const mode = Store.getMode();

    // 更新当前帧时间戳
    this.timestamp = timestamp;

    // 非回放状态，直接退出
    if (!this.playing || mode !== 'replay') {
      return;
    }

    const events = GameEvents(Game.id);

    /**
     * ======== 回放完毕：所有 command 都已执行 ========
     *
     * 当 cursor 超出 data 数组长度时，说明所有录制的 command 都已重放完毕。此时停止回放并切换到 game-over 模式。
     */
    if (data.length > 0 && this.cursor >= data.length) {
      this.stopPlay();
      this.emit(events.UPDATE_MODE, { mode: 'game-over' });
      return;
    }

    /**
     * ======== 快进逻辑 ========
     *
     * 如果下一个 command 需要等超过 2 倍下落间隔， 说明中间有暂停/空白（玩家暂停或标签页切后台）。 直接快进到该 command
     * 附近，避免长时间"卡等"。
     */
    const next = data[this.cursor];

    if (next) {
      const interval = speed ?? 1000;
      const gap = next.ms - this.playElapsed;

      if (gap > interval * 2) {
        // 单次最多快进 1 秒，防止瞬间爆帧
        const skip = Math.min(gap - interval, 1000);
        this.playElapsed += skip;
        this.startTime = timestamp - this.playElapsed;
      }
    }

    /**
     * ======== 核心回放循环 ========
     *
     * 将所有逻辑时间 <= playElapsed 的 command 一次性注入 EventBus。 这些 command 会通过
     * dispatchCommand 分发到对应的 action handler 执行。
     */
    while (
      this.playing &&
      this.cursor < data.length &&
      data[this.cursor].ms <= this.playElapsed
    ) {
      const { cmd } = data[this.cursor];

      if (cmd.action === 'HOLD_SYNC') {
        // 不参与游戏逻辑，只用于调试/渲染
        return;
      }

      this.emit(`dispatch:command`, cmd);
      this.cursor++;
    }
  }

  /**
   * ## 开始录制
   *
   * 开启 recording 标志，清空旧数据和方块序列， 将 startTime 设置为当前 timestamp。
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
   * ## 停止录制
   *
   * @returns {void}
   */
  stopRecord() {
    this.recording = false;
  }

  /**
   * ## 开始回放
   *
   * 开启 playing 标志，重置 cursor 和 pieceIndex， 将 startTime 设置为当前 timestamp。
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
   * ## 停止回放
   *
   * @returns {void}
   */
  stopPlay() {
    this.playing = false;
  }

  /**
   * ## 添加一条录制记录
   *
   * 只在 recording 状态下写入数据。
   *
   * @param {object} record - 录制数据 `{ ms, cmd }`
   * @returns {void}
   */
  addRecord(record) {
    if (!this.recording) {
      return;
    }

    this.data.push(record);
  }

  /**
   * ## 添加一个方块到序列
   *
   * 只在 recording 状态下写入，使用深拷贝避免引用污染。
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
   * ## 清除所有数据，重置标志位
   *
   * 注意：不清除事件绑定，仅重置录制/回放相关状态。
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
   * ## 停止录制/回放并清除所有数据
   *
   * 等同于 `stopRecord()` + `stopPlay()` + `clear()`。 通过 `replay:<id>:reset` 事件触发。
   *
   * @returns {void}
   */
  reset() {
    this.stopRecord();
    this.stopPlay();
    this.clear();
  }

  /**
   * ## 绑定所有事件监听
   *
   * 委托给 ReplayRouter 处理。
   *
   * @returns {void}
   */
  subscribe() {
    this.Router.subscribe();
  }

  /**
   * ## 取消绑定所有事件监听
   *
   * 委托给 ReplayRouter 处理。
   *
   * @returns {void}
   */
  unsubscribe() {
    this.Router.unsubscribe();
  }

  /**
   * ## 销毁实例
   *
   * 停止所有录制/回放、清除数据、解绑所有事件。 主要用于 AI 对战切换对手或完全卸载 replay 模块。
   *
   * @returns {void}
   */
  destroy() {
    // 先停止和清空状态
    this.reset();

    // 逐个解绑事件
    this.unsubscribe();
  }
}

export default ReplayController;
