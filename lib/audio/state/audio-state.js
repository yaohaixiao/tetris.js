/**
 * # 全局音频状态管理对象
 *
 * 用于控制游戏中的音频系统状态，例如：
 *
 * - BGM（背景音乐）开关
 * - BGM 定时器（用于循环播放或调度）
 *
 * 设计说明： 当前属于“轻量全局状态对象”，适合小型游戏。 后续可升级为 AudioManager / Event-driven Audio System。
 */
const AudioState = {
  /** 是否启用背景音乐 true = 播放 BGM false = 静音 BGM */
  bgmEnabled: true,

  /**
   * BGM 定时器引用
   *
   * 常见用途：
   *
   * - SetInterval / setTimeout 控制循环播放
   * - 或用于调度下一段 BGM clip
   */
  bgmTimer: null,
};

export default AudioState;
