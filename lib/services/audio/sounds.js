import Base from '@/lib/core';
import MOTIFS from '@/lib/services/audio/constants/motifs.js';
import CHORD_SETS from '@/lib/services/audio/constants/clear/chord-sets.js';
import PARAM_SETS from '@/lib/services/audio/constants/clear/param-sets.js';
import playTone from '@/lib/services/audio/play-tone.js';

/**
 * ============================================================
 *
 * # 获取当前消行对应的音乐动机类型
 *
 * ============================================================
 *
 * 将游戏事件映射为音乐表达类型， 用于驱动消行音效的变奏系统。
 *
 * | 条件                  | 动机类型 | 说明           |
 * | :-------------------- | :------- | :------------- |
 * | 全清（Perfect Clear） | perfect  | 优先级最高     |
 * | 消除 4 行（Tetris）   | tetris   | 经典俄罗斯方块 |
 * | 消除 1-3 行           | combo    | 普通消除       |
 *
 * @function getMotif
 * @param {number} lines - 本次消除的行数
 * @param {boolean} [isPerfectClear=false] - 是否全清. Default is `false`
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
 * ============================================================
 *
 * # 模块：Sounds 游戏音效集合
 *
 * ============================================================
 *
 * 统一管理所有俄罗斯方块游戏音效，基于 Web Audio API 播放。 每个音效以方法形式定义，通过事件动态调用。
 *
 * ## 音效列表
 *
 * | 方法               | 触发场景     | 频率     | 时长  |
 * | :----------------- | :----------- | :------- | :---- |
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
 * @augments Base
 * @class Sounds
 */
class Sounds extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置对象
   */
  constructor(options) {
    super(options);
  }

  /**
   * ## LEVEL_CHANGED：等级选择音效
   *
   * 三角波柔和音效，520Hz，80ms。
   *
   * @returns {void}
   */
  LEVEL_CHANGED = () => {
    playTone(this, 520, 80, { volume: 0.2, wave: 'triangle' });
  };

  /**
   * ## SWITCH_SCENE：场景切换音效
   *
   * 三角波音效，620Hz，100ms。
   *
   * @returns {void}
   */
  SWITCH_SCENE = () => {
    playTone(this, 620, 100, { volume: 0.25, wave: 'triangle' });
  };

  /**
   * ## DIFFICULTY_CHANGED：难度选择音效
   *
   * 三角波音效，880Hz，80ms。
   *
   * @returns {void}
   */
  DIFFICULTY_CHANGED = () => {
    playTone(this, 880, 80, { volume: 0.2, wave: 'triangle' });
  };

  /**
   * ## GAME_STARTED：等级开始音效
   *
   * 三角波音效，1319Hz，160ms。
   *
   * @returns {void}
   */
  GAME_STARTED = () => {
    playTone(this, 1319, 160, { volume: 0.22, wave: 'triangle' });
  };

  /**
   * ## COUNTDOWN：开始倒计时音效
   *
   * 正弦波音效，784Hz，180ms，音量较大。
   *
   * @returns {void}
   */
  COUNTDOWN = () => {
    playTone(this, 784, 180, { volume: 0.4, wave: 'sine' });
  };

  /**
   * ## MOVE：方块移动音效
   *
   * 330Hz，60ms，默认方波。
   *
   * @returns {void}
   */
  MOVE = () => playTone(this, 330, 60);

  /**
   * ## ROTATE：方块旋转音效
   *
   * 440Hz，60ms，默认方波。
   *
   * @returns {void}
   */
  ROTATE = () => playTone(this, 440, 60);

  /**
   * ## DROP：方块快速下落音效
   *
   * 220Hz，100ms，默认方波。
   *
   * @returns {void}
   */
  DROP = () => playTone(this, 220, 100);

  /**
   * ## FALL：方块落地音效
   *
   * 180Hz，200ms，默认方波。
   *
   * @returns {void}
   */
  FALL = () => playTone(this, 180, 200);

  /**
   * ## CLEAR：消行动效音（16 套和弦 + 动机系统）
   *
   * 根据消除行数、当前等级和是否全清， 选择不同的和弦方案和配器参数， 使用 Scheduler.sequence 按时间偏移依次触发三个音轨。
   *
   * ### 等级配色
   *
   * 每 16 关从 CHORD_SETS 和 PARAM_SETS 中各选一套， 共 16 套（256 / 16），与 BGM 同步切换。
   *
   * ### 动机系统
   *
   * | 条件                  | 动机类型 | shift | speed | volume |
   * | :-------------------- | :------- | :---- | :---- | :----- |
   * | 全清（Perfect Clear） | perfect  | +4    | ×2.0  | ×1.5   |
   * | 消除 4 行（Tetris）   | tetris   | +2    | ×1.5  | ×1.2   |
   * | 消除 1-3 行           | combo    | 0     | ×1.0  | ×1.0   |
   *
   * ### 音轨结构
   *
   * - 音轨 0：160ms 后开始，speed=260ms，volume=0.32
   * - 音轨 1：320ms 后开始，speed=300ms，volume=0.30
   * - 音轨 2：480ms 后开始，speed=380ms，volume=0.25
   *
   * @param {number} [lines=1] - 消除行数（1-5）. Default is `1`
   * @param {number} [level=1] - 当前等级. Default is `1`
   * @param {boolean} [isPerfectClear=false] - 是否全清. Default is `false`
   * @returns {void}
   */
  CLEAR = (lines = 1, level = 1, isPerfectClear = false) => {
    const setIndex = Math.min(Math.floor((level - 1) / 16), 15);
    const frequencies = CHORD_SETS[setIndex];
    const params = PARAM_SETS[setIndex];

    const speeds = [260, 300, 380];
    const volumes = [0.32, 0.3, 0.25];
    const timeouts = [160, 320, 480];

    const motif = getMotif(lines, isPerfectClear);
    const cfg = MOTIFS[motif];

    const index = Math.min(lines, frequencies.length - 1);
    const baseChord = frequencies[index].filter((f) => f > 0);

    const chord = baseChord.map((freq) => freq + cfg.shift * 12);
    const queue = [];
    const { Context, Scheduler } = this;

    for (const [i, freq] of chord.entries()) {
      queue.push({
        fn: () => {
          const now = Context.currentTime;
          playTone(this, freq, speeds[i] * cfg.speed * params.spdMul, {
            volume: volumes[i] * cfg.volume * params.volMul,
            wave: params.wave,
            startTime: now + timeouts[i] / 1000,
          });
        },
      });
    }

    Scheduler.sequence(queue);
  };

  /**
   * ## LEVEL_UP：升级庆祝音效
   *
   * 演奏上行音阶（C5 → E6），营造升级的成就感和喜悦情绪。
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
   * ## PAUSED：暂停游戏音效
   *
   * 300Hz，150ms。
   *
   * @returns {void}
   */
  PAUSED = () => playTone(this, 300, 150);

  /**
   * ## SECOND_TICK：秒针走动音效
   *
   * 三角波，880Hz，50ms，低音量。暂停时每秒播放一次。
   *
   * @returns {void}
   */
  SECOND_TICK = () => {
    playTone(this, 880, 50, { volume: 0.085, wave: 'triangle' });
  };

  /**
   * ## RESUME：恢复游戏音效
   *
   * 400Hz，150ms。
   *
   * @returns {void}
   */
  RESUME = () => playTone(this, 400, 150);

  /**
   * ## GAME_OVER：游戏结束音效（悲伤旋律）
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
   * ## GARBAGE_WARNING：垃圾行预警音效
   *
   * 降调警示音，三声递减（900→700→500Hz），营造紧迫危机感。
   *
   * @returns {void}
   */
  GARBAGE_WARNING = () => {
    const { Context, Scheduler } = this;
    const now = Context.currentTime;

    Scheduler.sequence([
      { fn: () => playTone(this, 900, 100, { volume: 0.3, wave: 'square' }) },
      {
        fn: () =>
          playTone(this, 700, 100, {
            volume: 0.3,
            wave: 'square',
            startTime: now + 0.1,
          }),
      },
      {
        fn: () =>
          playTone(this, 500, 120, {
            volume: 0.25,
            wave: 'square',
            startTime: now + 0.2,
          }),
      },
    ]);
  };

  /**
   * ## GARBAGE_RECEIVED：垃圾行插入音效
   *
   * 两段式低沉下行音效，模拟垃圾行从底部推入的沉重感。
   *
   * @returns {void}
   */
  GARBAGE_RECEIVED = () => {
    const { Context, Scheduler } = this;
    const now = Context.currentTime;

    Scheduler.sequence([
      { fn: () => playTone(this, 250, 80, { volume: 0.22, wave: 'square' }) },
      {
        fn: () =>
          playTone(this, 150, 120, {
            volume: 0.18,
            wave: 'square',
            startTime: now + 0.08,
          }),
      },
    ]);
  };

  /**
   * ## GAMEPAD_NOTIFY：手柄连接通知音效
   *
   * 六段短音，C5 和 D5 交替， 与闪烁动画的 6 帧完全同步。
   *
   * ### 时间线
   *
   * | 时间   | 音高 | 动画帧 |
   * | :----- | :--- | :----- |
   * | 0ms    | C5   | 显     |
   * | 200ms  | D5   | 隐     |
   * | 400ms  | C5   | 显     |
   * | 600ms  | D5   | 隐     |
   * | 800ms  | C5   | 显     |
   * | 1000ms | D5   | 隐     |
   * | 1200ms | —    | 结束   |
   *
   * @returns {void}
   */
  GAMEPAD_NOTIFY = () => {
    const { Context, Scheduler } = this;
    const now = Context.currentTime;

    Scheduler.sequence([
      {
        fn: () => playTone(this, 523, 60, { volume: 0.2, wave: 'square' }),
      },
      {
        fn: () =>
          playTone(this, 587, 60, {
            volume: 0.2,
            wave: 'square',
            startTime: now + 0.2,
          }),
      },
      {
        fn: () =>
          playTone(this, 523, 60, {
            volume: 0.2,
            wave: 'square',
            startTime: now + 0.4,
          }),
      },
      {
        fn: () =>
          playTone(this, 587, 60, {
            volume: 0.2,
            wave: 'square',
            startTime: now + 0.6,
          }),
      },
      {
        fn: () =>
          playTone(this, 523, 60, {
            volume: 0.2,
            wave: 'square',
            startTime: now + 0.8,
          }),
      },
      {
        fn: () =>
          playTone(this, 587, 60, {
            volume: 0.2,
            wave: 'square',
            startTime: now + 1,
          }),
      },
    ]);
  };

  /**
   * ## BGM_TOGGLED：背景音乐开关音效
   *
   * 440Hz，100ms。
   *
   * @returns {void}
   */
  BGM_TOGGLED = () => playTone(this, 440, 100);
}

export default Sounds;
