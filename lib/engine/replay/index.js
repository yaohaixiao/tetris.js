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
   */
  startRecord() {
    Replay.recording = true;
    Replay.data = [];
    // 确保每次开始，序列都清空！
    Replay.pieceSequence = [];
    Replay.pieceIndex = 0;
    Replay.startTime = Date.now();
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
   */
  startPlay() {
    Replay.playing = true;
    Replay.cursor = 0;
    Replay.pieceIndex = 0;
  },

  /** ## 停止播放 */
  stopPlay() {
    Replay.playing = false;
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
