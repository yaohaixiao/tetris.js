import Base from '@/lib/core/index.js';
import { AudioEvents } from '@/lib/events/event-catalog.js';
import isFunction from '@/lib/utils/types/is-function.js';

/**
 * ============================================================
 *
 * # 模块：AudioRouter 音频事件路由器
 *
 * ============================================================
 *
 * 负责处理音频相关的事件路由， 将背景音乐和音效事件分发到 Audio 实例。
 *
 * ## 核心职责
 *
 * | 职责     | 说明                                               |
 * | :------- | :------------------------------------------------- |
 * | 事件订阅 | 在 subscribe() 中注册音频事件的处理器              |
 * | 事件取消 | 在 unsubscribe() 中移除所有已注册的处理器          |
 * | 事件路由 | 将背景音乐/音效事件路由到 Audio 实例对应方法       |
 * | 参数转换 | 从事件 payload 中提取参数，调用 Audio 实例对应方法 |
 *
 * ## 处理的音频事件
 *
 * | 事件名           | 触发时机           | 处理器        | 说明                        |
 * | :--------------- | :----------------- | :------------ | :-------------------------- |
 * | audio:resume:bgm | 需要播放背景音乐时 | \_onPlayBGM   | 根据等级播放对应曲目        |
 * | audio:stop:bgm   | 需要停止背景音乐时 | \_onStopBGM   | 停止当前背景音乐播放        |
 * | audio:toggle:bgm | 切换背景音乐时     | \_onToggleBGM | 先播放切换音效，再执行切换  |
 * | audio:play:sound | 需要播放音效时     | \_onPlaySound | 根据 sound 名称调用对应音效 |
 *
 * @augments Base
 * @class AudioRouter
 */
class AudioRouter extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置选项
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## subscribe：订阅音频事件
   *
   * 绑定背景音乐和音效相关的事件监听。
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
   * 当收到 audio:resume:bgm 事件时调用， 根据传入的等级播放对应的背景音乐曲目。
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {number} payload.level - 游戏等级
   * @returns {void}
   */
  _onPlayBGM = ({ level }) => {
    const { Audio } = this;
    Audio.playBGM(level);
  };

  /**
   * ## _onStopBGM：处理停止背景音乐事件
   *
   * 当收到 audio:stop:bgm 事件时调用， 停止当前正在播放的背景音乐。
   *
   * @private
   * @returns {void}
   */
  _onStopBGM = () => {
    const { Audio } = this;
    Audio.stopBGM();
  };

  /**
   * ## _onToggleBGM：处理切换背景音乐事件
   *
   * 当收到 audio:toggle:bgm 事件时调用， 先播放切换音效，再执行背景音乐的开启/关闭切换。
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {number} payload.level - 游戏等级
   * @returns {void}
   */
  _onToggleBGM = ({ level }) => {
    const { Audio } = this;
    const events = AudioEvents();
    // 播放切换音效
    this.emit(events.PLAY_SOUND, { sound: 'BGM_TOGGLED' });
    // 执行切换
    Audio.toggleBGM(level);
  };

  /**
   * ## _onPlaySound：处理播放音效事件
   *
   * 当收到 audio:play:sound 事件时调用， 根据 sound 名称从 Sounds 集合中找到对应的音效函数并执行。
   *
   * @private
   * @param {object} payload - 事件参数
   * @param {string} payload.sound - 音效名称（如 MOVE、ROTATE、CLEAR 等）
   * @param {number} [payload.lines] - 消除行数（消行音效专用）
   * @param {number} [payload.level] - 当前等级（消行音效专用）
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

export default AudioRouter;
