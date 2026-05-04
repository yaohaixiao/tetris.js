/**
 * # Replay 系统（回放 / 录制控制器）
 *
 * 用于记录和回放玩家操作（Command / Input）， 支持基本的：
 *
 * - 录制（record）
 * - 播放（play）
 *
 * 当前为轻量实现：
 *
 * - 单实例
 * - 无时间轴精度控制（基于 frame）
 * - 无暂停 / seek / speed 控制
 *
 * 核心字段说明：
 *
 * - Recording：是否正在录制
 * - Playing：是否正在播放
 * - Frame：当前帧计数（录制 / 播放共用）
 * - Data：录制的数据（通常是 command 列表）
 * - Cursor：播放时的读取位置
 */
const Replay = {
  /**
   * ## 是否正在录制
   *
   * @type {boolean}
   */
  recording: false,

  /**
   * ## 是否正在播放
   *
   * @type {boolean}
   */
  playing: false,

  /**
   * ## 录制的数据列表：
   *
   * 一般结构类似：[{ frame: number, command: Command }]
   *
   * @type {Array}
   */
  data: [],

  /**
   * ## 播放游标（当前播放到 data 的位置）
   *
   * @type {number}
   */
  cursor: 0,

  // 用来存本局的方块顺序
  pieceSequence: [],

  pieceIndex: 0,

  // 记录开始录像或者开发回放的起始时间
  startTime: 0,

  // 记录按下暂停的那一刻
  pauseStartTime: 0,

  // 记录这局游戏累计暂停了多少毫秒
  totalPausedTime: 0,

  /**
   * ## 判断当前是否有录制的数据
   *
   * @returns {boolean} - Replay.data 有数据，返回 true，否则返回 false
   */
  get hasData() {
    // 判断 data 存在，且里面至少有一条有效的操作数据
    return Array.isArray(Replay.data) && Replay.data.length > 0;
  },

  /**
   * ## 开始录制
   *
   * 行为：
   *
   * - 打开 recording 状态
   * - 清空已有数据
   * - 重置 frame
   *
   * @param {number} now - 当前时间的时间戳数值
   */
  startRecord(now) {
    Replay.recording = true;
    Replay.data = [];
    // 确保每次开始，序列都清空！
    Replay.pieceSequence = [];
    Replay.pieceIndex = 0;
    Replay.startTime = now;
    Replay.pauseStartTime = 0;
    Replay.totalPausedTime = 0;
  },

  /** ## 停止录制 */
  stopRecord() {
    Replay.recording = false;
  },

  /**
   * ## 开始播放
   *
   * 行为：
   *
   * - 打开 playing 状态
   * - 重置 frame
   * - 重置 cursor
   *
   * @param {number} now - 当前时间的时间戳数值
   */
  startPlay(now) {
    Replay.playing = true;
    Replay.cursor = 0;
    Replay.pieceIndex = 0;
    Replay.startTime = now;
  },

  /** ## 停止播放 */
  stopPlay() {
    Replay.playing = false;
  },

  /**
   * # Replay 更新函数（播放逻辑驱动）
   *
   * 用于在游戏主循环中驱动 replay 播放：
   *
   * - 根据时间推进 replay
   * - 将录制的 command 按时间顺序注入输入系统
   * - 控制 replay 结束状态
   *
   * @param {number} timestamp - 当前引擎时间戳（来自 game loop）
   * @param {Function} dispatchInput - 输入分发函数（用于模拟玩家输入）
   * @param {Function} setMode - 设置游戏模式（例如 game-over）
   */
  update(timestamp, dispatchInput, setMode) {
    // 如果当前不处于 replay 播放状态，直接退出
    if (!Replay.playing) {
      return;
    }

    /**
     * ## 计算 replay 已经播放的“逻辑时间”
     *
     * 使用：
     * - 当前时间戳
     * - replay 开始时间
     * - 暂停累计时间（避免暂停影响时间轴）
     *
     * 得到一个“纯净的 replay 时间轴”
     */
    const elapsedTime =
      timestamp - Replay.startTime - (Replay.totalPausedTime || 0);

    const { data } = Replay;

    /**
     * ## 判断 replay 是否播放结束
     *
     * 条件：
     * - 有数据
     * - cursor 已经走到数据末尾
     */
    if (data.length > 0 && Replay.cursor >= data.length) {
      // 切换游戏状态为结束
      setMode('game-over');

      // 停止 replay 播放
      Replay.stopPlay();
    }

    /**
     * ## 核心播放循环（按时间推进）
     *
     * 将所有“时间已到”的 command 逐个执行：
     *
     * 条件：
     * - replay 仍在播放
     * - cursor 没有越界
     * - 当前 command 的时间 <= elapsedTime
     */
    while (
      Replay.playing &&
      Replay.cursor < data.length &&
      data[Replay.cursor].ms <= elapsedTime
      ) {
      const { cmd } = data[Replay.cursor];

      /**
       * ## 将 replay command 注入输入系统
       *
       * 这里的本质是：
       * - 把“历史输入”伪装成“实时输入”
       * - 统一走 dispatchInput 管线
       */
      dispatchInput({
        device: 'replay',
        action: cmd.action,
        payload: cmd.payload,
      });

      // 移动 replay 指针
      Replay.cursor++;
    }
  },

  reset() {
    Replay.recording = false;
    Replay.playing = false;
    Replay.cursor = 0;
    Replay.data = [];
    Replay.pieceSequence = [];
    Replay.pieceIndex = 0;
    Replay.startTime = 0;
    Replay.pauseStartTime = 0;
    Replay.totalPausedTime = 0;
  },
};

export default Replay;
