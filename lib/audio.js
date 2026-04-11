const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
const audioCtx = new AudioContext();

let bgmTimer = null;
let bgmEnabled = true;

/**
 * # 游戏音效集合
 *
 * 统一管理所有 Tetris 游戏音效，基于 Web Audio 播放
 *
 * @typedef {object} GameSounds
 * @property {Function} move - 移动方块音效
 * @property {Function} rotate - 旋转方块音效
 * @property {Function} drop - 快速下落音效
 * @property {Function} fall - 方块落地音效
 * @property {Function} clear - 消除行音效（三连音）
 * @property {Function} gameOver - 游戏结束音效（降调）
 * @property {Function} pause - 暂停游戏音效
 * @property {Function} resume - 恢复游戏音效
 * @property {Function} levelStart - 等级开始/升级音效
 * @property {Function} levelSelect - 等级选择界面音效
 * @property {Function} levelUp - 升级特效界面音效
 * @property {Function} bgmToggle - 背景音乐开关音效
 */

/**
 * # 全局游戏音效对象
 *
 * @type {GameSounds}
 */
export const sounds = {
  // 左右移动
  move: () => playTone(330, 60),
  // 旋转方块
  rotate: () => playTone(440, 60),
  // 快速下落
  drop: () => playTone(220, 100),
  // 方块落地
  fall: () => playTone(180, 200),
  // 消除行（三连音旋律）
  clear: () => {
    playTone(587, 220, 0.35, 'square');
    setTimeout(() => playTone(698, 260, 0.32, 'square'), 160);
    setTimeout(() => playTone(880, 300, 0.3, 'square'), 320);
    setTimeout(() => playTone(1174, 380, 0.25, 'square'), 480);
  },
  // 游戏结束（悲伤旋律）
  gameOver: () => {
    playTone(330, 200);
    setTimeout(() => playTone(294, 300), 210);
    setTimeout(() => playTone(262, 500), 520);
  },
  // 暂停
  pause: () => playTone(300, 150),
  // 恢复游戏
  resume: () => playTone(400, 150),
  // 等级开始 / 升级
  levelStart: () => playTone(523, 200),
  // 等级选择界面（正弦波柔和音效）
  levelSelect: () => playTone(523, 80, 0.1, 'sine'),
  // 升级清除界面音效
  levelUp: () => {
    playTone(523, 220);
    setTimeout(() => playTone(587, 220), 260);
    setTimeout(() => playTone(659, 240), 520);
    setTimeout(() => playTone(784, 260), 780);
    setTimeout(() => playTone(880, 280), 1060);
    setTimeout(() => playTone(1047, 320), 1360);
    setTimeout(() => playTone(1175, 360), 1700);
    setTimeout(() => playTone(1319, 480), 2080);
  },
  // 背景音乐开关
  bgmToggle: () => playTone(440, 100),
};

/**
 * # 音频振荡器波形类型（等同于原生 OscillatorType）
 *
 * @typedef {'sine' | 'square' | 'triangle' | 'sawtooth'} OscillatorType
 */

/**
 * # 播放电子音调（用于游戏音效）
 *
 * 创建振荡器生成指定频率、时长、音量和波形的音频
 *
 * @function playTone
 * @param {number} freq - 音调频率（赫兹 Hz）
 * @param {number} dur - 持续时间（毫秒 ms）
 * @param {number} [vol=0.1] - 音量大小，默认 0.1. Default is `0.1`
 * @param {OscillatorType} [wave='square'] - 波形类型，默认 square（方波，适合复古游戏）. Default
 *   is `'square'`
 * @returns {void}
 */
export function playTone(freq, dur, vol = 0.1, wave = 'square') {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = wave;
  osc.frequency.value = freq;
  gain.gain.value = vol;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();

  // 到达指定时长后停止发声
  setTimeout(() => osc.stop(), dur);
}

/**
 * # 背景音乐 BGM 自动循环播放
 *
 * 递归遍历音符数组，循环播放背景音乐旋律
 *
 * @function loopPlayBGM
 * @param {number} i - 当前播放的音符索引
 * @param {number[]} m - 音符频率数组
 * @returns {void}
 */
const loopPlayBGM = (i, m) => {
  // 如果索引超出音符长度，重置为 0，实现循环播放
  if (i >= m.length) {
    i = 0;
  }

  // 播放当前音符（低音量，BGM 背景音）
  playTone(m[i], 110, 0.05);

  // 延迟后播放下一个音符，形成连续 BGM 旋律
  bgmTimer = setTimeout(() => loopPlayBGM(i + 1, m), 130);
};

/**
 * # 停止当前播放的背景音乐 BGM
 *
 * 清除 BGM 定时器，终止音频播放循环
 *
 * @function stopBGM
 * @returns {void}
 */
export function stopBGM() {
  // 如果存在 BGM 定时器，清除定时器停止播放
  if (bgmTimer) {
    clearTimeout(bgmTimer);
  }

  // 重置定时器变量为 null
  bgmTimer = null;
}

/**
 * #播放游戏背景音乐 (BGM) 先停止当前可能正在播放的BGM，然后启动新的旋律循环
 *
 * @function playBGM
 * @returns {boolean | undefined} 如果BGM未启用则返回false，否则无返回值
 */
export function playBGM() {
  // 如果BGM未开启，直接退出并返回false
  if (!bgmEnabled) {
    return false;
  }

  // 先停止已存在的BGM，防止重叠播放
  stopBGM();

  // BGM 旋律音符频率数组
  const m = [
    659, 659, 587, 659, 784, 880, 523, 523, 440, 523, 659, 784, 659, 659, 587,
    659, 784, 880, 988, 880, 784, 659, 880, 784, 659, 587, 523, 587, 659, 784,
    659, 587,
  ];

  // 从第0个音符开始循环播放旋律
  loopPlayBGM(0, m);
}

/**
 * # 切换背景音乐（开启/关闭）
 *
 * 反转 BGM 启用状态，播放切换音效，并根据状态播放或停止 BGM
 *
 * @function toggleBGM
 * @returns {void}
 */
export function toggleBGM() {
  // 反转背景音乐的启用状态
  bgmEnabled = !bgmEnabled;
  // 播放切换提示音
  sounds.bgmToggle();

  // 根据新状态决定播放或停止背景音乐
  if (bgmEnabled) {
    playBGM();
  } else {
    stopBGM();
  }
}
