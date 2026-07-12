import Base from '@/lib/core';
import Sounds from '@/lib/services/audio/sounds.js';
import playBGM from '@/lib/services/audio/play-bgm.js';
import stopBGM from '@/lib/services/audio/stop-bgm.js';
import toggleBGM from '@/lib/services/audio/toggle-bgm.js';
import { AudioEvents } from '@/lib/events/event-catalog.js';
import isFunction from '@/lib/utils/types/is-function.js';

/**
 * ============================================================
 *
 * # 模块：Audio 音频系统
 *
 * ============================================================
 *
 * 游戏音频的统一管理入口， 负责背景音乐和游戏音效的播放控制。 通过事件驱动的方式响应游戏中的音频请求。
 *
 * ## 核心职责
 *
 * - 背景音乐管理：播放、停止、切换背景音乐
 * - 游戏音效管理：根据事件名称动态调用对应音效函数
 * - AudioContext 管理：维护全局唯一的 AudioContext 实例
 *
 * ## 依赖
 *
 * - Sounds：音效函数集合（MOVE、ROTATE、DROP、CLEAR 等）
 * - PlayBGM：背景音乐播放逻辑
 * - StopBGM：背景音乐停止逻辑
 * - ToggleBGM：背景音乐切换逻辑
 *
 * ## 事件映射
 *
 * | 事件               | 方法                 | 说明              |
 * | :----------------- | :------------------- | :---------------- |
 * | audio:resume:bgm   | playBGM(level)       | 播放/恢复背景音乐 |
 * | audio:stop:bgm     | stopBGM()            | 停止背景音乐      |
 * | audio:toggle:bgm   | toggleBGM(level)     | 切换背景音乐      |
 * | audio:resume:sound | Sounds[sound](lines) | 播放指定音效      |
 *
 * @augments Base
 * @class Audio
 */
class Audio extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置对象
   */
  constructor(options) {
    super(options);
    this.initialize(options);
  }

  /**
   * ## initialize：初始化音频系统
   *
   * 创建 AudioContext 和 Sounds 实例。
   *
   * @param {object} options - 配置对象
   * @returns {void}
   */
  initialize(options) {
    /**
     * 全局 AudioContext 实例。
     *
     * 整个游戏共享一个 AudioContext，避免浏览器限制。
     *
     * @type {AudioContext}
     */
    const Context = new AudioContext();

    this.Context = Context;

    /**
     * 音效函数集合。
     *
     * @type {Sounds}
     */
    this.Sounds = new Sounds({
      ...options,
      Context,
    });

    /**
     * 背景音乐调度任务 ID。
     *
     * 用于取消正在播放的背景音乐。
     *
     * @default 0
     * @type {number}
     */
    this.bgmSchedulerId = 0;
  }

  /**
   * ## playBGM：播放背景音乐
   *
   * @param {number} level - 当前游戏等级
   * @returns {void}
   */
  playBGM(level) {
    // 已经开始播放了，就不重复播放
    if (this.bgmSchedulerId !== 0) {
      return;
    }
    playBGM(this, level);
  }

  /**
   * ## stopBGM：停止背景音乐
   *
   * @returns {void}
   */
  stopBGM() {
    stopBGM(this);
  }

  /**
   * ## toggleBGM：切换背景音乐
   *
   * @param {number} level - 当前游戏等级
   * @returns {void}
   */
  toggleBGM(level) {
    toggleBGM(this, level);
  }

  /**
   * ## subscribe：订阅音频事件
   *
   * @returns {void}
   */
  subscribe() {
    const events = AudioEvents();

    // 背景音乐
    this.on(events.RESUME_BGM, this._onPlayBGM);
    this.on(events.STOP_BGM, this._onStopBGM);
    this.on(events.TOGGLE_BGM, this._onToggleBGM);

    // 游戏音效
    this.on(events.PLAY_SOUND, this._onPlaySound);
  }

  /**
   * ## unsubscribe：取消订阅音频事件
   *
   * @returns {void}
   */
  unsubscribe() {
    const events = AudioEvents();

    // 背景音乐
    this.off(events.RESUME_BGM, this._onPlayBGM);
    this.off(events.STOP_BGM, this._onStopBGM);
    this.off(events.TOGGLE_BGM, this._onToggleBGM);

    // 游戏音效
    this.off(events.PLAY_SOUND, this._onPlaySound);
  }

  /**
   * ## _onPlayBGM：处理播放背景音乐事件
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {number} payload.level - 游戏等级
   * @returns {void}
   */
  _onPlayBGM = ({ level }) => {
    this.playBGM(level);
  };

  /**
   * ## _onStopBGM：处理停止背景音乐事件
   *
   * @private
   * @returns {void}
   */
  _onStopBGM = () => {
    this.stopBGM();
  };

  /**
   * ## _onToggleBGM：处理切换背景音乐事件
   *
   * 先播放切换音效，再执行切换逻辑。
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {number} payload.level - 游戏等级
   * @returns {void}
   */
  _onToggleBGM = ({ level }) => {
    const events = AudioEvents();
    // 播放切换音效
    this.emit(events.PLAY_SOUND, { sound: 'BGM_TOGGLED' });
    // 执行切换
    this.toggleBGM(level);
  };

  /**
   * ## _onPlaySound：处理播放音效事件
   *
   * 根据 sound 名称从 Sounds 集合中找到对应的音效函数并执行。
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {string} payload.sound - 音效名称
   * @param {number} [payload.lines] - 消除行数
   * @param {number} [payload.level] - 当前等级
   * @returns {void}
   */
  _onPlaySound = ({ sound, lines, level }) => {
    const { Sounds } = this;
    const handler = Sounds[sound];

    // 只执行有效的音效函数
    if (isFunction(handler)) {
      handler(lines, level);
    }
  };
}

export default Audio;
