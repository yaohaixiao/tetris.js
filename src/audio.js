const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
const audioCtx = new AudioContext();

let bgmTimer = null;
let bgmEnabled = true;

// 播放单音
export function playTone(freq, dur, vol = 0.1, wave = 'square') {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = wave;
  osc.frequency.value = freq;
  gain.gain.value = vol;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();

  setTimeout(() => osc.stop(), dur);
}

// 音效集合
export const sounds = {
  move: () => playTone(330, 60),
  rotate: () => playTone(440, 60),
  drop: () => playTone(220, 100),
  // 方块落下的声音
  fall: () => playTone(180, 200),
  clear: () => {
    playTone(523, 80);
    setTimeout(() => playTone(659, 100), 90);
    setTimeout(() => playTone(784, 140), 180);
  },
  gameOver: () => {
    playTone(330, 200);
    setTimeout(() => playTone(294, 300), 210);
    setTimeout(() => playTone(262, 500), 520);
  },
  pause: () => playTone(300, 150),
  resume: () => playTone(400, 150),
  levelStart: () => playTone(523, 200),
  bgmToggle: () => playTone(440, 100),
  levelSelect: () => playTone(523, 80, 0.1, 'sine'),
};

// BGM循环播放
function loopPlayBGM(i, m) {
  if (i >= m.length) {
    i = 0;
  }

  playTone(m[i], 110, 0.05);
  bgmTimer = setTimeout(() => loopPlayBGM(i + 1, m), 130);
}

// 播放BGM
export function playBGM() {
  if (!bgmEnabled) {
    return false;
  }

  stopBGM();

  const m = [
    659, 659, 587, 659, 784, 880, 523, 523, 440, 523, 659, 784, 659, 659, 587,
    659, 784, 880, 988, 880, 784, 659, 880, 784, 659, 587, 523, 587, 659, 784,
    659, 587,
  ];

  loopPlayBGM(0, m);
}

// 停止BGM
export function stopBGM() {
  if (bgmTimer) {
    clearTimeout(bgmTimer);
  }

  bgmTimer = null;
}

// 切换BGM
export function toggleBGM() {
  bgmEnabled = !bgmEnabled;
  sounds.bgmToggle();

  if (bgmEnabled) {
    playBGM();
  } else {
    stopBGM();
  }
}
