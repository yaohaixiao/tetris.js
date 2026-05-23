import Base from '@/lib/core';
import MOTIFS from '@/lib/services/audio/constants/motifs.js';
import playTone from '@/lib/services/audio/play-tone.js';

/**
 * # 获取当前消行对应的音乐动机类型
 *
 * 将"游戏事件"映射为"音乐表达类型"， 用于驱动消行音效的变奏系统。
 *
 * | 条件                  | 动机类型  | 说明           |
 * | --------------------- | --------- | -------------- |
 * | 全清（Perfect Clear） | `perfect` | 优先级最高     |
 * | 消除 4 行（Tetris）   | `tetris`  | 经典俄罗斯方块 |
 * | 消除 1-3 行           | `combo`   | 普通消除       |
 *
 * @function getMotif
 * @param {number} lines - 本次消除的行数
 * @param {boolean} [isPerfectClear=false] - 是否全清（棋盘清空）. Default is `false`
 * @returns {'combo' | 'tetris' | 'perfect'} 音乐动机类型
 */
const getMotif = (lines, isPerfectClear = false) => {
  // 全清优先级最高
  if (isPerfectClear) {
    return 'perfect';
  }

  // 4 行消除（Tetris）
  if (lines === 4) {
    return 'tetris';
  }

  // 默认普通消除
  return 'combo';
};

/**
 * # 游戏音效集合（Sounds）
 *
 * 统一管理所有俄罗斯方块游戏音效，基于 Web Audio API 播放。 每个音效以方法形式定义，通过事件 `audio:resume:sound`
 * 动态调用。
 *
 * ## 音效列表
 *
 * | 方法               | 触发场景     | 频率     | 时长  |
 * | ------------------ | ------------ | -------- | ----- |
 * | LEVEL_CHANGED      | 等级选择     | 520Hz    | 80ms  |
 * | SWITCH_SCENE       | 场景切换     | 620Hz    | 80ms  |
 * | DIFFICULTY_CHANGED | 难度选择     | 880Hz    | 80ms  |
 * | GAME_STARTED       | 游戏开始     | 1319Hz   | 160ms |
 * | COUNTDOWN          | 倒计时       | 784Hz    | 180ms |
 * | MOVE               | 方块移动     | 330Hz    | 60ms  |
 * | ROTATE             | 方块旋转     | 440Hz    | 60ms  |
 * | DROP               | 快速下落     | 220Hz    | 100ms |
 * | FALL               | 方块落地     | 180Hz    | 200ms |
 * | CLEAR              | 消行（变奏） | 和弦     | 序列  |
 * | LEVEL_UP           | 升级庆祝     | 音阶上行 | 序列  |
 * | PAUSED             | 暂停         | 300Hz    | 150ms |
 * | SECOND_TICK        | 秒针滴答     | 880Hz    | 50ms  |
 * | RESUME             | 恢复游戏     | 400Hz    | 150ms |
 * | GAME_OVER          | 游戏结束     | 下行旋律 | 序列  |
 * | BGM_TOGGLED        | BGM 开关     | 440Hz    | 100ms |
 *
 * @class Sounds
 */
class Sounds extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## 等级选择音效
   *
   * 三角波柔和音效，520Hz，80ms。
   *
   * @returns {void}
   */
  LEVEL_CHANGED = () => {
    playTone(this, 520, 80, { volume: 0.2, wave: 'triangle' });
  };

  /**
   * ## 主菜单/难度选择场景切换音效
   *
   * 三角波音效，620Hz，80ms。
   *
   * @returns {void}
   */
  SWITCH_SCENE = () => {
    playTone(this, 620, 80, { volume: 0.2, wave: 'triangle' });
  };

  /**
   * ## 难度选择音效
   *
   * 三角波音效，880Hz，80ms。
   *
   * @returns {void}
   */
  DIFFICULTY_CHANGED = () => {
    playTone(this, 880, 80, { volume: 0.2, wave: 'triangle' });
  };

  /**
   * ## 等级开始音效
   *
   * 三角波音效，1319Hz，160ms。
   *
   * @returns {void}
   */
  GAME_STARTED = () => {
    playTone(this, 1319, 160, { volume: 0.22, wave: 'triangle' });
  };

  /**
   * ## 开始倒计时音效
   *
   * 正弦波音效，784Hz，180ms，音量较大。
   *
   * @returns {void}
   */
  COUNTDOWN = () => {
    playTone(this, 784, 180, { volume: 0.4, wave: 'sine' });
  };

  /**
   * ## 方块移动音效
   *
   * 330Hz，60ms，默认方波。
   *
   * @returns {void}
   */
  MOVE = () => playTone(this, 330, 60);

  /**
   * ## 方块旋转音效
   *
   * 440Hz，60ms，默认方波。
   *
   * @returns {void}
   */
  ROTATE = () => playTone(this, 440, 60);

  /**
   * ## 方块快速下落音效
   *
   * 220Hz，100ms，默认方波。
   *
   * @returns {void}
   */
  DROP = () => playTone(this, 220, 100);

  /**
   * ## 方块落地音效
   *
   * 180Hz，200ms，默认方波。
   *
   * @returns {void}
   */
  FALL = () => playTone(this, 180, 200);

  /**
   * ## 消行动效音（基于和弦 + 动机系统）
   *
   * 根据消除行数生成不同的音乐动机，并播放对应的和弦音效。 使用 Scheduler.sequence 按时间偏移依次触发三个音轨。
   *
   * ### 和弦库
   *
   * | 索引 | 和弦             | 说明     |
   * | ---- | ---------------- | -------- |
   * | 0    | [440, 587, 698]  | 1 行消除 |
   * | 1    | [587, 698, 880]  | 2 行消除 |
   * | 2    | [698, 780, 1174] | 3 行消除 |
   * | 3    | [787, 880, 1274] | 备用     |
   * | 4    | [840, 980, 1374] | 备用     |
   *
   * @param {number} [lines=1] - 消除行数. Default is `1`
   * @param {boolean} [isPerfectClear=false] - 是否全清. Default is `false`
   * @returns {void}
   */
  CLEAR = (lines = 1, isPerfectClear = false) => {
    // 基础和弦库
    const frequencies = [
      [440, 554, 659], // 0: A4 + C#5 + E5 — 大三和弦（明亮，1行消除）
      [587, 740, 880], // 1: D5 + F#5 + A5 — 大二和弦（温暖，2行消除）
      [523, 622, 784], // 2: C5 + Eb5 + G5 — 小三和弦（蓝调感，3行消除）
      [659, 784, 988], // 3: E5 + G5 + B5 — 挂留感（紧张期待）
      [440, 659, 880], // 4: A4 + E5 + A5 — 纯五度开放和弦（空灵辉煌）
    ];

    // 每个音轨的基础播放参数
    const speeds = [260, 300, 380];
    const volumes = [0.32, 0.3, 0.25];
    const timeouts = [160, 320, 480];

    // 获取当前音乐动机（combo / tetris / perfect）
    const motif = getMotif(lines, isPerfectClear);

    // 动机参数（shift、speed、volume 倍率）
    const cfg = MOTIFS[motif];

    // 安全索引（防止越界）
    const index = Math.min(lines, frequencies.length - 1);

    // 基础和弦
    const baseChord = frequencies[index];

    /** 生成最终和弦： shift 控制整体音高偏移（半音单位 ×12） */
    const chord = baseChord.map((freq) => freq + cfg.shift * 12);
    const queue = [];
    const { Context, Scheduler } = this;

    // 逐音轨构建播放序列
    for (const [i, freq] of chord.entries()) {
      queue.push({
        fn: () => {
          const now = Context.currentTime;

          playTone(this, freq, speeds[i] * cfg.speed, {
            volume: volumes[i] * cfg.volume,
            startTime: now + timeouts[i] / 1000,
          });
        },
      });
    }

    // 按时间偏移顺序播放和弦
    Scheduler.sequence(queue);
  };

  /**
   * ## 升级庆祝音效
   *
   * 演奏上行音阶（C5 → E6），营造升级的成就感和喜悦情绪。 通过 Scheduler.sequence 按精确时间偏移依次触发。
   *
   * @returns {void}
   */
  LEVEL_UP = () => {
    const { Context, Scheduler } = this;
    const now = Context.currentTime;

    Scheduler.sequence([
      { fn: () => playTone(this, 523, 220) },
      { fn: () => playTone(this, 587, 220, { startTime: now + 0.26 }) },
      { fn: () => playTone(this, 659, 240, { startTime: now + 0.52 }) },
      {
        delay: 260,
        fn: () => playTone(this, 784, 260, { startTime: now + 0.78 }),
      },
      { fn: () => playTone(this, 880, 280, { startTime: now + 1.06 }) },
      { fn: () => playTone(this, 1047, 320, { startTime: now + 1.36 }) },
      { fn: () => playTone(this, 1175, 360, { startTime: now + 1.7 }) },
      { fn: () => playTone(this, 1319, 480, { startTime: now + 2.08 }) },
    ]);
  };

  /**
   * ## 暂停游戏音效
   *
   * 300Hz，150ms。
   *
   * @returns {void}
   */
  PAUSED = () => playTone(this, 300, 150);

  /**
   * ## 秒针走动音效
   *
   * 三角波，880Hz，50ms，低音量。暂停时每秒播放一次。
   *
   * @returns {void}
   */
  SECOND_TICK = () => {
    playTone(this, 880, 50, { volume: 0.085, wave: 'triangle' });
  };

  /**
   * ## 恢复游戏音效
   *
   * 400Hz，150ms。
   *
   * @returns {void}
   */
  RESUME = () => playTone(this, 400, 150);

  /**
   * ## 游戏结束音效（悲伤旋律）
   *
   * 下行旋律（E4 → D4 → C4），营造游戏结束的失落感。
   *
   * @returns {void}
   */
  GAME_OVER = () => {
    const { Context, Scheduler } = this;
    const now = Context.currentTime;

    Scheduler.sequence([
      { fn: () => playTone(this, 330, 200) },
      { fn: () => playTone(this, 294, 300, { startTime: now + 0.21 }) },
      { fn: () => playTone(this, 262, 500, { startTime: now + 0.52 }) },
    ]);
  };

  /**
   * ## 背景音乐开关音效
   *
   * 440Hz，100ms。
   *
   * @returns {void}
   */
  BGM_TOGGLED = () => playTone(this, 440, 100);
}

export default Sounds;
