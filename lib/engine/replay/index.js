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
   * ## 当前帧计数（用于标记时间轴）
   *
   * @type {number}
   */
  frame: 0,

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
    this.recording = true;
    this.data = [];
    this.frame = 0;
  },

  /** ## 停止录制 */
  stopRecord() {
    this.recording = false;
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
    this.playing = true;
    this.frame = 0;
    this.cursor = 0;
  },

  /** ## 停止播放 */
  stopPlay() {
    this.playing = false;
  },

  reset() {
    this.recording = false;
    this.playing = false;
    this.frame = 0;
    this.cursor = 0;
    this.data = [];
  },
};

export default Replay;
