import EventBus from '@/lib/core/event-bus';

/**
 * # ReplayController
 *
 * 回放 / 录制控制器。
 *
 * 支持：
 *
 * - 录制玩家操作（command）
 * - 回放录制的操作
 * - 快进追赶（标签页切换后防止爆帧）
 * - 方块序列的录制与回放
 *
 * 设计为 Class，未来 AI 对战可创建多个独立实例， 每个实例维护自己的录制/回放状态与事件绑定。
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
 */
class ReplayController {
  /** ## 是否正在录制 */
  recording = false;

  /** ## 是否正在回放 */
  playing = false;

  /**
   * ## 录制数据
   *
   * 结构 [{ ms: number, cmd: Command }]
   */
  data = [];

  /** ## 回放时当前读取到的 data 索引 */
  cursor = 0;

  /**
   * ## 录制的方块序列
   *
   * 用于保证回放时方块顺序一致
   */
  pieceSequence = [];

  /** ## 回放时当前读取到的方块序列索引 */
  pieceIndex = 0;

  /**
   * ## 回放逻辑时间（ms）
   *
   * 独立于 wall-clock 的"回放钟"，用于按录制时的节奏推进 command。
   */
  playElapsed = 0;

  /** ## 录制或回放的起始时间戳 */
  startTime = 0;

  /**
   * ## 当前帧时间戳
   *
   * 由 update() 每帧更新
   */
  timestamp = 0;

  /**
   * ## 是否有录制的回放数据。
   *
   * @returns {boolean} - 有回放数据，返回 true，否则返回 false
   */
  get hasData() {
    return this.data.length > 0;
  }

  /**
   * ## 开始录制
   *
   * 行为：
   *
   * - 开启 recording 标志
   * - 清空旧数据和方块序列
   * - 将 startTime 设置为当前 timestamp
   */
  startRecord() {
    this.recording = true;
    this.data = [];
    this.pieceSequence = [];
    this.pieceIndex = 0;
    this.playElapsed = 0;
    this.startTime = this.timestamp;
  }

  /** ## 停止录制 */
  stopRecord() {
    this.recording = false;
  }

  /**
   * ## 开始回放
   *
   * 行为：
   *
   * - 开启 playing 标志
   * - 重置 cursor 和 pieceIndex
   * - 将 startTime 设置为当前 timestamp
   */
  startPlay() {
    this.playing = true;
    this.cursor = 0;
    this.pieceIndex = 0;
    this.startTime = this.timestamp;
  }

  /** ## 停止回放 */
  stopPlay() {
    this.playing = false;
  }

  /**
   * ## 同步回放逻辑时钟。
   *
   * 计算当前 wall-clock 时间与 startTime 的差值作为回放进度。 如果检测到时间跳跃过大（标签页切后台），限制单次跳跃上限。
   *
   * @param {object} ctx - 执行上下文对象
   * @param {number} ctx.timestamp - 当前 requestAnimationFrame 时间戳
   * @param {boolean} ctx.isBlocked - 是否处于暂停/阻塞状态
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
   * 2. 检查回放是否结束
   * 3. 如有需要，快进跳过长时间等待（标签页切回后）
   * 4. 将所有逻辑时间已到的 command 逐条注入 EventBus
   *
   * @param {object} ctx - 执行上下文对象
   * @param {Function} ctx.getSpeed - 获取当前下落间隔（ms），用于快进阈值计算
   * @param {number} ctx.timestamp - 当前 requestAnimationFrame 时间戳
   */
  update({ getSpeed, timestamp }) {
    this.timestamp = timestamp;

    // 非回放状态，直接退出
    if (!this.playing) return;

    const { data } = this;

    // 回放完毕：所有 command 都已执行
    if (data.length > 0 && this.cursor >= data.length) {
      this.stopPlay();
      EventBus.emit('game:update:mode', { mode: 'game-over' });
      return;
    }

    /*
     * ---- 快进逻辑 ----
     * 如果下一个 command 需要等超过 2 倍下落间隔，说明中间有暂停/空白
     * 直接快进到该 command 附近，避免标签页切回后长时间"卡等"
     */
    const next = data[this.cursor];

    if (next) {
      const interval = getSpeed?.() ?? 1000;
      const gap = next.ms - this.playElapsed;

      if (gap > interval * 2) {
        // 单次最多快进 1 秒，防止瞬间爆帧
        const skip = Math.min(gap - interval, 1000);
        this.playElapsed += skip;
        this.startTime = timestamp - this.playElapsed;
      }
    }

    /* ---- 核心回放循环 ---- */
    // 将所有逻辑时间 <= playElapsed 的 command 一次性注入
    while (
      this.playing &&
      this.cursor < data.length &&
      data[this.cursor].ms <= this.playElapsed
    ) {
      EventBus.emit('dispatch:command', data[this.cursor].cmd);
      this.cursor++;
    }
  }

  /**
   * ## 清除所有数据，重置标志位。
   *
   * 注意：不清除事件绑定，仅重置录制/回放相关状态。
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
   * ## 停止录制/回放并清除所有数据。
   *
   * 等同于 stopRecord() + stopPlay() + clear()。
   */
  reset() {
    this.stopRecord();
    this.stopPlay();
    this.clear();
  }

  /**
   * ## 绑定所有事件监听
   *
   * 在游戏初始化时调用一次。
   */
  subscribe() {
    EventBus.on('replay:start:record', this._onStartRecord);
    EventBus.on('replay:stop:record', this._onStopRecord);
    EventBus.on('replay:add:record', this._onAddRecord);
    EventBus.on('replay:add:piece', this._onAddPiece);
    EventBus.on('replay:start:play', this._onStartPlay);
    EventBus.on('replay:reset', this._onReset);
    EventBus.on('replay:game:over', this._onGameOver);
    EventBus.on('replay:stop:clear:lines', this._onClearLines);
  }

  /**
   * ## 销毁实例
   *
   * 停止所有录制/回放、清除数据、解绑所有事件。 主要用于 AI 对战切换对手或完全卸载 replay 模块。
   */
  destroy() {
    // 先停止和清空状态
    this.reset();

    // 逐个解绑事件
    EventBus.off('replay:start:record', this._onStartRecord);
    EventBus.off('replay:stop:record', this._onStopRecord);
    EventBus.off('replay:add:record', this._onAddRecord);
    EventBus.off('replay:add:piece', this._onAddPiece);
    EventBus.off('replay:start:play', this._onStartPlay);
    EventBus.off('replay:reset', this._onReset);
    EventBus.off('replay:game:over', this._onGameOver);
    EventBus.off('replay:stop:clear:lines', this._onClearLines);
  }

  /** @private */
  _onStartRecord = () => {
    this.startRecord();
  };

  /** @private */
  _onStopRecord = () => {
    this.stopRecord();
  };

  /**
   * ## 录制一条 command
   *
   * 只在 recording 状态下写入。
   *
   * @private
   * @param {object} record - { ms, cmd }
   */
  _onAddRecord = (record) => {
    if (!this.recording) {
      return;
    }
    this.data.push(record);
  };

  /**
   * ## 录制一个方块。
   *
   * 只在 recording 状态下写入，使用深拷贝避免引用污染。
   *
   * @private
   * @param {object} piece - 方块数据
   */
  _onAddPiece = (piece) => {
    if (!this.recording) {
      return;
    }
    this.pieceSequence.push(structuredClone(piece));
  };

  /** @private */
  _onStartPlay = () => {
    this.startPlay();
  };

  /** @private */
  _onReset = () => {
    this.reset();
  };

  /**
   * ## 游戏结束时的处理。
   *
   * - 有回放数据：准备棋盘进入回放
   * - 无回放数据：直接进入 game-over 状态
   *
   * @private
   */
  _onGameOver = () => {
    if (this.hasData) {
      EventBus.emit('game:replay:prepare:board');
    } else {
      EventBus.emit('ui:update:mode', { mode: 'game-over' });
      EventBus.emit('game:update:mode', { mode: 'game-over' });
    }
  };

  /**
   * ## 消行时的处理
   *
   * 回放中不触发升级提示音/动画；录制或正常游戏中升级时触发。
   *
   * @private
   * @param {object} param - 参数对象
   * @param {boolean} param.isLevelUp - 是否升级
   * @param {number} param.level - 当前等级
   */
  _onClearLines = ({ isLevelUp, level }) => {
    if (!isLevelUp || this.playing) {
      return;
    }

    // 暂停当前 BGM
    EventBus.emit('audio:stop:bgm');
    // 播放升级音效
    EventBus.emit('audio:sounds:level:up');
    // 触发升级特效
    EventBus.emit('effects:start:level:up', { level });
  };
}

/**
 * 单例导出，兼容现有代码。
 *
 * 后续 AI 对战时可直接 `new ReplayController()` 创建独立实例。
 */
export default new ReplayController();
